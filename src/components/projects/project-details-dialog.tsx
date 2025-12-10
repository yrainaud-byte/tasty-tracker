'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar, 
  Clock, 
  User, 
  Send, 
  Paperclip, 
  MoreHorizontal, 
  CheckCircle2, 
  Circle, 
  Plus,
  Trash2
} from 'lucide-react'

// Type temporaire pour l'UI (en attendant la table 'tasks' dans Supabase)
type Task = {
  id: string
  title: string
  completed: boolean
  assignee?: string
}

export function ProjectDetailsDialog({ project, isOpen, onClose }: { project: any, isOpen: boolean, onClose: () => void }) {
  // État local pour simuler les tâches (à connecter à Supabase plus tard)
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Brief initial client', completed: true, assignee: 'JD' },
    { id: '2', title: 'Maquettes UX/UI', completed: false, assignee: 'SM' },
    { id: '3', title: 'Développement Front-end', completed: false },
  ])
  const [newTask, setNewTask] = useState('')

  if (!project) return null

  // Logique UI pour les tâches
  const addTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return
    setTasks([...tasks, { id: Date.now().toString(), title: newTask, completed: false }])
    setNewTask('')
  }

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t))
  }

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId))
  }

  // Calcul progression
  const completedCount = tasks.filter(t => t.completed).length
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-50 border-none shadow-2xl sm:rounded-2xl">
        
        {/* HEADER (Fixe) */}
        <div className="p-6 border-b border-slate-200 bg-white flex-none z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div 
                  className="w-12 h-12 rounded-xl shadow-sm flex items-center justify-center text-lg font-bold text-white" 
                  style={{ backgroundColor: project.color }} 
                >
                  {project.name.substring(0, 2).toUpperCase()}
                </div>
                {/* Petit indicateur de statut */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${project.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
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
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex text-slate-600 border-slate-200 hover:bg-slate-50">
                <Clock className="w-4 h-4 mr-2" />
                Lancer Timer
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-8 text-sm border-t border-slate-100 pt-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Échéance</span>
              <div className="flex items-center gap-2 font-medium text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400" />
                30 Oct 2025
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Budget</span>
              <div className="flex items-center gap-2 font-medium text-slate-700">
                <Clock className="w-4 h-4 text-slate-400" />
                12h / {project.budget_hours || 0}h
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-1 max-w-[200px]">
              <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                <span>Avancement</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>

        {/* CONTENU (Scrollable) */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50">
          <Tabs defaultValue="tasks" className="flex-1 flex flex-col h-full">
            
            <div className="px-6 border-b border-slate-200 bg-white sticky top-0 z-10">
              <TabsList className="bg-transparent h-auto p-0 space-x-6">
                <TabsTrigger 
                  value="tasks" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 text-slate-500 rounded-none px-2 py-4 text-sm font-medium border-b-2 border-transparent transition-all"
                >
                  Tâches <span className="ml-2 bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-xs">{tasks.filter(t => !t.completed).length}</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="updates" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 text-slate-500 rounded-none px-2 py-4 text-sm font-medium border-b-2 border-transparent transition-all"
                >
                  Mises à jour
                </TabsTrigger>
                <TabsTrigger 
                  value="info" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 text-slate-500 rounded-none px-2 py-4 text-sm font-medium border-b-2 border-transparent transition-all"
                >
                  Infos & Fichiers
                </TabsTrigger>
              </TabsList>
            </div>

            {/* --- ONGLET TÂCHES (Le nouveau coeur) --- */}
            <TabsContent value="tasks" className="flex-1 p-0 overflow-y-auto outline-none">
              <div className="p-6 max-w-3xl mx-auto space-y-6">
                
                {/* Ajout rapide */}
                <form onSubmit={addTask} className="flex gap-3">
                  <Input 
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Ajouter une nouvelle tâche..." 
                    className="bg-white border-slate-200 shadow-sm focus-visible:ring-blue-500"
                  />
                  <Button type="submit" disabled={!newTask.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Ajouter
                  </Button>
                </form>

                {/* Liste des tâches */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {tasks.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>Aucune tâche pour le moment.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {tasks.map((task) => (
                        <div 
                          key={task.id} 
                          className={`group flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${task.completed ? 'bg-slate-50/50' : ''}`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <button 
                              onClick={() => toggleTask(task.id)}
                              className={`flex-none w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                task.completed 
                                  ? 'bg-blue-600 border-blue-600 text-white' 
                                  : 'border-slate-300 text-transparent hover:border-blue-400'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <span className={`text-sm font-medium transition-colors ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                              {task.title}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {task.assignee && (
                              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold border border-indigo-200">
                                {task.assignee}
                              </div>
                            )}
                            <button 
                              onClick={() => deleteTask(task.id)}
                              className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </TabsContent>

            {/* --- ONGLET MISES À JOUR --- */}
            <TabsContent value="updates" className="flex-1 p-0 overflow-y-auto outline-none">
              <div className="p-6 max-w-3xl mx-auto space-y-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-shadow">
                  <Textarea 
                    placeholder="Écrivez une mise à jour pour l'équipe..." 
                    className="border-none focus-visible:ring-0 resize-none min-h-[80px] p-0 text-base placeholder:text-slate-400"
                  />
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
                      <Paperclip className="w-4 h-4 mr-2" />
                      Joindre un fichier
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                      Publier <Send className="w-3 h-3 ml-2" />
                    </Button>
                  </div>
                </div>

                <div className="relative pl-6 border-l-2 border-slate-100 ml-3 space-y-8 pb-8">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 bg-white p-1 rounded-full border border-slate-200">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-600 text-white text-xs font-medium">JD</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-semibold text-slate-900 text-sm">Jean Dupont</span>
                          <span className="text-xs text-slate-400 ml-2">Il y a 2h</span>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        Le projet avance bien. J'ai terminé les maquettes de la page d'accueil. En attente du feedback client pour passer à la suite.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* --- ONGLET INFOS --- */}
            <TabsContent value="info" className="flex-1 p-6 overflow-y-auto outline-none">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    <Circle className="w-4 h-4 text-blue-500 fill-current" />
                    Informations Générales
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Statut</label>
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 capitalize">
                        {project.status === 'active' ? 'En cours' : project.status}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Priorité</label>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Haute
                      </div>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Description</label>
                      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                        {project.description || "Aucune description détaillée pour ce projet."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

          </Tabs>
        </div>

      </DialogContent>
    </Dialog>
  )
}
