'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface TaskFormProps {
  projectId: string
  task?: any
  members: any[]
  userId: string
  onClose: () => void
}

export function TaskForm({ projectId, task, members, userId, onClose }: TaskFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  // Etats
  const [title, setTitle] = useState(task?.title || '')
  const [status, setStatus] = useState(task?.status || 'todo')
  
  // Nouveaux champs
  const [assignedTo, setAssignedTo] = useState(task?.assigned_to || '') // ID du membre
  const [estimatedHours, setEstimatedHours] = useState(task?.estimated_hours || 0)
  const [spentHours, setSpentHours] = useState(task?.spent_hours || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const taskData = {
      title,
      status,
      project_id: projectId,
      assigned_to: assignedTo || null, // Gestion du "non assigné"
      estimated_hours: parseFloat(estimatedHours),
      spent_hours: parseFloat(spentHours),
      updated_at: new Date().toISOString(),
    }

    try {
      if (task) {
        // Mode Edition
        await supabase
          .from('project_tasks')
          .update(taskData)
          .eq('id', task.id)
      } else {
        // Mode Création
        await supabase
          .from('project_tasks')
          .insert({
            ...taskData,
            created_by: userId
          })
      }
      router.refresh()
      onClose()
    } catch (error) {
      console.error(error)
      alert("Erreur lors de l'enregistrement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-lg">{task ? '✏️ Modifier la tâche' : '✨ Nouvelle tâche'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la tâche</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Maquetter la page d'accueil..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                className="w-full p-2 border rounded-lg bg-white"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="todo">À faire</option>
                <option value="in_progress">En cours</option>
                <option value="done">Terminé</option>
              </select>
            </div>

            {/* Assignation (NOUVEAU) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigné à</label>
              <select
                className="w-full p-2 border rounded-lg bg-white"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">-- Personne --</option>
                {members.map((member) => (
                  // Attention: ajustez member.user_id ou member.id selon votre structure
                  <option key={member.id} value={member.user_id || member.id}>
                    {member.full_name || member.email || 'Membre'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            {/* Temps Estimé (Objectif) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objectif (h)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                className="w-full p-2 border rounded-lg"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="0h"
              />
            </div>

            {/* Temps Passé (Réel) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temps passé (h)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                className="w-full p-2 border rounded-lg"
                value={spentHours}
                onChange={(e) => setSpentHours(e.target.value)}
                placeholder="0h"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
