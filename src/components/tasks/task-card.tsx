'use client'

interface TaskCardProps {
  task: any
  members: any[]
  onEdit: (task: any) => void
  onDelete: (taskId: string) => void
}

export function TaskCard({ task, members, onEdit, onDelete }: TaskCardProps) {
  
  // 1. Trouver l'utilisateur assigné
  // Adaptez la clé .user_id ou .id selon votre table 'members'
  const assignedMember = members.find(m => (m.user_id || m.id) === task.assigned_to)

  // 2. Calculer le ratio temps passé / estimé
  const estimated = parseFloat(task.estimated_hours || 0)
  const spent = parseFloat(task.spent_hours || 0)
  
  let progressPercent = 0
  let isOverBudget = false

  if (estimated > 0) {
    progressPercent = (spent / estimated) * 100
    if (progressPercent > 100) isOverBudget = true
  }

  // Styles dynamiques selon le statut
  const statusStyles = {
    todo: 'bg-gray-100 text-gray-600 border-gray-200',
    in_progress: 'bg-blue-50 text-blue-600 border-blue-200',
    done: 'bg-green-50 text-green-600 border-green-200',
  }

  const statusLabels = {
    todo: 'À faire',
    in_progress: 'En cours',
    done: 'Terminé',
  }

  return (
    <div className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative">
      
      {/* En-tête : Titre + Menu Actions */}
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 pr-8">{task.title}</h4>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 bg-white pl-2">
          <button 
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Modifier"
          >
            ✏️
          </button>
          <button 
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Badges et Infos */}
      <div className="flex flex-wrap items-center gap-3 mt-3">
        
        {/* Badge Statut */}
        <span className={`text-xs px-2 py-1 rounded-full border ${statusStyles[task.status as keyof typeof statusStyles]}`}>
          {statusLabels[task.status as keyof typeof statusLabels]}
        </span>

        {/* Assignation */}
        {assignedMember ? (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full border">
            <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
              {assignedMember.full_name?.charAt(0) || assignedMember.email?.charAt(0) || '?'}
            </div>
            <span className="truncate max-w-[100px]">{assignedMember.full_name || assignedMember.email}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">Non assigné</span>
        )}
      </div>

      {/* Barre de Temps (Uniquement si une estimation existe) */}
      {estimated > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>⏱ {spent}h / {estimated}h</span>
            <span className={isOverBudget ? 'text-red-500 font-bold' : ''}>
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${isOverBudget ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
