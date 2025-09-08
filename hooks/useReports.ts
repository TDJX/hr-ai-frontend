import { useQuery } from '@tanstack/react-query'
import { interviewReportService } from '@/services/reports.service'

export const useInterviewReports = (vacancyId: number) => {
  return useQuery({
    queryKey: ['interviewReports', vacancyId],
    queryFn: () => interviewReportService.getReportsByVacancy(vacancyId),
    enabled: !!vacancyId,
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: 2,
  })
}

export const useInterviewReport = (sessionId: number) => {
  return useQuery({
    queryKey: ['interviewReport', sessionId],
    queryFn: () => interviewReportService.getReportBySession(sessionId),
    enabled: !!sessionId,
    staleTime: 10 * 60 * 1000, // 10 минут
    retry: 2,
  })
}
