'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client' // Assurez-vous que ce fichier existe
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar, Clock, User, CheckCircle2, Plus, Trash2, Loader2, AlertCircle 
} from 'lucide-react'

export function ProjectDetailsDialog({ project, isOpen, onClose }: { project: any, isOpen: boolean, onClose: () => void }) {
  const supabase = createClient()
  
  // États de données
  const [tasks, setTasks] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)

  // États du formulaire de création
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskAssignee, setNewTaskAssignee] = useState('')
  const [newTaskHours, setNewTaskHours] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // 1. Charger les données quand la modale s'ouvre
  useEffect(() => {
    if (isOpen && project) {
      loadData()
    }
  }, [isOpen, project])

  const loadData = async () => {
    setLoadingTasks(true)
    
    // A. Charger les tâches
    const { data: tasksData } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false })
    
    if (tasksData) setTasks(tasksData)

    // B. Charger les membres du projet pour le select
    // Note: On joint la table 'profiles' pour avoir les noms
    const { data: membersData } = await supabase
      .from('project_members')
      .select('user_id, user:profiles(id, full_name, email)')
      .eq('project_id', project.id)

    // Aplatir la structure pour faciliter l'usage
    const formattedMembers = membersData?.map((m: any) => ({
      id: m.user.id,
      name: m.user.full_name || m.user.email
    })) || []
    
    setMembers(formattedMembers)
    setLoadingTasks(false)
  }

  // 2. Créer une tâche
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    setIsCreating(true)
    try {
      const { data, error } = await supabase.from('project_tasks').insert({
        project_id: project.id,
        title: newTaskTitle,
        assigned_to: newTaskAssignee || null,
        estimated_hours: newTaskHours ? parseFloat(newTaskHours) : 0,
        status: 'todo',
        // On met la date du jour par défaut pour que ça s'affiche dans le workload du mois en cours
        due_date: new Date().toISOString() 
      }).select().single()

      if (data) {
        setTasks([data, ...tasks])
        // Reset form
        setNewTaskTitle('')
        setNewTaskHours('')
        setNewTaskAssignee('')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsCreating(false)
    }
  }

  // 3. Modifier le statut (Checkbox)
  const toggleTask = async (task: any) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    
    // Optimistic UI update (mise à jour immédiate visuelle)
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t))

    await supabase.from('project_tasks').update({ status: newStatus }).eq('id', task.id)
  }

  // 4. Supprimer
  const deleteTask = async (taskId: string) => {
    if(!confirm("Supprimer cette tâche ?")) return
    setTasks(tasks.filter(t => t.id !== taskId))
    await supabase.from('project_tasks').delete().eq('id', taskId)
  }

  if (!project) return null

  // Calculs pour l'en-tête
  const completedCount = tasks.filter(t => t.status === 'done').length
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-50 border-none shadow-2xl sm:rounded-2xl">
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-200 bg-white flex-none z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl shadow-sm flex items-center justify-center text-lg font-bold text-white" 
                style={{ backgroundColor: project.color || '#3b82f6' }} 
              >
                {project.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                  {project.name}
                </DialogTitle>
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                  <User className="w-3.5 h-3.5" />
                  {project.client?.company || project.client?.name || 'Client interne'}
                </div>
              </div>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="flex items-center gap-8 text-sm border-t border-slate-100 pt-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tâches</span>
              <div className="font-medium text-slate-700">
                {completedCount} / {tasks.length} terminées
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-1 max-w-[200px]">
              <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                <span>Progression</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </div>
        </div>

        {/* CONTENU */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50">
          <Tabs defaultValue="tasks" className="flex-1 flex flex-col h-full">
            
            <div className="px-6 border-b border-slate-200 bg-white sticky top-0 z-10">
              <TabsList className="bg-transparent h-auto p-0 space-x-6">
                <TabsTrigger value="tasks" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 text-slate-500 rounded-none px-2 py-4 text-sm font-medium border-b-2 border-transparent transition-all">
                  Tâches
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="tasks" className="flex-1 p-0 overflow-y-auto outline-none">
              <div className="p-6 max-w-3xl mx-auto space-y-6">
                
                {/* FORMULAIRE D'AJOUT RAPIDE */}
                <form onSubmit={handleAddTask} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex gap-3">
                    <Input 
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Nouvelle tâche..." 
                      className="flex-1 border-slate-200"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    {/* Select Membre */}
                    <select 
                      className="text-sm border border-slate-200 rounded-md px-3 py-2 bg-white text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none w-1/3"
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                    >
                      <option value="">-- Assigner à --</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>

                    {/* Input Heures */}
                    <div className="relative w-24">
                      <Input 
                        type="number" 
                        step="0.5"
                        placeholder="Nb h"
                        value={newTaskHours}
                        onChange={(e) => setNewTaskHours(e.target.value)}
                        className="pl-8"
                      />
                      <Clock className="w-3 h-3 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    <Button type="submit" disabled={!newTaskTitle.trim() || isCreating} className="bg-blue-600 hover:bg-blue-700 text-white ml-auto">
                      {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                      Ajouter
                    </Button>
                  </div>
                </form>

                {/* LISTE DES TÂCHES */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {loadingTasks ? (
                    <div className="p-8 text-center text-slate-400">Chargement...</div>
                  ) : tasks.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p>Aucune tâche pour le moment.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {tasks.map((task) => {
                        const assignee = members.find(m => m.id === task.assigned_to)
                        
                        return (
                          <div key={task.id} className={`group flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${task.status === 'done' ? 'bg-slate-50/50' : ''}`}>
                            
                            {/* Checkbox et Titre */}
                            <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                              <button 
                                onClick={() => toggleTask(task)}
                                className={`flex-none w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                  task.status === 'done'
                                    ? 'bg-blue-600 border-blue-600 text-white' 
                                    : 'border-slate-300 text-transparent hover:border-blue-400'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              <div className="truncate">
                                <span className={`text-sm font-medium transition-colors block truncate ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                  {task.title}
                                </span>
                              </div>
                            </div>
                            
                            {/* Infos Droite : Assignation, Heures, Delete */}
                            <div className="flex items-center gap-4 flex-none">
                              
                              {/* Temps */}
                              {task.estimated_hours > 0 && (
                                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md font-mono">
                                  {task.estimated_hours}h
                                </span>
                              )}

                              {/* Avatar Assigné */}
                              {assignee ? (
                                <div title={assignee.name} className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold border border-indigo-200">
                                  {assignee.name.charAt(0)}
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center">
                                  <User className="w-3 h-3 text-slate-300" />
                                </div>
                              )}

                              <button 
                                onClick={() => deleteTask(task.id)}
                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

              </div>
            </TabsContent>
          </Tabs>
        </div>

      </DialogContent>
    </Dialog>
  )
}
