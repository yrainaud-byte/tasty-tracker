'use client'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'

export function ProjectListWidget({ projects }: { projects: any[] }) {
  // On ne garde que les 5 projets les plus récents/actifs
  const recentProjects = projects?.slice(0, 5) || []

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      {/* Header Widget */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
        <h3 className="font-semibold text-slate-800">Projets Récents</h3>
        <Link 
          href="/projects" 
          className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
        >
          Voir le Kanban <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Liste */}
      <div className="divide-y divide-slate-100">
        {recentProjects.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Aucun projet actif.
          </div>
        ) : (
          recentProjects.map((project) => (
            <div 
              key={project.id} 
              className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors group"
            >
              <div className="flex items-center gap-4">
                {/* Pastille couleur */}
                <div 
                  className="w-1.5 h-10 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: project.color || '#cbd5e1' }}
                />
                
                <div>
                  <h4 className="text-sm font-medium text-slate-900 leading-none mb-1.5">
                    {project.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {project.client?.company || 'Client interne'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Statut (Pillule) */}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide
                  ${project.status === 'active' ? 'bg-green-100 text-green-700' : 
                    project.status === 'production' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                  {project.status === 'active' ? 'En cours' : project.status}
                </span>
                
                {/* Budget (Discret) */}
                <div className="text-xs text-slate-400 font-medium hidden sm:flex items-center gap-1 w-16 justify-end">
                  <Clock className="w-3 h-3" />
                  {project.budget_hours ? `${project.budget_hours}h` : '-'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Footer "Voir plus" si beaucoup de projets */}
      {projects.length > 5 && (
        <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-center">
          <Link href="/projects" className="text-xs text-slate-500 hover:text-slate-800">
            + {projects.length - 5} autres projets...
          </Link>
        </div>
      )}
    </div>
  )
}
