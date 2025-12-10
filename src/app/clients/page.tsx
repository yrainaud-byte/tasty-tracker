import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientList } from '@/components/clients/client-list' // Nouveau composant
import { CreateClientForm } from '@/components/clients/create-client-form'
import { Users } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Récupération des clients AVEC leurs projets complets
  // On triera côté client pour l'instant pour la recherche instantanée
  const { data: clients } = await supabase
    .from('clients')
    .select('*, projects(*)')
    .order('name')

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white">
      
      {/* Header Page */}
      <div className="px-8 py-6 border-b border-slate-100 flex-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="w-6 h-6 text-slate-400" />
            Clients
            <span className="bg-slate-100 text-slate-500 text-sm font-normal px-2.5 py-0.5 rounded-full">
              {clients?.length || 0}
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 ml-9">Gérez votre portefeuille client.</p>
        </div>

        {/* Le bouton créer reste ici */}
        <CreateClientForm />
      </div>

      {/* Zone Contenu - On passe les données au composant de liste */}
      <div className="flex-1 overflow-hidden p-8 bg-slate-50/30">
        <ClientList initialClients={clients || []} />
      </div>

    </div>
  )
}
