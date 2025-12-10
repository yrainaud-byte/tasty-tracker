'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Zap, Loader2 } from 'lucide-react'

export function QuickEntry({ userId, projects }: { userId: string; projects: any[] }) {
  const [duration, setDuration] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  const clients = Array.from(new Map(
    projects?.filter((p: any) => p.client).map((p: any) => [p.client.id, p.client])
  ).values())

  const filteredProjects = selectedClient 
    ? projects?.filter((p: any) => p.client_id === selectedClient)
    : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!duration || !selectedProject) return
    
    setLoading(true)
    try {
      const durationMinutes = Math.round(parseFloat(duration) * 60)
      await supabase.from('time_entries').insert({
        user_id: userId,
        project_id: selectedProject,
        duration_minutes: durationMinutes,
        date: date,
        is_billable: true,
        is_timer: false
      })
      
      setDuration('')
      setSelectedClient('')
      setSelectedProject('')
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-500 fill-current" />
        Saisie Rapide
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Client</label>
          <select
            value={selectedClient}
            onChange={(e) => { setSelectedClient(e.target.value); setSelectedProject(''); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Sélectionner...</option>
            {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        
        {selectedClient && (
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Projet</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Sélectionner...</option>
              {filteredProjects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Durée (h)</label>
            <input
              type="number"
              step="0.25"
              placeholder="ex: 1.5"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedProject || !duration}
          className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium py-2 rounded-lg text-sm transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-3 h-3 animate-spin" />}
          Ajouter le temps
        </button>
      </form>
    </div>
  )
}
