'use client'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Circle, CalendarDays, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// Type simulé pour une tâche (à adapter avec votre vraie table Supabase 'tasks')
type Task = {
  id: string
  title: string
  project: { name: string, color: string }
  dueDate: string
  completed: boolean
}

// Données de démonstration (Mock)
const MOCK_TASKS: Task[] = [
  { 
    id: '1', 
    title: 'Valider les maquettes Homepage', 
    project: { name: 'Refonte Site Web', color: '#3b82f6' }, 
    dueDate: new Date().toISOString().split('T')[0], // Aujourd'hui
    completed: false 
  },
  { 
    id: '2', 
    title: 'Envoyer le devis final', 
    project: { name: 'Campagne Nike', color: '#ef4444' }, 
    dueDate: new Date().toISOString().split('T')[0], 
    completed: true 
  },
  { 
    id: '3', 
    title: 'Réunion de lancement', 
    project: { name: 'App Mobile', color: '#10b981' }, 
    dueDate: '2025-10-25', // Futur
    completed: false 
  },
  { 
    id: '4', 
    title: 'Préparer les assets graphiques', 
    project: { name: 'Campagne Nike', color: '#ef4444' }, 
    dueDate: '2025-10-26', 
    completed: false 
  },
]

export function MyTasksWidget() {
  const [tasks, setTasks] = useState(MOCK_TASKS)

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  // Filtres de date
  const today = new Date().toISOString().split('T')[0]
  const todaysTasks = tasks.filter(t => t.dueDate === today)
  const weekTasks = tasks.filter(t => t.dueDate >= today) // Simplifié pour l'exemple

  const TaskList = ({ items }: { items: Task[] }) => (
    <div className="space-y-1">
      {items.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-20" />
          Rien de prévu pour le moment.
        </div>
      ) : (
        items.map((task) => (
          <div 
            key={task.id} 
            className="group flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            onClick={() => toggleTask(task.id)}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <button className={cn(
                "flex-none w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                task.completed ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 text-transparent hover:border-blue-400"
              )}>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
              
              <div className="flex flex-col min-w-0">
                <span className={cn(
                  "text-sm font-medium truncate transition-all",
                  task.completed ? "text-slate-400 line-through" : "text-slate-700"
                )}>
                  {task.title}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.project.color }}></span>
                  {task.project.name}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          Mes Tâches
        </h3>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
          + Ajouter
        </button>
      </div>

      <Tabs defaultValue="today" className="flex-1 flex flex-col">
        <div className="px-5 pt-2">
          <TabsList className="bg-slate-100/50 p-1 w-full justify-start h-auto rounded-lg">
            <TabsTrigger 
              value="today" 
              className="flex-1 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-1.5"
            >
              Aujourd'hui <span className="ml-1.5 bg-slate-200 text-slate-600 px-1.5 rounded-full text-[10px]">{todaysTasks.filter(t => !t.completed).length}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="week" 
              className="flex-1 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-1.5"
            >
              Cette semaine
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 p-3 overflow-y-auto min-h-[300px]">
          <TabsContent value="today" className="m-0 space-y-2 outline-none">
            <TaskList items={todaysTasks} />
          </TabsContent>
          <TabsContent value="week" className="m-0 space-y-2 outline-none">
            <TaskList items={weekTasks} />
          </TabsContent>
        </div>
        
        <div className="p-3 border-t border-slate-50 bg-slate-50/30">
          <button className="w-full text-xs text-slate-500 hover:text-slate-800 font-medium py-2 flex items-center justify-center gap-1 transition-colors">
            Voir toutes mes tâches <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </Tabs>
    </div>
  )
}
