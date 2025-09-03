import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { resumeService } from '@/services/resume.service'
import { ResumeCreate, GetResumesParams } from '@/types/api'

export const useCreateResume = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: ResumeCreate) => resumeService.createResume(data),
    onSuccess: () => {
      // Invalidate and refetch resumes
      queryClient.invalidateQueries({ queryKey: ['resumes'] })
    },
  })
}

export const useResume = (id: number) => {
  return useQuery({
    queryKey: ['resume', id],
    queryFn: () => resumeService.getResume(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

export const useResumes = (params?: GetResumesParams) => {
  return useQuery({
    queryKey: ['resumes', params],
    queryFn: () => resumeService.getResumes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

export const useResumesByVacancy = (vacancyId: number) => {
  return useQuery({
    queryKey: ['resumes', 'by-vacancy', vacancyId],
    queryFn: () => resumeService.getResumes({ vacancy_id: vacancyId }),
    enabled: !!vacancyId,
    staleTime: 0, // Не кешируем для частых обновлений
    retry: 2,
    refetchInterval: false, // Отключаем автоматический refetch, управляем вручную
  })
}

export const useValidateInterview = (resumeId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['interview', 'validate', resumeId],
    queryFn: () => resumeService.validateInterview(resumeId),
    enabled: enabled && !!resumeId,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 минут
  })
}

export const useInterviewToken = (resumeId: number, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['interview', 'token', resumeId],
    queryFn: () => resumeService.getInterviewToken(resumeId),
    enabled: enabled && !!resumeId,
    retry: false,
    staleTime: 30 * 60 * 1000, // 30 минут - токены живут дольше
  })
}