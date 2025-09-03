'use client'

import { useParams, useRouter } from 'next/navigation'
import InterviewSession from '@/components/InterviewSession'
import { useValidateInterview } from '@/hooks/useResume'
import { ArrowLeft, AlertCircle, Loader } from 'lucide-react'

export default function InterviewPage() {
  const params = useParams()
  const router = useRouter()
  const resumeId = parseInt(params.id as string)
  
  const { data: validationData, isLoading, error } = useValidateInterview(resumeId)

  const handleInterviewEnd = () => {
    // Перенаправляем обратно к вакансии или на главную страницу
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Проверяем готовность к собеседованию
        </h2>
        <p className="text-gray-600 text-center max-w-md">
          Пожалуйста, подождите...
        </p>
      </div>
    )
  }

  if (error || !validationData?.can_interview) {
    const errorMessage = error?.response?.status === 404 
      ? 'Резюме не найдено'
      : error?.response?.status === 400
      ? 'Резюме еще не готово к собеседованию'
      : validationData?.message || 'Собеседование недоступно'

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Собеседование недоступно
        </h2>
        <p className="text-gray-600 text-center max-w-md mb-6">
          {errorMessage}
        </p>
        <div className="space-x-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </button>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            На главную
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Вернуться назад
          </button>
          
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-900">
              HR Собеседование
            </h1>
            <p className="text-sm text-gray-500">
              Резюме #{resumeId}
            </p>
          </div>
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Interview Session */}
      <InterviewSession 
        resumeId={resumeId} 
        onEnd={handleInterviewEnd}
      />
    </div>
  )
}