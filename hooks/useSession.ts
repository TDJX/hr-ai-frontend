import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '@/services/session.service'

export const useCurrentSession = () => {
  return useQuery({
    queryKey: ['session', 'current'],
    queryFn: () => sessionService.getCurrentSession(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

export const useRefreshSession = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => sessionService.refreshSession(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => sessionService.logout(),
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

export const useSessionHealth = () => {
  return useQuery({
    queryKey: ['session', 'health'],
    queryFn: () => sessionService.healthCheck(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  })
}

export const useForceEndInterview = () => {
  return useMutation({
    mutationFn: (sessionId: number) => sessionService.forceEndInterview(sessionId),
    retry: false, // Не повторяем запрос при ошибке
    networkMode: 'always',
  })
}