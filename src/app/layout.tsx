import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tasty Tracker',
  description: 'Gestion de production pour agences créatives',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // Cas 1 : Utilisateur NON connecté (Page de Login)
  // On doit quand même rendre html/body
  if (!user) {
    return (
      <html lang="fr">
        <body className={inter.className}>{children}</body>
      </html>
    )
  }

  // Cas 2 : Utilisateur CONNECTÉ (Dashboard)
  // C'est ici qu'on applique le nouveau design (bg-slate-50)
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden bg-slate-50">
          <Sidebar user={profile} />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
