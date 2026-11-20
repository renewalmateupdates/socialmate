import {
  GoogleGenerativeAI,
  GoogleGenerativeAIAbortError,
  type GenerateContentResult,
  type GenerativeModel,
  type ModelParams,
} from '@google/generative-ai'

/**
 * The Gemini models every AI feature uses, tried in this order: the first is
 * the one we want, the others answer while it is overloaded. Every call goes
 * through geminiModel() or geminiLongModel() below, so this list is the only
 * place a model is named. (It used to be written out at 25 call sites in 20
 * files, so a retired model meant editing all of them: July 2026, PR #530.)
 *
 * One model was not enough. On Nov 19, 2026 gemini-3.6-flash hung all day with
 * no reply while the key still listed it and Google's status page was green.
 * #816 moved to gemini-3.8-flash, the stable Flash model since Sept 2; that
 * evening 3.8 Flash answered 503 "high demand", then took 12 s to say one
 * word, then said nothing for 20 s, while 3.6 Flash answered in about a second
 * and 3.5 Flash-Lite in half a second. Google sheds load per model (free-tier
 * requests first), so whichever model is busiest fails for a while. With the
 * chain, a busy model costs a few seconds instead of every AI feature.
 *
 * No call site sets temperature, topP, topK or a thinking setting, which 3.8
 * Flash rejects or ignores, so every model here takes the same requests.
 * /api/admin/health asks each one and shows which answered.
 */
export const GEMINI_MODELS: readonly string[] = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite']

/** The model we want: the first in GEMINI_MODELS. */
export const GEMINI_MODEL = GEMINI_MODELS[0]

/**
 * How long a request a person is waiting on gives Gemini, across every model
 * it tries. A normal answer takes a few seconds. On Nov 19, 2026 Write with AI
 * requests hung until Vercel ended the function at 300 seconds
 * (FUNCTION_INVOCATION_TIMEOUT): the person watched "Generating with
 * Gemini..." for five minutes, then saw "Network error", and the catch block
 * that refunds credits never ran. With a limit the call gives up, the route's
 * catch refunds, and the answer goes back while the function still has time
 * (the AI routes set maxDuration 60).
 */
export const GEMINI_TIMEOUT_MS = 40_000

/**
 * The longest one model gets on a request a person is waiting on before the
 * next one is asked. A normal answer takes 2 to 6 seconds.
 */
export const GEMINI_ATTEMPT_MS = 15_000

/**
 * Longer answers (newsletters, blog posts, HERMES emails, SOMA documents) and
 * background work (Inngest steps, crons): 45 seconds in all, which fits inside
 * the 60-second functions the Inngest route and SOMA ingest run in, and 25
 * seconds for each model.
 */
export const GEMINI_LONG_MS = 45_000
export const GEMINI_LONG_ATTEMPT_MS = 25_000

/** With less time than this left, another model is not worth starting. */
const MIN_ATTEMPT_MS = 1_000

type GenerateArgs = Parameters<GenerativeModel['generateContent']>

/** What the call sites use: generateContent, answered by the first model in GEMINI_MODELS that can. */
export type GeminiModel = {
  generateContent: (...args: GenerateArgs) => Promise<GenerateContentResult>
}

/**
 * A model handle for a request a person is waiting on. Each model in
 * GEMINI_MODELS gets up to `attemptMs`, all of them together `timeoutMs`, and a
 * quick failure (503, 429, 404) moves on at once. When every model fails, the
 * last error is thrown, so the routes' catch blocks (refund, aiFailureMessage)
 * work as before.
 */
