import { GoogleGenerativeAI, GoogleGenerativeAIAbortError, type ModelParams } from '@google/generative-ai'

/**
 * The Gemini model every AI feature uses, in one place. It used to be written
 * out at 25 call sites in 20 files, so a retired model meant editing all of
 * them (July 2026, PR #530). Change it here and nowhere else.
 */
export const GEMINI_MODEL = 'gemini-3.6-flash'

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
