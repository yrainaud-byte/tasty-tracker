'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function ProjectUpdates({ projectId, updates, userId }: any) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    try {
      await supabase.from('project_updates').insert({
        project_id: projectId,
        user_id: userId,
        content: content.trim()
      })
      setContent('')
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">📝 Mises à jour</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ajouter une mise à jour..."
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Publication...' : 'Publier'}
        </button>
      </form>

      <div className="space-y-4">
        {updates.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune mise à jour</p>
        ) : (
          updates.map((update: any) => (
            <div key={update.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{update.user?.full_name}</span>
                <span className="text-xs text-gray-500">
                  {new Date(update.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-gray-700">{update.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
