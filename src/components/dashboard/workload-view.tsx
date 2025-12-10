'use client'

import { useMemo } from 'react'
import { format, addMonths, startOfMonth, isSameMonth, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

interface WorkloadProps {
  tasks: any[]   // Liste brute des tâches venant de Supabase
  members: any[] // Liste des membres de l'équipe
}

export function WorkloadView({ tasks, members }: WorkloadProps) {
  
  // 1. On calcule les 4 prochains mois à afficher
  const nextMonths = useMemo(() => {
    const months = []
    const today = startOfMonth(new Date())
    for (let i = 0; i < 4; i++) {
      months.push(addMonths(today, i))
    }
    return months
  }, [])

  // 2. On calcule la charge (Nombre de tâches par user par mois)
  const workloadData = useMemo(() => {
    const data: Record<string, Record<string, number>> = {}

    // Initialiser la structure vide pour tout le monde
    members.forEach(m => {
      data[m.user_id] = {}
      nextMonths.forEach(month => {
        const monthKey = format(month, 'yyyy-MM')
        data[m.user_id][monthKey] = 0
      })
    })

    // Remplir avec les tâches
    tasks.forEach(task => {
      if (!task.assigned_to || !task.due_date) return
      
      const taskDate = parseISO(task.due_date)
      const monthKey = format(taskDate, 'yyyy-MM')
      
      // Si la tâche est dans un des mois affichés et assignée à un membre connu
      if (data[task.assigned_to] && data[task.assigned_to][monthKey] !== undefined) {
        // On ne compte pas les tâches terminées
        if (task.status !== 'done') {
            data[task.assigned_to][monthKey] += 1
        }
      }
    })

    return data
  }, [tasks, members, nextMonths])

  // Fonction pour déterminer la couleur selon la charge
  const getLoadColor = (count: number) => {
    if (count === 0) return 'bg-slate-50 text-slate-400' // Rien
    if (count <= 2) return 'bg-green-100 text-green-700' // Tranquille
    if (count <= 5) return 'bg-orange-100 text-orange-700' // Occupé
    return 'bg-red-100 text-red-700 font-bold' // Surchargé (6+ tâches)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">📊 Charge de travail (Tâches actives)</h3>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Vision 4 mois</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4 w-1/4">Membre</th>
              {nextMonths.map(month => (
                <th key={month.toString()} className="px-6 py-4 text-center">
                  {format(month, 'MMMM', { locale: fr })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map(member => (
              <tr key={member.user_id} className="hover:bg-slate-50/50 transition">
                
                {/* Colonne Membre */}
                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {member.user?.full_name?.charAt(0) || '?'}
                  </div>
                  {member.user?.full_name?.split(' ')[0]}
                </td>

                {/* Colonnes Mois */}
                {nextMonths.map(month => {
                  const monthKey = format(month, 'yyyy-MM')
                  const count = workloadData[member.user_id]?.[monthKey] || 0
                  
                  return (
                    <td key={monthKey} className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs ${getLoadColor(count)}`}>
                        {count > 0 ? `${count} tâches` : '-'}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-3 bg-slate-50 text-xs text-center text-slate-400">
        Les tâches terminées ne sont pas comptabilisées.
      </div>
    </div>
  )
}
