import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectsKanban } from '@/components/kanban/projects-kanban'

export default async function KanbanPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Charger tous les projets actifs
  const { data: projects } = await supabase
    .from('projects')
    .select('*, client:clients(name, company)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Calculer les heures pour chaque projet
  if (projects) {
    for (const project of projects) {
      const { data: entries } = await supabase
        .from('time_entries')
        .select('duration_minutes')
        .eq('project_id', project.id)

      const totalMinutes = entries?.reduce((sum, e) => sum + e.duration_minutes, 0) || 0
      project.hours_logged = totalMinutes / 60
    }
  }

  return (
    <div className="p-8 h-full">
      <div className="max-w-full mx-auto h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Kanban Projets</h1>
          <p className="text-gray-600 mt-1">Suivez l'avancement de vos projets</p>
        </div>

        <ProjectsKanban projects={projects || []} />
      </div>
    </div>
  )
}
