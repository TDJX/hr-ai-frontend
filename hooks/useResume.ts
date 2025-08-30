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
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  })
}