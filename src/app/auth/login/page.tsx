import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          🎬 Tasty Agency Tracker
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Bienvenue, {profile?.full_name || user.email} !
          </h2>
          <p className="text-gray-600">
            Email : {user.email}
          </p>
          <p className="text-gray-600">
            Rôle : {profile?.role || 'membre'}
          </p>
          <p className="text-gray-600">
            Taux horaire : {profile?.hourly_rate}€/h
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">✅ Application fonctionnelle !</h3>
          <p className="text-gray-600">
            La connexion à Supabase fonctionne parfaitement.
          </p>
        </div>
      </div>
    </div>
  )
}
