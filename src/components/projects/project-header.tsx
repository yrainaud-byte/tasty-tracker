'use client'
import Link from 'next/link'

export function ProjectHeader({ project }: { project: any }) {
  const hoursLogged = project.hours_logged || 0
  const budgetHours = project.budget_hours || 0
  const progress = budgetHours > 0 ? (hoursLogged / budgetHours) * 100 : 0
  const isOverBudget = progress > 100

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <Link href="/projects" className="text-gray-400 hover:text-gray-600">
            ← Retour
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            </div>
            {project.client && (
              <p className="text-gray-600 mt-1">
                {project.client.company || project.client.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {project.description && (
        <p className="text-gray-700 mb-4">{project.description}</p>
      )}

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Date de livraison</p>
          <p className="font-semibold">
            {project.delivery_date 
              ? new Date(project.delivery_date).toLocaleDateString('fr-FR')
              : 'Non définie'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Budget temps</p>
          <p className="font-semibold">{budgetHours}h</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Consommé</p>
          <p className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
            {hoursLogged.toFixed(1)}h ({progress.toFixed(0)}%)
          </p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${isOverBudget ? 'bg-red-600' : 'bg-blue-600'}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  )
}
