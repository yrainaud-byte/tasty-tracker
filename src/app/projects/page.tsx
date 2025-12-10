import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectKanban } from '@/components/projects/project-kanban'
import { CreateProjectForm } from '@/components/projects/create-project-form'

export default async function ProjectsPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Chargement de TOUS les projets pour le Kanban complet
  const { data: projects } = await supabase
    .from('projects')
    .select('*, client:clients(id, name, company)')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50/50">
      
      {/* Header Minimaliste */}
      <div className="px-8 py-5 border-b border-slate-200 bg-white flex-none flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          Tableau des Projets
          <span className="bg-slate-100 text-slate-500 text-xs font-normal px-2 py-0.5 rounded-full">
            {projects?.length || 0}
          </span>
        </h1>
        
        {/* Seul outil restant : Créer */}
        <CreateProjectForm />
      </div>

      {/* Zone Kanban Pleine Page */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full overflow-x-auto">
          {/* On passe le Kanban en mode complet (simpleView=false par défaut) */}
          <div className="h-full inline-block min-w-full">
            <ProjectKanban initialProjects={projects || []} />
          </div>
        </div>
      </div>

    </div>
  )
}
