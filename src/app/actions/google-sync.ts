'use server'

import { google } from 'googleapis'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function syncProjectToGoogle(projectId: string) {
  const supabase = await createServerSupabaseClient()

  // 1. Récupérer la session utilisateur pour avoir son TOKEN Google
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session || !session.provider_token) {
    console.error("Pas de token Google trouvé. L'utilisateur doit se reconnecter avec Google.")
    return { error: "Non connecté avec Google" }
  }

  // 2. Récupérer le projet
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (!project || !project.start_date) return { error: "Date manquante" }

  // 3. Initialiser Google Calendar avec le token de l'utilisateur
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: session.provider_token })
  
  const calendar = google.calendar({ version: 'v3', auth })

  const eventBody = {
    summary: `🎥 ${project.name}`,
    description: `Projet Tasty Tracker`,
    location: project.location,
    start: { dateTime: new Date(project.start_date).toISOString() },
    end: { dateTime: new Date(project.end_date).toISOString() },
  }

  try {
    let googleId = project.google_event_id

    if (googleId) {
      // UPDATE
      await calendar.events.update({
        calendarId: 'primary', // 'primary' = l'agenda principal de l'utilisateur connecté
        eventId: googleId,
        requestBody: eventBody,
      })
    } else {
      // INSERT
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: eventBody,
      })
      googleId = response.data.id
      
      // Sauvegarde ID
      await supabase
        .from('projects')
        .update({ google_event_id: googleId })
        .eq('id', projectId)
    }
    
    return { success: true }

  } catch (error) {
    console.error('Erreur API Google:', error)
    return { error: "Erreur lors de la communication avec Google" }
  }
}
