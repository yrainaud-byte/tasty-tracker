import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TimeFilters } from '@/components/time/time-filters'
import { TimeStats } from '@/components/time/time-stats'
import { TimeEntriesTable } from '@/components/time/time-entries-table'

export default async function TimePage({
  searchParams,
}: {
  searchParams: { period?: string; start?: string; end?: string }
}) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Calculer les dates selon le filtre
  const today = new Date()
  let startDate: string
  let endDate: string = today.toISOString().split('T')[0]

  switch (searchParams.period) {
    case 'week':
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay() + 1) // Lundi
      startDate = weekStart.toISOString().split('T')[0]
      break
    case 'month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
      break
    case 'custom':
      startDate = searchParams.start || today.toISOString().split('T')[0]
      endDate = searchParams.end || today.toISOString().split('T')[0]
      break
    default: // today
      startDate = today.toISOString().split('T')[0]
  }

  // Charger les time entries
  const { data: entries } = await supabase
    .from('time_entries')
    .select('*, project:projects(name, color, client_id, client:clients(id, name, company))')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  // Charger les projets pour l'édition
  const { data: projects } = await supabase
    .from('projects')
    .select('*, client:clients(id, name, company)')
    .eq('status', 'active')
    .order('name')

  // Stats
  const totalMinutes = entries?.reduce((sum, e) => sum + e.duration_minutes, 0) || 0
  const billableMinutes = entries?.filter(e => e.is_billable).reduce((sum, e) => sum + e.duration_minutes, 0) || 0
  const entriesCount = entries?.length || 0

  return (
    <div className="p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-600 mt-1">Consultez et gérez vos pointages</p>
        </div>

        <TimeFilters currentPeriod={searchParams.period || 'today'} />

        <TimeStats 
          totalHours={totalMinutes / 60}
          billableHours={billableMinutes / 60}
          entriesCount={entriesCount}
        />

        <TimeEntriesTable entries={entries || []} projects={projects || []} />
      </div>
    </div>
  )
}
