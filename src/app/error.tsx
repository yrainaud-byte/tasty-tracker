'use client'

export default function Error({ error, reset }: { error: Error, reset: () => void }) {
  return (
    <div className="p-10 text-center">
      <h2 className="text-red-600 font-bold mb-4">Une erreur est survenue</h2>
      <p className="mb-4 bg-slate-100 p-2 rounded">{error.message}</p>
      <button onClick={() => reset()} className="bg-blue-600 text-white px-4 py-2 rounded">
        Réessayer
      </button>
    </div>
  )
}
