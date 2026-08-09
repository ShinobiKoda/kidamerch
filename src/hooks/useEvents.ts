import { useQuery } from '@tanstack/react-query'
import { eventsApi, type Event } from '@/api/events'

export const eventKeys = {
  all: ['events'] as const,
  upcoming: (limit: number) => [...eventKeys.all, 'upcoming', limit] as const,
}

export function useUpcomingEvents(limit = 3) {
  return useQuery<Event[], Error>({
    queryKey: eventKeys.upcoming(limit),
    queryFn: () => eventsApi.getUpcomingEvents(limit),
    staleTime: 1000 * 60 * 15, // 15 minutes
  })
}