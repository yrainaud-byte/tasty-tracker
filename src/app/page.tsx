import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ActiveTimer } from '@/components/time/active-timer'
import { QuickEntry } from '@/components/time/quick-entry'
import { ProjectListWidget } from '@/components/dashboard/project-list-widget'
import { MyTasksWidget } from '@/components/dashboard/my-tasks-widget'
import { WorkloadView } from '@/components/dashboard/workload-view'
import { Clock, Briefcase, Euro } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // 1. Profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 2. Timer actif
  const { data: activeTimer } = await supabase
    .from('active_timers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // 3. Projets
  const { data: projects } = await supabase
    .from('projects')
    .select('*, client:clients(id, name, company)')
    .order('created_at', { ascending: false })

  // 4. Statistiques du jour
  const today = new Date().toISOString().split('T')[0]
  const { data: todayEntries } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)

  const todayMinutes = todayEntries?.reduce((sum, e) => sum + e.duration_minutes, 0) || 0
  const todayBillableMinutes = todayEntries?.filter(e => e.is_billable).reduce((sum, e) => sum + e.duration_minutes, 0) || 0
  const hourlyRate = profile?.hourly_rate || 0
  const billableAmount = (todayBillableMinutes / 60) * hourlyRate

  // 5. Charge de Travail (Workload)
  const { data: allTasks } = await supabase
    .from('project_tasks')
    .select('*')
    .neq('status', 'done') 
  
  // 👇 CORRECTION ICI : on utilise 'id' au lieu de 'user_id'
  const { data: teamMembers } = await supabase
    .from('profiles')
    .select('id, full_name') 

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen flex flex-col">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Bonjour, {profile?.full_name?.split(' ')[0] || 'Toi'} 👋</h1>
          <p className="text-slate-500">Prêt à créer quelque chose de génial aujourd'hui ?</p>
        </div>
        <div className="text-sm font-medium text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-blue-100 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{(todayMinutes / 60).toFixed(1)}h</div>
          <div className="text-sm text-slate-500">Travaillées aujourd'hui</div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-purple-100 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{projects?.filter(p => p.status === 'active' || p.status === 'production').length || 0}</div>
          <div className="text-sm text-slate-500">Projets en cours</div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-orange-100 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Euro className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{billableAmount.toFixed(0)}€</div>
          <div className="text-sm text-slate-500">Générés aujourd'hui (est.)</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-8 flex flex-col">
          
          <ActiveTimer activeTimer={activeTimer} userId={user.id} projects={projects || []} />

          {/* Vue Charge de travail */}
          <WorkloadView 
            tasks={allTasks || []} 
            members={teamMembers || []} 
          />

          {/* Liste des projets */}
          <div className="flex flex-col flex-1 min-h-[400px]">
             <ProjectListWidget projects={projects || []} />
          </div>

        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          <QuickEntry userId={user.id} projects={projects || []} />
          <MyTasksWidget />
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Mon Statut</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${activeTimer ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                {activeTimer ? 'Occupé' : 'Disponible'}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="font-medium text-slate-900 text-sm">{profile?.full_name || 'Utilisateur'}</div>
                <div className="text-xs text-slate-500">Freelance / Admin</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
