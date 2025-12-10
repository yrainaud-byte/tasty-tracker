'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Camera, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface AvatarUploadProps {
  url: string | null
  onUpload: (url: string) => void
}

export function AvatarUpload({ url, onUpload }: AvatarUploadProps) {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(url)

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Vous devez sélectionner une image.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setPreview(publicUrl)
      onUpload(publicUrl)
    } catch (error) {
      alert('Erreur lors de l\'upload de l\'image')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group w-24 h-24">
        {preview ? (
          <Image
            src={preview}
            alt="Avatar"
            fill
            className="rounded-full object-cover border-2 border-slate-100 shadow-sm"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200 border-dashed">
            <User className="w-8 h-8 text-slate-400" />
          </div>
        )}
        
        <label 
          className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
          htmlFor="avatar-upload"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </label>
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="hidden"
        />
      </div>
      <p className="text-xs text-slate-500">Cliquez pour modifier</p>
    </div>
  )
}
