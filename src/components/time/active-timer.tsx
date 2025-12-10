'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Play, Square, Loader2 } from 'lucide-react'

export function ActiveTimer({ activeTimer, userId, projects }: any) {
  const [timer, setTimer] = useState(activeTimer)
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(false)
  
  // États pour la sélection (si pas de timer actif)
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  
  const supabase = createClient()
  const router = useRouter()

  // Clients uniques & Projets filtrés
  const clients = Array.from(new Map(
    projects?.filter((p: any) => p.client).map((p: any) => [p.client.id, p.client])
  ).values())

  const filteredProjects = selectedClient 
    ? projects?.filter((p: any) => p.client_id === selectedClient)
    : []

  // Logique du chronomètre
  useEffect(() => {
    if (timer) {
      const startTime = new Date(timer.started_at).getTime()
      const updateElapsed = () => setElapsed(Math.floor((Date.now() - startTime) / 1000))
      updateElapsed()
      const interval = setInterval(updateElapsed, 1000)
      return () => clearInterval(interval)
    } else {
      setElapsed(0)
    }
  }, [timer])

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  // Actions
  const handleStart = async () => {
    if (!selectedProject) return
    setLoading(true)
    try {
      const { data } = await supabase
        .from('active_timers')
        .insert({ 
          user_id: userId, 
          started_at: new Date().toISOString(),
          project_id: selectedProject 
        })
        .select()
        .single()
      setTimer(data)
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleStop = async () => {
    if (!timer) return
    setLoading(true)
    try {
      const durationMinutes = Math.max(1, Math.round(elapsed / 60))
      await supabase.from('time_entries').insert({
        user_id: userId,
        project_id: timer.project_id,
        duration_minutes: durationMinutes,
        date: new Date().toISOString().split('T')[0],
        start_time: timer.started_at,
        end_time: new Date().toISOString(),
        is_timer: true,
        is_billable: true
      })
      await supabase.from('active_timers').delete().eq('id', timer.id)
      setTimer(null)
      setElapsed(0)
      setSelectedClient('')
      setSelectedProject('')
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const currentProject = projects?.find((p: any) => p.id === timer?.project_id)

  // --- RENDER : LE NOUVEAU DESIGN ---
  if (timer) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between relative overflow-hidden min-h-[140px]">
        {/* Effet visuel background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="z-10 text-center sm:text-left mb-4 sm:mb-0">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-blue-300 mb-2 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Timer en cours
          </div>
          <h2 className="text-2xl font-semibold mb-1">{currentProject?.name || 'Projet inconnu'}</h2>
          <p className="text-slate-400 text-sm">
            {currentProject?.client?.company || currentProject?.client?.name || 'Client inconnu'}
          </p>
        </div>
        
        <div className="flex items-center gap-6 z-10">
          <div className="text-4xl font-mono font-bold tracking-wider tabular-nums">
            {formatTime(elapsed)}
          </div>
          <button 
            onClick={handleStop}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg shadow-red-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Square className="w-6 h-6 fill-current" />}
          </button>
        </div>
      </div>
    )
  }

  // État "Pas de timer" (Sélection simplifiée)
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[140px] flex flex-col justify-center">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Client</label>
            <select 
              className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm h-10 px-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedClient}
              onChange={(e) => { setSelectedClient(e.target.value); setSelectedProject(''); }}
            >
              <option value="">Choisir...</option>
              {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Projet</label>
            <select 
              className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm h-10 px-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              disabled={!selectedClient}
            >
              <option value="">Choisir...</option>
              {filteredProjects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={handleStart}
          disabled={!selectedProject || loading}
          className="w-full sm:w-auto bg-slate-900 text-white h-10 px-6 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          <span>Lancer</span>
        </button>
      </div>
    </div>
  )
}
