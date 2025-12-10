'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from 'lucide-react'
import { AvatarUpload } from './avatar-upload'
// 👇 Import de l'action serveur que nous venons de créer
import { createMemberAction } from '@/app/actions/create-member'

export function CreateMemberDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Form states
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [hourlyRate, setHourlyRate] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Appel à la Server Action sécurisée
      const result = await createMemberAction({
        fullName,
        email,
        role,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : 0,
        avatarUrl
      })

      if (result.error) {
        alert(result.error)
        setLoading(false)
        return
      }

      // Succès
      setOpen(false)
      setFullName('')
      setEmail('')
      setHourlyRate('')
      setAvatarUrl(null)
      router.refresh()
      
    } catch (error) {
      console.error(error)
      alert("Une erreur inattendue est survenue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-900 text-white hover:bg-slate-800">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un membre
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouveau membre d'équipe</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <AvatarUpload url={avatarUrl} onUpload={setAvatarUrl} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input 
              id="name" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              placeholder="Jean Dupont"
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email professionnel</Label>
            <Input 
              id="email" 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="jean@tastyvideo.fr"
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <select 
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="member">Membre</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rate">Taux horaire (€)</Label>
              <Input 
                id="rate" 
                type="number"
                value={hourlyRate} 
                onChange={(e) => setHourlyRate(e.target.value)} 
                placeholder="0"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Créer et Inviter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
