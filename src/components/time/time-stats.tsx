'use client'

interface TimeStatsProps {
  totalHours: number
  billableHours: number
  entriesCount: number
}

export function TimeStats({ totalHours, billableHours, entriesCount }: TimeStatsProps) {
  const nonBillableHours = totalHours - billableHours
  const billablePercent = totalHours > 0 ? (billableHours / totalHours) * 100 : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Total heures</h3>
        <div className="text-3xl font-bold text-gray-900">{totalHours.toFixed(1)}h</div>
        <p className="text-xs text-gray-500 mt-1">{entriesCount} pointage{entriesCount > 1 ? 's' : ''}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Heures facturables</h3>
        <div className="text-3xl font-bold text-green-600">{billableHours.toFixed(1)}h</div>
        <p className="text-xs text-gray-500 mt-1">{billablePercent.toFixed(0)}% du total</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Heures non facturables</h3>
        <div className="text-3xl font-bold text-orange-600">{nonBillableHours.toFixed(1)}h</div>
        <p className="text-xs text-gray-500 mt-1">{(100 - billablePercent).toFixed(0)}% du total</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Moyenne / jour</h3>
        <div className="text-3xl font-bold text-blue-600">{(totalHours / 7).toFixed(1)}h</div>
        <p className="text-xs text-gray-500 mt-1">Sur 7 jours</p>
      </div>
    </div>
  )
}
