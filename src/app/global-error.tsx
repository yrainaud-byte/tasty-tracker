'use client'

export default function GlobalError({ error, reset }: { error: Error, reset: () => void }) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2>Erreur Critique</h2>
          <p>{error.message}</p>
          <button onClick={() => reset()}>Recharger</button>
        </div>
      </body>
    </html>
  )
}
