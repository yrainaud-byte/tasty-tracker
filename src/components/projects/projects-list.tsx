'use client'

interface Project {
  id: string
  name: string
  color: string
  status: string
  created_at: string
  client?: {
    name: string
    company: string | null
  }
}

export function ProjectsList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg shadow text-center">
        <p className="text-gray-500">Aucun projet créé</p>
        <p className="text-sm text-gray-400 mt-1">Créez votre premier projet ci-dessus</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="font-semibold text-lg mb-4">Vos projets ({projects.length})</h3>
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <div>
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  {project.client && (
                    <p className="text-sm text-gray-600">
                      {project.client.name}
                      {project.client.company && ` • ${project.client.company}`}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Créé le {new Date(project.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                  {project.status === 'active' ? 'Actif' : project.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
