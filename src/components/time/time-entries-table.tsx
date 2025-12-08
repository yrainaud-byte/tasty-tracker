'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { EditEntryDialog } from './edit-entry-dialog'

export function TimeEntriesTable({ entries, projects }: { entries: any[]; projects?: any[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<any | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce pointage ?')) return

    setDeletingId(id)
    try {
      await supabase.from('time_entries').delete().eq('id', id)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  const handleExport = () => {
    const headers = ['Date', 'Durée (h)', 'Client', 'Projet', 'Notes', 'Facturable', 'Type']
    const rows = entries.map(e => [
      e.date,
      (e.duration_minutes / 60).toFixed(2),
      e.project?.client?.company || e.project?.client?.name || '-',
      e.project?.name || '-',
      e.notes || '-',
      e.is_billable ? 'Oui' : 'Non',
      e.is_timer ? 'Timer' : 'Manuel'
    ])
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pointages_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg shadow text-center">
        <p className="text-gray-500">Aucun pointage sur cette période</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Pointages ({entries.length})
            </h3>
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              📥 Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durée</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projet</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.date).toLocaleDateString('fr-FR', { 
                        weekday: 'short', 
                        day: '2-digit', 
                        month: 'short' 
                      })}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-lg font-mono font-bold text-gray-900">
                        {(entry.duration_minutes / 60).toFixed(1)}h
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {entry.project?.client?.company || entry.project?.client?.name || '-'}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {entry.project ? (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: entry.project.color }}
                          />
                          <span className="font-medium text-gray-900">{entry.project.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {entry.notes || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {entry.is_timer && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                            Timer
                          </span>
                        )}
                        {entry.is_billable ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                            Facturable
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">
                            Non fact.
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingEntry(entry)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          disabled={deletingId === entry.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingEntry && (
        <EditEntryDialog
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          projects={projects || []}
        />
      )}
    </>
  )
}
