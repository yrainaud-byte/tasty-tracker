'use server'
import { createClient } from '@supabase/supabase-js'

export async function createMemberAction(data: {
  fullName: string
  email: string
  role: string
  hourlyRate: number
  avatarUrl: string | null
}) {
  // On crée un client Supabase avec les droits ADMIN (Service Role)
  // C'est ce client qui a le droit d'inviter des gens !
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // 1. Inviter l'utilisateur dans le système d'Auth
  const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(data.email, {
    data: { full_name: data.fullName }
  })

  if (authError) {
    return { error: `Erreur Auth: ${authError.message}` }
  }

  if (!authData.user) {
    return { error: "Impossible de créer l'utilisateur" }
  }

  // 2. Créer ou mettre à jour son Profil Public avec le VRAI ID
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: authData.user.id, // L'ID officiel généré par Supabase
      full_name: data.fullName,
      email: data.email,
      role: data.role,
      hourly_rate: data.hourlyRate,
      avatar_url: data.avatarUrl,
      updated_at: new Date().toISOString()
    })

  if (profileError) {
    return { error: `Erreur Profil: ${profileError.message}` }
  }

  return { success: true }
}
