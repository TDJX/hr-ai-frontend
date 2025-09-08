import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vacancyService } from '@/services/vacancy.service'
import { GetVacanciesParams } from '@/types/api'
import { useEffect, useRef } from 'react'

export const useVacancies = (params?: GetVacanciesParams) => {
  return useQuery({
    queryKey: ['vacancies', params],
    queryFn: () => vacancyService.getVacancies(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

export const useVacancy = (id: number) => {
  return useQuery({
    queryKey: ['vacancy', id],
    queryFn: () => vacancyService.getVacancy(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

export const useParseVacancyFile = () => {
  const queryClient = useQueryClient()
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const mutation = useMutation({
    mutationFn: ({ file, createVacancy }: { file: File; createVacancy?: boolean }) =>
      vacancyService.parseFileAsync(file, createVacancy),
    onSuccess: (data) => {
      // Показать уведомление об успешном запуске парсинга
      alert('Задача парсинга запущена! Скоро вакансия появится в списке.')
      
      // Начать опрос списка вакансий каждые 5 секунд
      pollIntervalRef.current = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['vacancies'] })
      }, 5000)
      
      // Остановить опрос через 2 минуты
      setTimeout(() => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
          pollIntervalRef.current = null
        }
      }, 120000)
    },
  })

  // Очистить интервал при размонтировании компонента
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [])

  return mutation
}