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
 * next one is asked. A normal answer takes 2 to 6 seconds; a model that has
 * said nothing after 10 is overloaded. It was 15 s until Nov 20, 2026, when
 * every Write with AI tool took 10 to 32 s because each waited out 3.8 Flash
 * first (the cool-down below spares later requests, but at our traffic Vercel
 * starts fresh instances often, and each one learns on its first request).
 */
export const GEMINI_ATTEMPT_MS = 10_000

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

/**
 * How long a model that just failed is asked last instead of first. Without
 * this, every request waited out the same busy model: on Nov 20, 2026, with
 * 3.8 Flash saying nothing, each Write with AI took 19 s (15 s on 3.8, then
 * 3.6 answered). Vercel runs many requests on one function instance (Fluid
 * compute), so once a request on an instance finds a model failing, the next
 * requests there go straight to one that answers. After the cool-down the
 * model is first again; if it is still failing, one request pays the wait and
 * it goes back to last.
 */
export const GEMINI_COOLDOWN_MS = 3 * 60_000

/** Model name to the time it may be asked first again. Per function instance. */
const coolingUntil = new Map<string, number>()

/** GEMINI_MODELS in the order to ask them now: any that failed in the last few minutes go last, in their usual order. */
export function modelsInOrder(now: number = Date.now()): string[] {
  const ready = GEMINI_MODELS.filter(m => (coolingUntil.get(m) ?? 0) <= now)
  const cooling = GEMINI_MODELS.filter(m => (coolingUntil.get(m) ?? 0) > now)
  return ready.concat(cooling)
}

/** Forget every recent failure (tests, and nothing else, need this). */
export function forgetGeminiFailures(): void {
  coolingUntil.clear()
}

type GenerateArgs = Parameters<GenerativeModel['generateContent']>

/** What the call sites use: generateContent, answered by the first model in GEMINI_MODELS that can. */
export type GeminiModel = {
  generateContent: (...args: GenerateArgs) => Promise<GenerateContentResult>
}

/**
 * A model handle for a request a person is waiting on. Each model in
 * GEMINI_MODELS gets up to `attemptMs`, all of them together `timeoutMs`, and a
 * quick failure (503, 429, 404) moves on at once. A model that failed in the
 * last GEMINI_COOLDOWN_MS is asked last. When every model fails, the last error
 * is thrown, so the routes' catch blocks (refund, aiFailureMessage) work as
 * before.
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
      const order = modelsInOrder(started)
      let lastErr: unknown = new Error('No Gemini model was asked')
      for (let i = 0; i < order.length; i++) {
        const model = order[i]
        const left = timeoutMs - (Date.now() - started)
        const isLast = i === order.length - 1
        const limit = Math.max(1, isLast ? left : Math.min(attemptMs, left))
        try {
          const result = await client.getGenerativeModel({ ...params, model }, { timeout: limit }).generateContent(...args)
          coolingUntil.delete(model)
          return result
        } catch (err) {
          lastErr = err
          if (!shouldTryNextModel(err)) throw err
          coolingUntil.set(model, Date.now() + GEMINI_COOLDOWN_MS)
          const next = order[i + 1]
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
