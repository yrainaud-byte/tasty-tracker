'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function ActiveTimer({ activeTimer, userId, projects }: any) {
  const [timer, setTimer] = useState(activeTimer)
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const supabase = createClient()
  const router = useRouter()

  // Liste des clients uniques
  const clients = Array.from(new Map(
    projects?.filter((p: any) => p.client).map((p: any) => [p.client.id, p.client])
  ).values())

  // Projets filtrés par client sélectionné
  const filteredProjects = selectedClient 
    ? projects?.filter((p: any) => p.client_id === selectedClient)
    : []

  useEffect(() => {
    if (timer) {
      const startTime = new Date(timer.started_at).getTime()
      const updateElapsed = () => setElapsed(Math.floor((Date.now() - startTime) / 1000))
      updateElapsed()
      const interval = setInterval(updateElapsed, 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const handleStart = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('active_timers')
        .insert({ 
          user_id: userId, 
          started_at: new Date().toISOString(),
          project_id: selectedProject || null
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
      const durationMinutes = Math.round(elapsed / 60)
      await supabase.from('time_entries').insert({
        user_id: userId,
        project_id: timer.project_id || null,
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

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="font-semibold mb-4 text-lg">⏱️ Timer</h3>
      {timer ? (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-5xl font-mono font-bold text-blue-600">{formatTime(elapsed)}</div>
            {currentProject && (
              <div className="mt-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentProject.color }} />
                  <span className="text-sm font-medium text-gray-900">{currentProject.name}</span>
                </div>
                {currentProject.client && (
                  <p className="text-xs text-gray-500 mt-1">{currentProject.client.company || currentProject.client.name}</p>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handleStop}
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
          >
            ⏹ Arrêter ({(elapsed / 60).toFixed(0)} min)
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {clients && clients.length > 0 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Client</label>
                <select
                  value={selectedClient}
                  onChange={(e) => {
                    setSelectedClient(e.target.value)
                    setSelectedProject('')
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map((client: any) => (
                    <option key={client.id} value={client.id}>
                      {client.company || client.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedClient && (
                <div>
                  <label className="block text-sm font-medium mb-2">Projet</label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un projet</option>
                    {filteredProjects.map((project: any) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
          >
            ▶️ Démarrer
          </button>
        </div>
      )}
    </div>
  )
}
