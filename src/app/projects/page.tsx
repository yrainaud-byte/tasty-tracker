import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectsList } from '@/components/projects/projects-list'
import { CreateProjectForm } from '@/components/projects/create-project-form'

export default async function ProjectsPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*, client:clients(name, company)')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projets</h1>
          <p className="text-gray-600 mt-1">Gérez vos projets</p>
        </div>

        <CreateProjectForm />
        
        <ProjectsList projects={projects || []} />
      </div>
    </div>
  )
}
