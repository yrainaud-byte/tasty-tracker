import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ActiveTimer } from '@/components/time/active-timer'
import { QuickEntry } from '@/components/time/quick-entry'
import { TimeEntries } from '@/components/time/time-entries'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: activeTimer } = await supabase
    .from('active_timers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: projects } = await supabase
    .from('projects')
    .select('*, client:clients(id, name, company)')
    .eq('status', 'active')
    .order('name')

  const today = new Date().toISOString().split('T')[0]
  const { data: todayEntries } = await supabase
    .from('time_entries')
    .select('*, project:projects(name, color, client:clients(name, company))')
    .eq('user_id', user.id)
    .eq('date', today)
    .order('created_at', { ascending: false })

  const todayMinutes = todayEntries?.reduce((sum, e) => sum + e.duration_minutes, 0) || 0
  const todayBillable = todayEntries?.filter(e => e.is_billable).reduce((sum, e) => sum + e.duration_minutes, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour {profile?.full_name || 'là'} 👋
          </h1>
          <p className="text-gray-600 mt-1">Votre activité du jour</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Heures aujourd'hui</h3>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">{(todayMinutes / 60).toFixed(1)}h</div>
            <p className="text-xs text-gray-500 mt-1">{(todayBillable / 60).toFixed(1)}h facturables</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Pointages</h3>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">{todayEntries?.length || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Aujourd'hui</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Projets actifs</h3>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">{projects?.length || 0}</div>
            <p className="text-xs text-gray-500 mt-1">En cours</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Statut</h3>
              <div className={`w-3 h-3 rounded-full ${activeTimer ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {activeTimer ? '🟢' : '⚪'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {activeTimer ? 'Timer actif' : 'Pas de timer'}
            </p>
          </div>
        </div>

        {/* Timer & Quick Entry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActiveTimer activeTimer={activeTimer} userId={user.id} projects={projects || []} />
          <QuickEntry userId={user.id} projects={projects || []} />
        </div>

        {/* Time Entries */}
        <TimeEntries entries={todayEntries || []} />
      </div>
    </div>
  )
}
