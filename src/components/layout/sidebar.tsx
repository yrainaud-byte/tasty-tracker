'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutGrid, 
  Users, 
  Briefcase, 
  Clock, 
  Zap,
  ChevronsUpDown,
  Search
} from 'lucide-react' // Assurez-vous d'avoir installé lucide-react

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: LayoutGrid },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Projets', href: '/projects', icon: Briefcase },
  { name: 'Temps & Factures', href: '/time', icon: Clock },
]

export function Sidebar({ user }: { user: any }) {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col border-r border-slate-200 bg-slate-50/50">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight">
            <Zap className="fill-current w-5 h-5" />
            <span className="text-slate-900">Tasty<span className="text-blue-600">Tracker</span></span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
            Espace de travail
          </div>

          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all group',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900'
                )}
              >
                <item.icon className={cn(
                  "mr-3 h-4 w-4 transition-colors",
                  isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {item.name}
              </Link>
            )
          })}

          {/* Section Favoris (Statique pour l'instant, pour le look Notion) */}
          <div className="mt-8 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
            Favoris
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 rounded-lg hover:bg-white hover:shadow-sm transition-all text-left">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Campagne Nike
          </button>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200">
          <button className="flex items-center gap-3 w-full p-2 hover:bg-white rounded-lg transition-all text-left group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-700">
                {user?.full_name || 'Utilisateur'}
              </p>
              <p className="text-xs text-slate-500 truncate max-w-[120px]">
                {user?.email}
              </p>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
