import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectHeader } from '@/components/projects/project-header'
import { ProjectUpdates } from '@/components/projects/project-updates'
import { ProjectFiles } from '@/components/projects/project-files'
import { ProjectMembers } from '@/components/projects/project-members'
import { ProjectTasks } from '@/components/tasks/project-tasks'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*, client:clients(name, company)')
    .eq('id', params.id)
    .single()

  if (!project) redirect('/projects')

  const { data: entries } = await supabase
    .from('time_entries')
    .select('duration_minutes')
    .eq('project_id', params.id)

  const totalMinutes = entries?.reduce((sum, e) => sum + e.duration_minutes, 0) || 0
  project.hours_logged = totalMinutes / 60

  const { data: members } = await supabase
    .from('project_members')
    .select('*, user:profiles(full_name, email)')
    .eq('project_id', params.id)

  const { data: tasks, error: tasksError } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('project_id', params.id)
    .order('created_at', { ascending: false })

  console.log('🔍 DEBUG - Project ID:', params.id)
  console.log('🔍 DEBUG - Tasks loaded:', tasks?.length || 0)
  console.log('🔍 DEBUG - Tasks data:', tasks)
  console.log('🔍 DEBUG - Tasks error:', tasksError)

  const { data: updates } = await supabase
    .from('project_updates')
    .select('*, user:profiles(full_name, email)')
    .eq('project_id', params.id)
    .order('created_at', { ascending: false })

  const { data: files } = await supabase
    .from('project_files')
    .select('*, uploaded_by_user:profiles(full_name)')
    .eq('project_id', params.id)
    .order('created_at', { ascending: false })

  const { data: allUsers } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .order('full_name')

  return (
    <div className="p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProjectHeader project={project} />
        
        <ProjectTasks 
          projectId={params.id} 
          tasks={tasks || []} 
          members={members || []}
          userId={user.id}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProjectUpdates projectId={params.id} updates={updates || []} userId={user.id} />
          </div>
          
          <div className="space-y-6">
            <ProjectMembers 
              projectId={params.id} 
              members={members || []} 
              allUsers={allUsers || []}
            />
            <ProjectFiles 
              projectId={params.id} 
              files={files || []} 
              userId={user.id}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
