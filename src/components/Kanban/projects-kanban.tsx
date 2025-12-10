'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const columns = [
  { id: 'upcoming', label: 'À venir', color: 'bg-gray-100', icon: '📅' },
  { id: 'preproduction', label: 'Pré-prod', color: 'bg-blue-100', icon: '📋' },
  { id: 'production', label: 'Production', color: 'bg-purple-100', icon: '🎬' },
  { id: 'sprint', label: 'Sprint semaine', color: 'bg-yellow-100', icon: '⚡' },
  { id: 'blocked', label: 'Bloqué', color: 'bg-red-100', icon: '🚫' },
  { id: 'delivered', label: 'Livré', color: 'bg-green-100', icon: '✅' },
]

interface Project {
  id: string
  name: string
  color: string
  budget_hours: number | null
  hours_logged?: number
  kanban_status?: string
  client?: {
    name: string
    company: string | null
  }
}

export function ProjectsKanban({ projects }: { projects: Project[] }) {
  const [draggedProject, setDraggedProject] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProject(projectId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDraggedProject(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    
    if (!draggedProject) return

    try {
      await supabase
        .from('projects')
        .update({ kanban_status: newStatus })
        .eq('id', draggedProject)
      
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setDraggedProject(null)
      setDragOverColumn(null)
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
      {columns.map((column) => {
        const columnProjects = projects.filter(
          (p) => (p.kanban_status || 'upcoming') === column.id
        )
        const isDragOver = dragOverColumn === column.id

        return (
          <div 
            key={column.id} 
            className="flex-shrink-0 w-80 flex flex-col"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className={`${column.color} rounded-t-lg p-4`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span>{column.icon}</span>
                  {column.label}
                </h3>
                <span className="text-sm font-medium text-gray-600 bg-white px-2 py-1 rounded">
                  {columnProjects.length}
                </span>
              </div>
            </div>

            <div 
              className={`bg-white rounded-b-lg border border-t-0 p-3 space-y-3 flex-1 overflow-y-auto min-h-[500px] transition-colors ${
                isDragOver ? 'bg-blue-50 border-blue-400 border-2' : ''
              }`}
            >
              {columnProjects.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  {isDragOver ? 'Déposez ici' : 'Aucun projet'}
                </p>
              ) : (
                columnProjects.map((project) => {
                  const hoursLogged = project.hours_logged || 0
                  const budgetHours = project.budget_hours || 0
                  const progress = budgetHours > 0 ? (hoursLogged / budgetHours) * 100 : 0
                  const isDragging = draggedProject === project.id

                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, project.id)}
                      onDragEnd={handleDragEnd}
                      className={`block bg-white p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        isDragging 
                          ? 'opacity-50 scale-95 border-blue-400' 
                          : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: project.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                            {project.name}
                          </h4>
                          {project.client && (
                            <p className="text-xs text-gray-500 mt-1">
                              {project.client.company || project.client.name}
                            </p>
                          )}
                        </div>
                      </div>

                      {budgetHours > 0 && (
                        <div className="space-y-1 mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>{hoursLogged.toFixed(0)}h / {budgetHours}h</span>
                            <span className="font-semibold">{progress.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                progress > 100 ? 'bg-red-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                        <span>👆</span>
                        <span>Cliquer pour ouvrir • Glisser pour déplacer</span>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
