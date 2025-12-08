'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: '🏠' },
  { name: 'Clients', href: '/clients', icon: '👥' },
  { name: 'Projets', href: '/projects', icon: '🎬' },
  { name: 'Time Tracking', href: '/time', icon: '⏱️' },
]

export function Sidebar({ user }: { user: any }) {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-1 min-h-0 bg-gray-900">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 bg-gray-900 border-b border-gray-800">
          <span className="text-xl font-bold text-white">Tasty Tracker</span>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.full_name || 'User'}</p>
              <p className="text-xs text-gray-400 truncate max-w-[150px]">{user?.email}</p>
            </div>
          </div>
          <button className="mt-3 w-full text-sm text-gray-400 hover:text-white text-left">
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}