export function geminiModel(
  apiKey: string,
  params: Omit<ModelParams, 'model'> = {},
  timeoutMs: number = GEMINI_TIMEOUT_MS,
  attemptMs: number = GEMINI_ATTEMPT_MS,
): GeminiModel {
  const client = new GoogleGenerativeAI(apiKey)
  return {
    async generateContent(...args: GenerateArgs) {
      const started = Date.now()
      let lastErr: unknown = new Error('No Gemini model was asked')
      for (let i = 0; i < GEMINI_MODELS.length; i++) {
        const model = GEMINI_MODELS[i]
        const left = timeoutMs - (Date.now() - started)
        const isLast = i === GEMINI_MODELS.length - 1
        const limit = Math.max(1, isLast ? left : Math.min(attemptMs, left))
        try {
          return await client.getGenerativeModel({ ...params, model }, { timeout: limit }).generateContent(...args)
        } catch (err) {
          lastErr = err
          if (!shouldTryNextModel(err)) throw err
          const next = GEMINI_MODELS[i + 1]
          if (!next || timeoutMs - (Date.now() - started) < MIN_ATTEMPT_MS) break
          console.warn(`[gemini] ${model} did not answer (${describeGeminiError(err)}); asking ${next}`)
        }
      }
      throw lastErr
    },
  }
}

/** The same chain for longer answers and background work, with the longer limits above. */
export function geminiLongModel(apiKey: string, params: Omit<ModelParams, 'model'> = {}): GeminiModel {
  return geminiModel(apiKey, params, GEMINI_LONG_MS, GEMINI_LONG_ATTEMPT_MS)
}

/**
 * Whether another model might answer where this one failed. A refused key or
 * project (401, 403) fails the same on every model, so it is thrown at once.
 * Everything else (503 high demand, 429, 500, a 404 for a retired model, a time
 * limit, a dropped connection) is worth asking the next model.
 */
export function shouldTryNextModel(err: unknown): boolean {
  const status = (err as { status?: unknown } | null | undefined)?.status
  return status !== 401 && status !== 403
}

/**
 * What Google said, short enough for a log line and with no key in it: the
 * SDK's "[GoogleGenerativeAI Error]: Error fetching from <url>:" prefix is
 * dropped so the status and reason ("[503 Service Unavailable] This model is
 * currently experiencing high demand") fit.
 */
export function describeGeminiError(err: unknown): string {
  if (isGeminiTimeout(err)) return 'no answer in time'
  const message = (err instanceof Error ? err.message : String(err))
    .replace(/^\[GoogleGenerativeAI Error\]:\s*/, '')
    .replace(/^Error fetching from \S+:\s+/, '')
  return redactKeys(message).slice(0, 160)
}

/**
 * True when a Gemini call ended because it ran past its time limit. The SDK's
 * error classes keep the name "Error", so this checks the class and its text.
 */
export function isGeminiTimeout(err: unknown): boolean {
  if (err instanceof GoogleGenerativeAIAbortError) return true
  const message = err instanceof Error ? err.message : typeof err === 'string' ? err : ''
  return /request aborted|operation was aborted/i.test(message)
}

/** What the person sees when generation failed. The routes refund credits before answering. */
export function aiFailureMessage(err: unknown): string {
  return isGeminiTimeout(err)
    ? 'The AI took too long to answer. Your credits were refunded, so try again in a minute.'
    : 'AI generation failed — credits refunded'
}

/**
 * Google's error text with anything shaped like an API key taken out. Some
 * Google errors name the caller ("Consumer 'api_key:AIza...' has been
 * suspended"), and the admin health check shows these messages.
 */
export function redactKeys(text: string): string {
  return text.replace(/AIza[0-9A-Za-z_-]{20,}/g, '[key removed]')
}

/**
 * The stable text Flash models in a model list, e.g. gemini-3.8-flash or
 * gemini-3.5-flash-lite: no previews, no aliases Google re-points
 * (gemini-flash-latest), no image, speech or live variants. The admin health
 * check asks these when every model in GEMINI_MODELS fails, and each model in
 * GEMINI_MODELS is one of them.
 */
export function stableFlashModels(names: string[]): string[] {
  return names.filter(n => /^gemini-\d+(\.\d+)?-flash(-lite)?$/.test(n))
}
