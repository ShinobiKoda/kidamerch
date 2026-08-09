import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types' // Adjust path if needed

export type Event = Database['public']['Tables']['events']['Row']

export const eventsApi = {
  getUpcomingEvents: async (limit = 3): Promise<Event[]> => {
    const today = new Date().toISOString()

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(limit)

    if (error) {
      throw new Error(error.message)
    }

    return data ?? []
  },
}