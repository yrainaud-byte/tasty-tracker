'use client'
import { Search, Plus, Bell } from 'lucide-react'

export function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200/60 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center flex-1 max-w-2xl">
        <div className="relative group w-full max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="search"
            placeholder="Rechercher (Cmd+K)..."
            className="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-slate-100/50 text-slate-900 placeholder-slate-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-sm sm:text-sm transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-6 w-px bg-slate-200"></div>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 shadow-sm hover:shadow transition-all">
          <Plus className="w-4 h-4" />
          <span>Nouveau</span>
        </button>
      </div>
    </header>
  )
}
