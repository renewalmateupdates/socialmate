import { GoogleGenerativeAI, GoogleGenerativeAIAbortError, type ModelParams } from '@google/generative-ai'

/**
 * The Gemini model every AI feature uses, in one place. It used to be written
 * out at 25 call sites in 20 files, so a retired model meant editing all of
 * them (July 2026, PR #530). Change it here and nowhere else.
 *
 * gemini-3.8-flash since Nov 19, 2026. That week gemini-3.6-flash stopped
 * answering: requests hung with no reply while the key still listed the model
 * and Google's status page said all was well. Google Cloud retired 3.6 Flash
 * on Nov 19, 2026 and names 3.8 Flash as the replacement; on the Gemini API,
 * 3.8 Flash is the stable Flash model (GA since Sept 2) and requests for 3.7
 * Flash are already routed to it. No call site sets temperature, topP, topK or
 * a thinking setting, the parameters Google's 3.8 migration guide says to
 * remove or change, so the swap needs nothing else.
 *
 * When this stops answering, /api/admin/health asks every stable Flash model
 * the key can use and lists the ones that replied: pick one of those.
 */
export const GEMINI_MODEL = 'gemini-3.8-flash'

/**
 * How long a request a person is waiting on gives Gemini to answer. A normal
 * answer takes a few seconds. On Nov 19, 2026 Write with AI requests hung until
 * Vercel ended the function at 300 seconds (FUNCTION_INVOCATION_TIMEOUT): the
 * person watched "Generating with Gemini..." for five minutes, then saw
 * "Network error", and the catch block that refunds credits never ran. With a
 * limit the SDK aborts the call, the route's catch refunds, and the answer goes
 * back while the function still has time (the AI routes set maxDuration 60).
 */
export const GEMINI_TIMEOUT_MS = 40_000

/** A model handle whose requests give up after `timeoutMs`. */
export function geminiModel(
  apiKey: string,
  params: Omit<ModelParams, 'model'> = {},
  timeoutMs: number = GEMINI_TIMEOUT_MS,
) {
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({ ...params, model: GEMINI_MODEL }, { timeout: timeoutMs })
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
 * check asks these when GEMINI_MODEL fails, and GEMINI_MODEL is one of them.
 */
export function stableFlashModels(names: string[]): string[] {
  return names.filter(n => /^gemini-\d+(\.\d+)?-flash(-lite)?$/.test(n))
}
