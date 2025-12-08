import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tasty Tracker',
  description: 'Gestion de production vidéo',
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

  // Page de login sans layout
  if (!user) {
    return (
      <html lang="fr">
        <body className={inter.className}>{children}</body>
      </html>
    )
  }

  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar user={profile} />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-gray-50">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
