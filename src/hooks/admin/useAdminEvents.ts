import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminEventsApi } from '@/api/admin/events'
import type { AdminEvent, CreateEventInput, UpdateEventInput } from '@/types/admin'

export const adminEventKeys = {
  all: ['admin', 'events'] as const,
  detail: (id: string) => [...adminEventKeys.all, 'detail', id] as const,
}

export function useAdminEvents() {
  return useQuery<AdminEvent[], Error>({
    queryKey: adminEventKeys.all,
    queryFn: adminEventsApi.getAll,
    staleTime: 1000 * 60,
  })
}

export function useAdminEvent(id: string) {
  return useQuery<AdminEvent, Error>({
    queryKey: adminEventKeys.detail(id),
    queryFn: () => adminEventsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation<AdminEvent, Error, CreateEventInput>({
    mutationFn: adminEventsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminEventKeys.all }),
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation<AdminEvent, Error, { id: string; input: UpdateEventInput }>({
    mutationFn: ({ id, input }) => adminEventsApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminEventKeys.all }),
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await adminEventsApi.remove(id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminEventKeys.all }),
  })
}

// Toggling featured needs the full event + current featured count, since the
// PUT endpoint replaces the whole row. Returns false (without mutating) if the
// 3-event cap would be exceeded, so the caller can toast an error.
export function useToggleFeatured() {
  const queryClient = useQueryClient()
  const updateEvent = useUpdateEvent()

  return {
    ...updateEvent,
    toggle: async (event: AdminEvent, allEvents: AdminEvent[]): Promise<boolean> => {
      const nextFeatured = !event.featured
      if (nextFeatured) {
        const featuredCount = allEvents.filter((e) => e.featured && e.id !== event.id).length
        if (featuredCount >= 3) return false
      }
      await updateEvent.mutateAsync({
        id: event.id,
        input: {
          name: event.name,
          kind: event.kind,
          date: event.date,
          location: event.location,
          description: event.description,
          cover: event.cover,
          gallery: event.gallery,
          status: event.status,
          featured: nextFeatured,
        },
      })
      queryClient.invalidateQueries({ queryKey: adminEventKeys.all })
      return true
    },
  }
}