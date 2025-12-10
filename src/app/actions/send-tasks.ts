'use server'

export async function sendTaskToCalendar(taskData: any) {
  // L'URL secrète que Make (ou Zapier) va nous donner à l'étape 2
  // Pour l'instant on met une fausse, on la changera après
  const WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL 

  if (!WEBHOOK_URL) return { error: "Webhook non configuré" }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titre: taskData.name,
        date_debut: taskData.start_date,
        date_fin: taskData.end_date,
        description: `Projet ID: ${taskData.id} - ${taskData.description || ''}`,
        lieu: taskData.location || 'Bureau'
      })
    })

    if (response.ok) {
      return { success: true }
    } else {
      return { error: "Erreur lors de l'envoi" }
    }
  } catch (e) {
    return { error: "Erreur connexion" }
  }
}
