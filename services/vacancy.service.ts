import { kyClient } from '@/lib/ky-client'
import { VacancyRead, GetVacanciesParams } from '@/types/api'

export const vacancyService = {
  async getVacancies(params?: GetVacanciesParams): Promise<VacancyRead[]> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `api/v1/vacancies/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    return kyClient.get(endpoint).json<VacancyRead[]>()
  },

  async getVacancy(id: number): Promise<VacancyRead> {
    return kyClient.get(`api/v1/vacancies/${id}`).json<VacancyRead>()
  },
}