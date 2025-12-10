'use client'
import { useState } from 'react'
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Phone, 
  Building2, 
  FolderOpen,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react'
import { ProjectDetailsDialog } from '@/components/projects/project-details-dialog'

// Types (à adapter si besoin)
interface Project {
  id: string
  name: string
  status: string
  color: string
  description?: string
  budget_hours?: number
  created_at: string
}

interface Client {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  projects: Project[]
}

export function ClientList({ initialClients }: { initialClients: Client[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null)
  
  // État pour la pop-up projet
  const [selectedProject, setSelectedProject] = useState<any | null>(null)

  // 1. Filtrage (Recherche)
  const filteredClients = initialClients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 2. Tri : Client avec le plus de projets actifs en premier
  const sortedClients = [...filteredClients].sort((a, b) => {
    // On compte les projets qui ne sont pas 'completed' ou 'archived'
    const activeProjectsA = a.projects.filter(p => p.status !== 'completed').length
    const activeProjectsB = b.projects.filter(p => p.status !== 'completed').length
    return activeProjectsB - activeProjectsA // Descendant
  })

  const toggleExpand = (clientId: string) => {
    if (expandedClientId === clientId) {
      setExpandedClientId(null)
    } else {
      setExpandedClientId(clientId)
    }
  }

  return (
    <div className="flex flex-col h-full">
      
      {/* Barre de recherche intégrée */}
      <div className="mb-6 relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input 
          type="text"
          placeholder="Rechercher un client, une entreprise..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
      </div>

      {/* Tableau Liste */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">Client / Entreprise</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Projets En Cours</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedClients.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-slate-400">Aucun client trouvé.</td>
              </tr>
            ) : (
              sortedClients.map((client) => {
                const isExpanded = expandedClientId === client.id
                const activeProjects = client.projects.filter(p => p.status !== 'completed')
                const initial = client.name.charAt(0).toUpperCase()

                return (
                  <>
                    {/* Ligne Principale Client */}
                    <tr 
                      key={client.id} 
                      className={`group transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50/80' : 'hover:bg-slate-50'}`}
                      onClick={() => toggleExpand(client.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold shadow-sm">
                            {initial}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{client.name}</div>
                            {client.company && (
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <Building2 className="w-3 h-3" /> {client.company}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="space-y-1">
                          {client.email && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="w-3.5 h-3.5 text-slate-400" /> {client.email}
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="w-3.5 h-3.5 text-slate-400" /> {client.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleExpand(client.id); }}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                            activeProjects.length > 0 
                              ? 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100' 
                              : 'bg-slate-50 text-slate-500 border-slate-100'
                          }`}
                        >
                          <FolderOpen className="w-4 h-4" />
                          <span className="text-sm font-medium">{activeProjects.length} Projet{activeProjects.length !== 1 && 's'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-300 hover:text-slate-600 p-2">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>

                    {/* Sous-liste (Projets) - Visible si Expanded */}
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={4} className="p-0 border-b border-slate-200">
                          <div className="px-6 py-4 pl-20 space-y-2">
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                              Projets de {client.name}
                            </div>
                            
                            {client.projects.length === 0 ? (
                              <div className="text-sm text-slate-400 italic py-2">Aucun projet pour ce client.</div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {client.projects.map((project) => (
                                  <div 
                                    key={project.id}
                                    onClick={() => setSelectedProject({ ...project, client })} // On injecte le client pour l'affichage
                                    className="bg-white p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all flex justify-between items-center group/card"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div 
                                        className="w-2 h-2 rounded-full" 
                                        style={{ backgroundColor: project.color || '#cbd5e1' }}
                                      />
                                      <div>
                                        <div className="font-medium text-slate-800 text-sm">{project.name}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                          {project.status === 'active' ? 'En cours' : project.status}
                                        </div>
                                      </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover/card:text-blue-500 transition-colors" />
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="pt-2">
                              <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">
                                + Créer un nouveau projet pour {client.name}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pop-up Détails Projet (Réutilisation) */}
      <ProjectDetailsDialog 
        project={selectedProject} 
        isOpen={!!selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />

    </div>
  )
}
