import { useQuery } from '@tanstack/react-query'
import { vacancyService } from '@/services/vacancy.service'
import { GetVacanciesParams } from '@/types/api'

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