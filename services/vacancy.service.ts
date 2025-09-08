import { kyClient, kyFormClient } from '@/lib/ky-client'
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

    const endpoint = `v1/vacancies/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    return kyClient.get(endpoint).json<VacancyRead[]>()
  },

  async getVacancy(id: number): Promise<VacancyRead> {
    return kyClient.get(`v1/vacancies/${id}`).json<VacancyRead>()
  },

  async parseFileAsync(file: File, createVacancy: boolean = true): Promise<{
    message: string
    task_id: string
    status: string
    check_status_url: string
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('create_vacancy', createVacancy.toString())

    return kyFormClient.post('v1/vacancies/parse-file-async', {
      body: formData
    }).json()
  },
}