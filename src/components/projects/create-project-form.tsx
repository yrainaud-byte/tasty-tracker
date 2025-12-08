'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function CreateProjectForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [clientId, setClientId] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // orange
    '#8b5cf6', // purple
    '#ec4899', // pink
  ]

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('name')
    setClients(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !clientId) return

    setLoading(true)
    try {
      await supabase.from('projects').insert({
        name: name.trim(),
        client_id: clientId,
        color,
        status: 'active'
      })

      setName('')
      setClientId('')
      setColor('#3b82f6')
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
      >
        ➕ Nouveau projet
      </button>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="font-semibold text-lg mb-4">Créer un projet</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Client *</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner un client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company || client.name}
              </option>
            ))}
          </select>
          {clients.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">
              ⚠️ Créez d'abord un client dans l'onglet Clients
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nom du projet *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Campagne Air Max 2025"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Couleur</label>
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-10 h-10 rounded-lg transition-all ${
                  color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !clientId}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
