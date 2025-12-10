'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trash2, Archive, RotateCcw } from 'lucide-react'

interface Project {
  id: string
  name: string
  color: string
  status: string
  budget_hours: number | null
  hourly_rate: number | null
  created_at: string
  hours_logged?: number
  client?: {
    name: string
    company: string | null
  }
}

export function ProjectsList({ projects, showArchived = false }: { projects: Project[]; showArchived?: boolean }) {
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleArchive = async (e: React.MouseEvent, projectId: string, currentStatus: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const newStatus = currentStatus === 'archived' ? 'active' : 'archived'
    const confirmMessage = newStatus === 'archived' 
      ? 'Archiver ce projet ?' 
      : 'Réactiver ce projet ?'
    
    if (!confirm(confirmMessage)) return

    setArchivingId(projectId)
    try {
      await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId)
      
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Erreur lors de l\'opération')
    } finally {
      setArchivingId(null)
    }
  }

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Êtes-vous sûr de vouloir SUPPRIMER définitivement ce projet ?')) return
    if (!confirm('ATTENTION : Cette action est irréversible. Toutes les tâches, temps et fichiers associés seront effacés.')) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
      
      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Erreur lors de la suppression (vérifiez les droits ou les données liées)")
    }
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg shadow text-center">
        <p className="text-gray-500">
          {showArchived ? 'Aucun projet archivé' : 'Aucun projet créé'}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {showArchived ? 'Les projets archivés apparaîtront ici' : 'Créez votre premier projet ci-dessus'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="font-semibold text-lg mb-4">
          {showArchived ? 'Projets archivés' : 'Vos projets'} ({projects.length})
        </h3>
        <div className="space-y-4">
          {projects.map((project) => {
            const hoursLogged = project.hours_logged || 0
            const budgetHours = project.budget_hours || 0
            const hourlyRate = project.hourly_rate || 79
            const progress = budgetHours > 0 ? (hoursLogged / budgetHours) * 100 : 0
            const isOverBudget = progress > 100

            const budgetRevenue = budgetHours * hourlyRate
            const actualCost = hoursLogged * hourlyRate
            const margin = budgetRevenue - actualCost
            const marginPercent = budgetRevenue > 0 ? (margin / budgetRevenue) * 100 : 0

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={`block p-4 border rounded-lg transition-colors ${
                  showArchived ? 'bg-gray-50 hover:bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      {project.client && (
                        <p className="text-sm text-gray-600">
                          {project.client.name}
                          {project.client.company && ` • ${project.client.company}`}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Zone Actions */}
                  <div className="flex items-center gap-2">
                    {showArchived ? (
                      <span className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-medium">
                        Archivé
                      </span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                        Actif
                      </span>
                    )}
                    
                    <div className="flex items-center gap-1 pl-2 border-l border-gray-200 ml-2">
                      <button
                        onClick={(e) => handleArchive(e, project.id, project.status)}
                        disabled={archivingId === project.id}
                        className={`p-2 rounded-lg transition-colors ${
                          showArchived
                            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        } disabled:opacity-50`}
                        title={showArchived ? "Réactiver" : "Archiver"}
                      >
                        {showArchived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={(e) => handleDelete(e, project.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Supprimer définitivement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {budgetHours > 0 && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Temps</span>
                        <span className="text-gray-600">
                          {hoursLogged.toFixed(1)}h / {budgetHours}h
                        </span>
                        <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-blue-600'}`}>
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isOverBudget ? 'bg-red-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs">Budget</p>
                          <p className="font-semibold text-gray-900">{budgetRevenue.toFixed(0)}€</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Coût réel</p>
                          <p className="font-semibold text-gray-900">{actualCost.toFixed(0)}€</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Marge</p>
                          <p className={`font-semibold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {margin >= 0 ? '+' : ''}{margin.toFixed(0)}€
                            <span className="text-xs ml-1">({marginPercent.toFixed(0)}%)</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {isOverBudget && (
                      <p className="text-xs text-red-600 font-medium">
                        ⚠️ Budget dépassé de {(hoursLogged - budgetHours).toFixed(1)}h
                      </p>
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-3">
                  Créé le {new Date(project.created_at).toLocaleDateString('fr-FR')}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
