import { kyClient } from '@/lib/ky-client'
import { InterviewReport } from "@/components/VacancyReports";


export const interviewReportService = {
  async getReportsByVacancy(vacancyId: number): Promise<InterviewReport[]> {
    if (!vacancyId) throw new Error('Vacancy ID is required')
    const endpoint = `v1/interview-reports/vacancy/${vacancyId}`
    return kyClient.get(endpoint).json<InterviewReport[]>()
  },

  async getReportBySession(sessionId: number): Promise<InterviewReport> {
    if (!sessionId) throw new Error('Session ID is required')
    const endpoint = `v1/interview-reports/session/${sessionId}`
    return kyClient.get(endpoint).json<InterviewReport>()
  },

  async updateReportScores(reportId: number, scores: Partial<InterviewReport>) {
    if (!reportId) throw new Error('Report ID is required')
    const endpoint = `v1/interview-reports/${reportId}/scores`
    return kyClient.patch(endpoint, { json: scores }).json()
  },

  async updateReportNotes(reportId: number, notes: string) {
    if (!reportId) throw new Error('Report ID is required')
    const endpoint = `v1/interview-reports/${reportId}/notes`
    return kyClient.patch(endpoint, { json: { notes } }).json()
  },

  async updateReportPdf(reportId: number, pdfUrl: string) {
    if (!reportId) throw new Error('Report ID is required')
    const endpoint = `v1/interview-reports/${reportId}/pdf`
    return kyClient.patch(endpoint, { json: { pdf_url: pdfUrl } }).json()
  },

  async createReport(reportData: Partial<InterviewReport>) {
    const endpoint = `v1/interview-reports/create`
    return kyClient.post(endpoint, { json: reportData }).json<InterviewReport>()
  },
}
