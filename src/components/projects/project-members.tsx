'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function ProjectMembers({ projectId, members, allUsers }: any) {
  const [showAdd, setShowAdd] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const memberIds = members.map((m: any) => m.user_id)
  const availableUsers = allUsers.filter((u: any) => !memberIds.includes(u.id))

  const handleAdd = async () => {
    if (!selectedUser) return
    setLoading(true)
    try {
      await supabase.from('project_members').insert({
        project_id: projectId,
        user_id: selectedUser
      })
      setSelectedUser('')
      setShowAdd(false)
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (memberId: string) => {
    if (!confirm('Retirer ce membre ?')) return
    try {
      await supabase.from('project_members').delete().eq('id', memberId)
      router.refresh()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">👥 Membres ({members.length})</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          + Ajouter
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 p-3 border rounded-lg">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-2"
          >
            <option value="">Sélectionner...</option>
            {availableUsers.map((user: any) => (
              <option key={user.id} value={user.id}>
                {user.full_name || user.email}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={loading || !selectedUser}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Ajouter
          </button>
        </div>
      )}

      <div className="space-y-2">
        {members.map((member: any) => (
          <div key={member.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
            <div>
              <p className="font-medium text-sm">{member.user?.full_name}</p>
              <p className="text-xs text-gray-500">{member.user?.email}</p>
            </div>
            <button
              onClick={() => handleRemove(member.id)}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
