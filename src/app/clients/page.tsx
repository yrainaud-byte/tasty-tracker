import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientsList } from '@/components/clients/clients-list'
import { CreateClientForm } from '@/components/clients/create-client-form'

export default async function ClientsPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: clients } = await supabase
    .from('clients')
    .select('*, projects:projects(count)')
    .order('name')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Gérez vos clients</p>
        </div>

        <CreateClientForm />
        
        <ClientsList clients={clients || []} />
      </div>
    </div>
  )
}
