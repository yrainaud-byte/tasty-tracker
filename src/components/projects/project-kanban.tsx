'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
// Import du Dialog (assurez-vous d'avoir créé ce fichier à l'étape précédente)
import { ProjectDetailsDialog } from './project-details-dialog'
import { 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  PlayCircle,
  Calendar,
  Layers,
  Archive,
  ArrowRight
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils'

const COLUMNS = [
  { id: 'backlog', label: 'À venir', bg: 'bg-slate-50', headerColor: 'text-slate-500', icon: Archive },
  { id: 'pre-prod', label: 'Pré-prod', bg: 'bg-indigo-50/50', headerColor: 'text-indigo-600', icon: Layers },
  { id: 'production', label: 'Production', bg: 'bg-blue-50/50', headerColor: 'text-blue-600', icon: PlayCircle },
  { id: 'sprint', label: 'Sprint Semaine', bg: 'bg-purple-50/50', headerColor: 'text-purple-600', icon: Calendar },
  { id: 'blocked', label: 'Bloqué', bg: 'bg-red-50/50', headerColor: 'text-red-600', icon: AlertCircle },
  { id: 'completed', label: 'Terminé', bg: 'bg-green-50/50', headerColor: 'text-green-600', icon: CheckCircle2 },
]

// Ajout de la prop 'simpleView'
export function ProjectKanban({ initialProjects, simpleView = false }: { initialProjects: any[], simpleView?: boolean }) {
  const [projects, setProjects] = useState(initialProjects)
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  // Mise à jour si les props changent (ex: navigation)
  useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects])

  const updateProjectStatus = async (projectId: string, newStatus: string) => {
    setProjects(current => 
      current.map(p => p.id === projectId ? { ...p, status: newStatus } : p)
    )
    try {
      await supabase.from('projects').update({ status: newStatus }).eq('id', projectId)
      router.refresh()
    } catch (error) {
      console.error("Erreur update", error)
    }
  }

  // Drag & Drop Handlers (Identiques)
  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProjectId(projectId)
    e.dataTransfer.effectAllowed = 'move'
    e.currentTarget.classList.add('opacity-50')
  }
  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedProjectId(null)
    e.currentTarget.classList.remove('opacity-50')
  }
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault()
    if (draggedProjectId) {
      updateProjectStatus(draggedProjectId, targetStatus)
    }
  }

  const getProjectsByStatus = (status: string) => {
    const validStatuses = COLUMNS.map(c => c.id)
    if (status === 'backlog') {
      return projects.filter(p => p.status === 'backlog' || !validStatuses.includes(p.status))
    }
    return projects.filter(p => p.status === status)
  }

  // Filtrage des colonnes pour le mode "Aperçu"
  // On cache 'backlog' et 'completed' pour se concentrer sur l'actif
  const visibleColumns = simpleView 
    ? COLUMNS.filter(c => !['backlog', 'completed'].includes(c.id))
    : COLUMNS

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 h-full snap-x">
        {visibleColumns.map((col) => {
          const colProjects = getProjectsByStatus(col.id)
          
          return (
            <div 
              key={col.id} 
              // En mode simple, on réduit un peu la largeur min pour que ça rentre mieux
              className={cn(
                "flex flex-col snap-start",
                simpleView ? "min-w-[240px] w-[240px]" : "min-w-[280px] w-[280px]"
              )}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3 px-2">
                <div className={cn("flex items-center gap-2 px-2 py-1 rounded-md text-sm font-semibold", col.headerColor)}>
                  <col.icon className="w-4 h-4" />
                  <span>{col.label}</span>
                  <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                    {colProjects.length}
                  </span>
                </div>
                {!simpleView && (
                  <button className="text-slate-300 hover:text-slate-500 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Zone Cartes */}
              <div className={cn(
                "flex-1 rounded-xl p-2 space-y-3 transition-colors border-2 border-transparent", 
                col.bg,
                draggedProjectId ? "hover:border-blue-300 hover:bg-blue-50" : ""
              )}>
                {colProjects.map((project) => (
                  <div 
                    key={project.id} 
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, project.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedProject(project)}
                    className="bg-white p-3 rounded-xl shadow-sm border border-slate-200/60 hover:shadow-md hover:border-blue-300 cursor-grab active:cursor-grabbing transition-all group relative"
                  >
                    <div className="mb-2 flex justify-between items-center">
                      <span 
                        className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wide uppercase"
                        style={{ backgroundColor: `${project.color}10`, color: project.color }}
                      >
                        {project.client?.company || 'Interne'}
                      </span>
                    </div>
                    <h4 className="font-medium text-slate-800 text-sm mb-2 leading-snug">
                      {project.name}
                    </h4>
                    {/* On affiche moins d'infos en mode simple */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                        <Clock className="w-3 h-3" />
                        {project.budget_hours ? `${project.budget_hours}h` : '-'}
                      </div>
                    </div>
                  </div>
                ))}
                {colProjects.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-slate-200/50 rounded-lg flex flex-col items-center justify-center text-slate-300 gap-1 transition-colors">
                    <span className="text-xs font-medium">Vide</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <ProjectDetailsDialog 
        project={selectedProject} 
        isOpen={!!selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </>
  )
}
