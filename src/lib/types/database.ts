export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          hourly_rate: number
          role: 'admin' | 'manager' | 'member'
          created_at: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string
          budget_hours: number | null
          created_at: string
        }
      }
      time_entries: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          duration_minutes: number
          date: string
          notes: string | null
          is_billable: boolean
          created_at: string
        }
      }
    }
  }
}
