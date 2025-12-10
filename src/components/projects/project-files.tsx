'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function ProjectFiles({ projectId, files, userId }: any) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Upload vers Supabase Storage
      const fileName = `${Date.now()}_${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(fileName)

      // Enregistrer dans la DB
      await supabase.from('project_files').insert({
        project_id: projectId,
        uploaded_by: userId,
        file_name: file.name,
        file_type: file.type,
        file_url: publicUrl,
        file_size: file.size
      })

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (fileId: string, fileUrl: string) => {
    if (!confirm('Supprimer ce fichier ?')) return
    try {
      await supabase.from('project_files').delete().eq('id', fileId)
      router.refresh()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="font-semibold mb-4">📎 Fichiers</h3>

      <label className="block w-full p-4 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50 mb-4">
        <input
          type="file"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
        <p className="text-sm text-gray-600">
          {uploading ? 'Upload...' : '+ Ajouter un fichier'}
        </p>
      </label>

      <div className="space-y-2">
        {files.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Aucun fichier</p>
        ) : (
          files.map((file: any) => (
            <div key={file.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
              <div className="flex-1 min-w-0">
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:underline truncate block"
                >
                  {file.file_name}
                </a>
                <p className="text-xs text-gray-500">
                  {(file.file_size / 1024).toFixed(0)} KB • {new Date(file.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <button
                onClick={() => handleDelete(file.id, file.file_url)}
                className="text-red-600 hover:text-red-700 ml-2"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
