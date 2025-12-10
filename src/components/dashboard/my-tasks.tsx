'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const statusConfig = {
  todo: { label: '📋 À faire', color: 'bg-gray-100 text-gray-700' },
  in_progress: { label: '⚡ En cours', color: 'bg-blue-100 text-blue-700' },
  done: { label: '✅ Terminé', color: 'bg-green-100 text-green-700' },
}

const priorityConfig = {
  low: { icon: '🟢', label: 'Basse' },
  medium: { icon: '🟡', label: 'Moyenne' },
  high: { icon: '🟠', label: 'Haute' },
  urgent: { icon: '🔴', label: 'Urgente' },
}

export function MyTasks({ tasks }: { tasks: any[] }) {
  const [filter, setFilter] = useState<'today' | 'week' | 'all'>('today')
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleStatusChange = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    setUpdatingTaskId(taskId)
    try {
      const updates: any = { status: newStatus }
      if (newStatus === 'done') {
        updates.completed_at = new Date().toISOString()
      }

      await supabase
        .from('project_tasks')
        .update(updates)
        .eq('id', taskId)

      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const now = new Date()
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

// Calculer le début de la semaine (lundi)
const weekStart = new Date(today)
const dayOfWeek = weekStart.getDay()
const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
weekStart.setDate(weekStart.getDate() + daysToMonday)

// Calculer la fin de la semaine (dimanche)
const weekEnd = new Date(weekStart)
weekEnd.setDate(weekStart.getDate() + 6)

  const filteredTasks = tasks.filter(task => {
    if (task.status === 'done') return false
    
    if (!task.due_date) return filter === 'all'
    
    const dueDate = new Date(task.due_date)
    
    if (filter === 'today') {
      return dueDate <= today || (dueDate.getDate() === today.getDate() && 
             dueDate.getMonth() === today.getMonth() && 
             dueDate.getFullYear() === today.getFullYear())
    }
    
    if (filter === 'week') {
      return dueDate >= today && dueDate <= weekEnd
    }
    
    return true
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
    if (priorityDiff !== 0) return priorityDiff
    
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    }
    return 0
  })

  const todayTasks = tasks.filter(t => {
    if (t.status === 'done' || !t.due_date) return false
    const dueDate = new Date(t.due_date)
    return dueDate <= today || (dueDate.getDate() === today.getDate() && 
           dueDate.getMonth() === today.getMonth() && 
           dueDate.getFullYear() === today.getFullYear())
  }).length

  const weekTasks = tasks.filter(t => {
    if (t.status === 'done' || !t.due_date) return false
    const dueDate = new Date(t.due_date)
    return dueDate >= today && dueDate <= weekEnd
  }).length

  const allActiveTasks = tasks.filter(t => t.status !== 'done').length

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📝 Mes tâches</h2>
          <p className="text-gray-600 mt-1">Vue d'ensemble de votre travail</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('today')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === 'today'
              ? 'bg-red-100 text-red-700 border-2 border-red-400'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          🔥 Aujourd'hui ({todayTasks})
        </button>
        <button
          onClick={() => setFilter('week')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === 'week'
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-400'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          📅 Cette semaine ({weekTasks})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-purple-100 text-purple-700 border-2 border-purple-400'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          📋 Toutes actives ({allActiveTasks})
        </button>
      </div>

      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {filter === 'today' && '🎉 Aucune tâche pour aujourd\'hui !'}
              {filter === 'week' && '✨ Aucune tâche prévue cette semaine'}
              {filter === 'all' && '👍 Toutes vos tâches sont terminées !'}
            </p>
          </div>
        ) : (
          sortedTasks.map((task) => {
            const isOverdue = task.due_date && new Date(task.due_date) < new Date()
            const isToday = task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString()
            
            return (
              <div
                key={task.id}
                className={`p-4 border-2 rounded-lg hover:border-blue-300 transition-colors ${
                  isOverdue ? 'border-red-300 bg-red-50' : isToday ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <Link
                      href={`/projects/${task.project_id}`}
                      className="font-semibold text-gray-900 hover:text-blue-600 block mb-1"
                    >
                      {task.title}
                    </Link>
                    {task.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-sm flex-wrap">
                      <Link
                        href={`/projects/${task.project_id}`}
                        className="text-blue-600 hover:underline"
                      >
                        📁 {task.project?.name}
                      </Link>
                      <span className={`inline-flex items-center gap-1 ${statusConfig[task.status as keyof typeof statusConfig].color} px-2 py-1 rounded text-xs font-medium`}>
                        {statusConfig[task.status as keyof typeof statusConfig].label}
                      </span>
                      <span className="text-gray-600">
                        {priorityConfig[task.priority as keyof typeof priorityConfig].icon} {priorityConfig[task.priority as keyof typeof priorityConfig].label}
                      </span>
                      {task.due_date && (
                        <span className={isOverdue ? 'text-red-600 font-medium' : isToday ? 'text-orange-600 font-medium' : 'text-gray-600'}>
                          {isOverdue && '⚠️ En retard • '}
                          {isToday && '🔥 Aujourd\'hui • '}
                          📅 {new Date(task.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  {task.status !== 'in_progress' && (
                    <button
                      onClick={() => handleStatusChange(task.id, 'in_progress')}
                      disabled={updatingTaskId === task.id}
                      className="flex-1 text-xs py-2 px-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 font-medium"
                    >
                      ⚡ Commencer
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusChange(task.id, 'done')}
                    disabled={updatingTaskId === task.id}
                    className="flex-1 text-xs py-2 px-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 font-medium"
                  >
                    ✅ Terminer
                  </button>
                  <Link
                    href={`/projects/${task.project_id}`}
                    className="text-xs py-2 px-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                  >
                    Voir →
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
