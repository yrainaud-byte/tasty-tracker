'use client'

import { useMemo } from 'react'
import { format, addMonths, startOfMonth, isSameMonth, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

interface WorkloadProps {
  tasks: any[]   
  members: any[] 
}

export function WorkloadView({ tasks, members }: WorkloadProps) {
  
  const nextMonths = useMemo(() => {
    const months = []
    const today = startOfMonth(new Date())
    for (let i = 0; i < 4; i++) {
      months.push(addMonths(today, i))
    }
    return months
  }, [])

  // Calcul de la charge en HEURES
  const workloadData = useMemo(() => {
    const data: Record<string, Record<string, number>> = {}

    members.forEach(m => {
      data[m.user_id] = {}
      nextMonths.forEach(month => {
        const monthKey = format(month, 'yyyy-MM')
        data[m.user_id][monthKey] = 0
      })
    })

    tasks.forEach(task => {
      if (!task.assigned_to || !task.due_date) return
      
      const taskDate = parseISO(task.due_date) // Assurez-vous que vos tâches ont une due_date (sinon utiliser created_at)
      const monthKey = format(taskDate, 'yyyy-MM')
      
      if (data[task.assigned_to] && data[task.assigned_to][monthKey] !== undefined) {
        if (task.status !== 'done') {
            // C'EST ICI QUE ÇA CHANGE : On additionne les heures estimées
            const hours = parseFloat(task.estimated_hours || 0)
            data[task.assigned_to][monthKey] += hours
        }
      }
    })

    return data
  }, [tasks, members, nextMonths])

  // Code couleur adapté aux heures (Ex: > 100h/mois = rouge)
  const getLoadColor = (hours: number) => {
    if (hours === 0) return 'bg-slate-50 text-slate-400'
    if (hours <= 80) return 'bg-green-100 text-green-700'  // Charge OK (< 2 semaines)
    if (hours <= 140) return 'bg-orange-100 text-orange-700' // Charge Élevée
    return 'bg-red-100 text-red-700 font-bold' // Surcharge (> 1 mois complet)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">📊 Charge de travail (Heures estimées)</h3>
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
                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {member.full_name?.charAt(0) || '?'}
                  </div>
                  {member.full_name?.split(' ')[0]}
                </td>
                {nextMonths.map(month => {
                  const monthKey = format(month, 'yyyy-MM')
                  const hours = workloadData[member.user_id]?.[monthKey] || 0
                  
                  return (
                    <td key={monthKey} className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs ${getLoadColor(hours)}`}>
                        {hours > 0 ? `${hours}h` : '-'}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
