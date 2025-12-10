'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginButton() {
  const supabase = createClientComponentClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        // C'est ICI qu'on demande l'accès à l'agenda 👇
        scopes: 'https://www.googleapis.com/auth/calendar',
        queryParams: {
          access_type: 'offline', // Pour avoir un Refresh Token (connexion durable)
          prompt: 'consent',      // Force Google à redemander la validation à l'utilisateur
        },
      },
    })
  }

  return (
    <button
      onClick={handleGoogleLogin}
      className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-2 px-4 rounded flex items-center gap-2"
    >
      <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
      Se connecter avec Google
    </button>
  )
}
