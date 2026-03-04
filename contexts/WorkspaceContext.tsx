'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

type Plan = 'free' | 'pro' | 'agency'

type Workspace = {
  id: string
  name: string
  client_name: string | null
  is_personal: boolean
  slug: string | null
}

type WorkspaceContextType = {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  setActiveWorkspace: (w: Workspace) => void
  plan: Plan
  creditsUsed: number
  creditsTotal: number
  seatsUsed: number
  seatsTotal: number
  platformsConnected: number
  refreshData: () => void
  loading: boolean
}

export const PLAN_CONFIG: Record<Plan, { credits: number; seats: number; label: string }> = {
  free:   { credits: 100,  seats: 2,    label: 'Free'   },
  pro:    { credits: 500,  seats: 5,    label: 'Pro'    },
  agency: { credits: 9999, seats: 9999, label: 'Agency' },
}

export const PLATFORMS_TOTAL = 16

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaces: [],
  activeWorkspace: null,
  setActiveWorkspace: () => {},
  plan: 'free',
  creditsUsed: 0,
  creditsTotal: 100,
  seatsUsed: 1,
  seatsTotal: 2,
  platformsConnected: 0,
  refreshData: () => {},
  loading: true,
})

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null)
  const [plan, setPlan] = useState<Plan>('free')
  const [creditsUsed, setCreditsUsed] = useState(0)
  const [seatsUsed, setSeatsUsed] = useState(1)
  const [platformsConnected, setPlatformsConnected] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    // Workspaces
    const { data: wsData } = await supabase
      .from('workspaces')
      .select('id, name, client_name, is_personal, slug')
      .order('is_personal', { ascending: false })

    if (wsData && wsData.length > 0) {
      setWorkspaces(wsData)
      const personal = wsData.find(w => w.is_personal) || wsData[0]
      setActiveWorkspaceState(prev => prev ?? personal)
    }

    // Plan + credits
    const { data: settings } = await supabase
      .from('user_settings')
      .select('plan, ai_credits_used')
      .eq('user_id', user.id)
      .single()

    if (settings) {
      setPlan((settings.plan as Plan) || 'free')
      setCreditsUsed(settings.ai_credits_used || 0)
    }

    // Team seats — owner always counts as 1
    const { count: teamCount } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    setSeatsUsed((teamCount || 0) + 1)

    // Platforms connected
    const { count: platformCount } = await supabase
      .from('connected_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    setPlatformsConnected(platformCount || 0)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const config = PLAN_CONFIG[plan]

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      activeWorkspace,
      setActiveWorkspace: setActiveWorkspaceState,
      plan,
      creditsUsed,
      creditsTotal: config.credits,
      seatsUsed,
      seatsTotal: config.seats,
      platformsConnected,
      refreshData: fetchData,
      loading,
    }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export const useWorkspace = () => useContext(WorkspaceContext)