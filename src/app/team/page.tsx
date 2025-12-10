import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Mail, Shield, Wallet } from 'lucide-react'
import { CreateMemberDialog } from '@/components/team/create-member-dialog'
import Image from 'next/image'

export default async function TeamPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name')

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header avec Bouton Ajout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Équipe</h1>
          <p className="text-slate-500 mt-1">Gérez les membres, leurs rôles et leurs taux horaires.</p>
        </div>
        <CreateMemberDialog />
      </div>

      {/* Grille des membres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {profiles?.map((profile) => (
          <div key={profile.id} className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all relative overflow-hidden">
            
            {/* Background décoratif */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-full -mr-4 -mt-4 transition-colors group-hover:from-blue-50"></div>

            <div className="relative flex flex-col items-center text-center">
              {/* Avatar avec Image ou Initiale */}
              <div className="w-20 h-20 rounded-full border-4 border-white shadow-md mb-4 bg-slate-100 flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <Image 
                    src={profile.avatar_url} 
                    alt={profile.full_name || 'User'} 
                    width={80} 
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-slate-400">
                    {profile.full_name?.charAt(0).toUpperCase() || '?'}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-lg text-slate-900 mb-1">
                {profile.full_name || 'Utilisateur inconnu'}
              </h3>
              
              <div className="flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide mb-4">
                <Shield className="w-3 h-3" />
                {profile.role || 'membre'}
              </div>

              <div className="w-full space-y-2 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </div>
                  <span className="text-slate-900 truncate max-w-[120px]" title={profile.email}>
                    {profile.email}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Wallet className="w-3.5 h-3.5" /> Taux
                  </div>
                  <span className="font-medium text-slate-900">
                    {profile.hourly_rate ? `${profile.hourly_rate}€/h` : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
