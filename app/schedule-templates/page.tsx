import { redirect } from 'next/navigation'

// This was a second copy of /schedules: same API, same "Schedule Templates"
// heading, and a second sidebar entry also labeled "Schedules". /schedules is
// the one the rest of the app links to.
export default function ScheduleTemplatesRedirect() {
  redirect('/schedules')
}
