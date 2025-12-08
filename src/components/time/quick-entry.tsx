'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function QuickEntry({ userId, projects }: { userId: string; projects: any[] }) {
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [loading, setLoading] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!duration || parseFloat(duration) <= 0) {
      alert('Veuillez entrer une durée valide')
      return
    }
    
    setLoading(true)
    try {
      const durationMinutes = Math.round(parseFloat(duration) * 60)
      await supabase.from('time_entries').insert({
        user_id: userId,
        project_id: selectedProject || null,
        duration_minutes: durationMinutes,
        date: new Date().toISOString().split('T')[0],
        notes: notes || null,
        is_billable: true,
        is_timer: false
      })
      
      setDuration('')
      setNotes('')
      setSelectedClient('')
      setSelectedProject('')
      router.refresh()
      alert(`✅ ${duration}h enregistrées !`)
    } catch (error) {
      console.error(error)
      alert('Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const quickDurations = [0.25, 0.5, 1, 2, 4, 8]

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="font-semibold mb-4 text-lg">⚡ Pointage Express</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Durée (heures)</label>
          <input
            type="number"
            step="0.25"
            min="0"
            placeholder="Ex: 2.5"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {quickDurations.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d.toString())}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                {d}h
              </button>
            ))}
          </div>
        </div>

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

        <div>
          <label className="block text-sm font-medium mb-2">Note (optionnel)</label>
          <textarea
            placeholder="Qu'avez-vous fait ?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !duration}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : '⚡ Enregistrer'}
        </button>
      </form>
    </div>
  )
}
