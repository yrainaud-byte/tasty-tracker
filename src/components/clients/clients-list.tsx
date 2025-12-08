'use client'

interface Client {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  created_at: string
  projects?: { count: number }[]
}

export function ClientsList({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg shadow text-center">
        <p className="text-gray-500">Aucun client créé</p>
        <p className="text-sm text-gray-400 mt-1">Créez votre premier client ci-dessus</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="font-semibold text-lg mb-4">Vos clients ({clients.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => {
            const projectCount = client.projects?.[0]?.count || 0
            return (
              <div
                key={client.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{client.name}</h4>
                    {client.company && (
                      <p className="text-sm text-gray-600">{client.company}</p>
                    )}
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    {projectCount} projet{projectCount !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {client.email && (
                  <p className="text-sm text-gray-600 mt-2">
                    📧 {client.email}
                  </p>
                )}
                {client.phone && (
                  <p className="text-sm text-gray-600 mt-1">
                    📱 {client.phone}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
