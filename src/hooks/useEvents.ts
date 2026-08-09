// src/hooks/useEvents.ts
import { useQuery } from '@tanstack/react-query'
import { eventsApi, type Event } from '@/api/events'

export const eventKeys = {
  all: ['events'] as const,
  featured: (limit: number) => [...eventKeys.all, 'featured', limit] as const,
}

export function useEvents() {
  return useQuery<Event[], Error>({
    queryKey: eventKeys.all,
    queryFn: eventsApi.getEvents,
    staleTime: 1000 * 60 * 5,
  })
}

export function useFeaturedEvents(limit = 3) {
  return useQuery<Event[], Error>({
    queryKey: eventKeys.featured(limit),
    queryFn: () => eventsApi.getFeaturedEvents(limit),
    staleTime: 1000 * 60 * 10,
  })
}