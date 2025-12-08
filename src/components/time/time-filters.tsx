'use client'
import { useRouter, useSearchParams } from 'next/navigation'

const periods = [
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
]

export function TimeFilters({ currentPeriod }: { currentPeriod: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePeriodChange = (period: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', period)
    router.push(`/time?${params.toString()}`)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Période :</span>
        <div className="flex gap-2">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => handlePeriodChange(period.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentPeriod === period.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
