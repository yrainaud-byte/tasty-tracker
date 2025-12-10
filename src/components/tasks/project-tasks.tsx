'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { TaskCard } from './task-card'
import { TaskForm } from './task-form'

interface ProjectTasksProps {
  projectId: string
  tasks: any[]
  members: any[] // La liste des membres du projet
  userId: string
}

export function ProjectTasks({ projectId, tasks, members, userId }: ProjectTasksProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all')
  const supabase = createClient()
  const router = useRouter()

  const handleEdit = (task: any) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Supprimer cette tâche ?')) return

    try {
      await supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId)
      
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    return task.status === filter
  })

  // Calcul basique des stats
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  }

  const completionRate = stats.total > 0 ? (stats.done / stats.total) * 100 : 0

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg">📝 Tâches du projet</h3>
          <p className="text-sm text-gray-600 mt-1">
            {stats.done}/{stats.total} terminées • {completionRate.toFixed(0)}% de progression
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <span>➕</span> Nouvelle tâche
        </button>
      </div>

      {/* BARRE DE PROGRESSION GLOBALE */}
      {stats.total > 0 && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}

      {/* FILTRES */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Toutes ({stats.total})
        </button>
        <button
          onClick={() => setFilter('todo')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === 'todo'
              ? 'bg-gray-100 text-gray-700 border-2 border-gray-400'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          📋 À faire ({stats.todo})
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === 'in_progress'
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-400'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          ⚡ En cours ({stats.in_progress})
        </button>
        <button
          onClick={() => setFilter('done')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === 'done'
              ? 'bg-green-100 text-green-700 border-2 border-green-400'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          ✅ Terminées ({stats.done})
        </button>
      </div>

      {/* LISTE DES TÂCHES */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 mb-2">Aucune tâche trouvée</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Créer une tâche →
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              members={members} // <--- IMPORTANT : On passe les membres ici
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* MODALE FORMULAIRE */}
      {showForm && (
        <TaskForm
          projectId={projectId}
          task={editingTask}
          members={members}
          userId={userId}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}
