'use client'

export function TimeEntries({ entries }: { entries: any[] }) {
  if (entries.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-4 text-lg">📊 Activité du jour</h3>
        <p className="text-gray-500 text-center py-8">Aucune activité aujourd'hui</p>
      </div>
    )
  }

  const totalMinutes = entries.reduce((sum, e) => sum + e.duration_minutes, 0)

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">📊 Activité du jour</h3>
        <div className="text-2xl font-bold text-blue-600">
          {(totalMinutes / 60).toFixed(1)}h
        </div>
      </div>
      
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono font-bold text-lg text-gray-900">
                  {(entry.duration_minutes / 60).toFixed(1)}h
                </span>
                {entry.project && (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.project.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {entry.project.name}
                    </span>
                  </div>
                )}
              </div>
              {entry.notes && (
                <p className="text-sm text-gray-600">{entry.notes}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                {entry.is_timer && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Timer
                  </span>
                )}
                {entry.is_billable && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Facturable
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(entry.created_at).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
