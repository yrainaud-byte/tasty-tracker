'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface EditEntryDialogProps {
  entry: any
  onClose: () => void
  projects: any[]
}

export function EditEntryDialog({ entry, onClose, projects }: EditEntryDialogProps) {
  const [duration, setDuration] = useState((entry.duration_minutes / 60).toString())
  const [notes, setNotes] = useState(entry.notes || '')
  const [projectId, setProjectId] = useState(entry.project_id || '')
  const [isBillable, setIsBillable] = useState(entry.is_billable)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // Clients uniques
  const clients = Array.from(new Map(
    projects?.filter((p: any) => p.client).map((p: any) => [p.client.id, p.client])
  ).values())

  const [selectedClient, setSelectedClient] = useState(
    entry.project?.client_id || ''
  )

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
      await supabase
        .from('time_entries')
        .update({
          duration_minutes: durationMinutes,
          notes: notes || null,
          project_id: projectId || null,
          is_billable: isBillable
        })
        .eq('id', entry.id)

      router.refresh()
      onClose()
    } catch (error) {
      console.error(error)
      alert('Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Modifier le pointage</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Durée (heures)</label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {clients && clients.length > 0 && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Client</label>
                  <select
                    value={selectedClient}
                    onChange={(e) => {
                      setSelectedClient(e.target.value)
                      setProjectId('')
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Aucun client</option>
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
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Aucun projet</option>
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
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Description de l'activité..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="billable"
                checked={isBillable}
                onChange={(e) => setIsBillable(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="billable" className="ml-2 text-sm font-medium text-gray-700">
                Facturable
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
