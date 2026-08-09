// src/api/events.ts
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

export type Event = Database['public']['Tables']['events']['Row']

export const eventsApi = {
  getEvents: async (): Promise<Event[]> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })

    if (error) throw new Error(error.message)
    return data ?? []
  },

  getFeaturedEvents: async (limit = 3): Promise<Event[]> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('featured', true)
      .order('date', { ascending: true })
      .limit(limit)

    if (error) throw new Error(error.message)
    return data ?? []
  },
}