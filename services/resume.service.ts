import { kyClient, kyFormClient } from '@/lib/ky-client'
import { ResumeRead, ResumeCreate, GetResumesParams } from '@/types/api'

export const resumeService = {
  async createResume(data: ResumeCreate): Promise<ResumeRead> {
    const formData = new FormData()
    
    formData.append('vacancy_id', data.vacancy_id.toString())
    formData.append('applicant_name', data.applicant_name)
    formData.append('applicant_email', data.applicant_email)
    
    if (data.applicant_phone) {
      formData.append('applicant_phone', data.applicant_phone)
    }
    
    if (data.cover_letter) {
      formData.append('cover_letter', data.cover_letter)
    }
    
    formData.append('resume_file', data.resume_file)

    // Логируем данные для отладки
    console.log('FormData entries:')
    // @ts-ignore
    for (const [key, value] of formData.entries()) {
      console.log(key, value)
    }

    return kyFormClient.post('v1/resumes/', {
      body: formData,
    }).json<ResumeRead>()
  },

  async getResume(id: number): Promise<ResumeRead> {
    return kyClient.get(`v1/resumes/${id}`).json<ResumeRead>()
  },

  async getResumes(params?: GetResumesParams): Promise<ResumeRead[]> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `v1/resumes/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    return kyClient.get(endpoint).json<ResumeRead[]>()
  },

  async validateInterview(resumeId: number): Promise<{ can_interview: boolean; message?: string }> {
    return kyClient.get(`v1/interview/${resumeId}/validate-interview`).json()
  },

  async getInterviewToken(resumeId: number): Promise<{ token: string; roomName: string; serverUrl: string; session_id: number }> {
    return kyClient.post(`v1/interview/${resumeId}/token`).json()
  },
}