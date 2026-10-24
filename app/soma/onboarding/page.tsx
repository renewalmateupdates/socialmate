import { redirect } from 'next/navigation'

// The identity interview merged into Voice DNA. Its one input Voice DNA did
// not already ask for, example posts (plus free-text house rules), is the
// optional last screen of /soma/voice. Old links land there.
export default function SomaOnboardingMerged() {
  redirect('/soma/voice')
}
