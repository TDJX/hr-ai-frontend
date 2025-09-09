'use client'

import { useState, useEffect } from 'react'
// @ts-ignore
import InputMask from 'react-input-mask'
import { ResumeCreate } from '@/types/api'
import { useCreateResume, useResumesByVacancy } from '@/hooks/useResume'
import { Upload, FileText, X, CheckCircle, Clock, Loader, AlertCircle, Mic } from 'lucide-react'

interface ResumeUploadFormProps {
  vacancyId: number
  vacancyTitle: string
  onSuccess?: () => void
}

export default function ResumeUploadForm({ vacancyId, vacancyTitle, onSuccess }: ResumeUploadFormProps) {
  const [formData, setFormData] = useState({
    applicant_name: '',
    applicant_email: '',
    applicant_phone: '',
    cover_letter: '',
  })
  
  const [file, setFile] = useState<File | null>(null)
  const [success, setSuccess] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)
  const [isCheckingMic, setIsCheckingMic] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const createResumeMutation = useCreateResume()
  const { data: existingResumes, isLoading: isLoadingResumes, refetch } = useResumesByVacancy(vacancyId)

  // Проверяем есть ли уже резюме для этой вакансии в текущей сессии
  const hasExistingResume = existingResumes && existingResumes.length > 0

  // Находим непарсенные резюме
  const pendingResumes = existingResumes?.filter(resume => 
    resume.status === 'pending' || resume.status === 'parsing'
  ) || []
  
  const hasPendingResumes = pendingResumes.length > 0

  // Автообновление для непарсенных резюме
  useEffect(() => {
    if (hasPendingResumes) {
      const interval = setInterval(() => {
        refetch()
      }, 3000) // 3 секунды

      return () => clearInterval(interval)
    }
  }, [hasPendingResumes, refetch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateFile = (file: File) => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return false
    }
    
    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    return allowedTypes.includes(file.type)
  }

  const handleFileSelect = (selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Submit data check:', {
      file,
      formData,
      vacancyId
    })
    
    if (!file) {
      console.log('No file selected')
      return
    }

    if (!formData.applicant_name || !formData.applicant_email) {
      console.log('Missing required fields:', {
        applicant_name: formData.applicant_name,
        applicant_email: formData.applicant_email
      })
      return
    }

    const resumeData: ResumeCreate = {
      vacancy_id: vacancyId,
      applicant_name: formData.applicant_name,
      applicant_email: formData.applicant_email,
      applicant_phone: formData.applicant_phone || undefined,
      cover_letter: formData.cover_letter || undefined,
      resume_file: file,
    }

    console.log('Sending resume data:', resumeData)

    createResumeMutation.mutate(resumeData, {
      onSuccess: () => {
        setSuccess(true)
        // Reset form
        setFormData({
          applicant_name: '',
          applicant_email: '',
          applicant_phone: '',
          cover_letter: '',
        })
        setFile(null)
        
        if (onSuccess) {
          onSuccess()
        }
      }
    })
  }

  if (isLoadingResumes) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
          <span className="text-gray-600">Проверяем ваши заявки...</span>
        </div>
      </div>
    )
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Обрабатывается'
      case 'parsing':
        return 'Обрабатывается'
      case 'parse_failed':
        return 'Ошибка обработки'
      case 'parsed':
        return 'Обработано'
      case 'under_review':
        return 'На проверке'
      case 'interview_scheduled':
        return 'Собеседование назначено'
      case 'interviewed':
        return 'Проведено собеседование'
      case 'accepted':
        return 'Принят'
      case 'rejected':
        return 'Отклонено'
      default:
        return status
    }
  }

  // Обработка ошибок парсинга
  const hasParseFailedResumes = existingResumes?.some(resume => resume.status === 'parse_failed') || false

  if (hasParseFailedResumes) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-red-800">
              Ошибка обработки резюме
            </h3>
            <p className="mt-2 text-red-700">
              Не удалось обработать ваше резюме. Попробуйте загрузить файл в другом формате (PDF, DOCX) 
              или обратитесь к нам за помощью.
            </p>
            <div className="mt-4 space-y-2">
              {existingResumes?.map((resume) => (
                <div key={resume.id} className="flex items-center text-sm">
                  <span className="text-red-600">
                    Отправлено: {new Date(resume.created_at).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} • Статус: {getStatusDisplay(resume.status)}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Показываем крутилку для статусов pending/parsing
  if (hasPendingResumes) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <Loader className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
        <div className="flex items-center justify-center mb-4">
          <h3 className="text-2xl font-bold text-blue-800 mr-3">
            Обрабатываем ваше резюме...
          </h3>
        </div>
        <p className="text-blue-700 mb-6 max-w-md mx-auto">
          Пожалуйста, подождите. Мы анализируем ваше резюме и готовим персональные вопросы для собеседования.
        </p>
        <div className="space-y-2">
          {existingResumes?.map((resume) => (
            <div key={resume.id} className="flex items-center justify-center text-sm">
              <span className="text-blue-600">
                Отправлено: {new Date(resume.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                <br />Статус: {getStatusDisplay(resume.status)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Обычное успешное состояние для parsed и других завершенных статусов
  if (success || hasExistingResume) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {hasExistingResume && existingResumes && existingResumes.map((resume) => (
          <div key={resume.id} className="p-6 border-b border-gray-100 last:border-b-0">
            {/* Status and Date Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Резюме
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(resume.created_at).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                resume.status === 'parsed' 
                  ? 'bg-green-100 text-green-800'
                  : resume.status === 'parsing' || resume.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800' 
                  : resume.status === 'parse_failed' || resume.status === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {getStatusDisplay(resume.status)}
              </span>
            </div>

            {/* Content based on status */}
            {resume.status === 'parsed' && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-green-900 mb-2">
                    Мы готовы!
                  </h4>
                  <p className="text-sm text-green-700 mb-4">
                    Ваше резюме успешно обработано. Можете приступать к собеседованию с HR-агентом.
                    <br />
                    <br />
                    * Вы можете пройти собеседование сегодня до 20:00 МСК
                  </p>
                  <div className="space-y-3">
                    {micError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                          <p className="text-sm text-red-700">{micError}</p>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={async () => {
                        setIsCheckingMic(true)
                        setMicError(null)
                        
                        try {
                          await navigator.mediaDevices.getUserMedia({ audio: true })
                          // Если разрешение получено, переходим к интервью
                          window.location.href = `/interview/${resume.id}`
                        } catch (err) {
                          console.error('Microphone permission denied', err)
                          setMicError('Нужно разрешить доступ к микрофону в настройках браузера для проведения интервью')
                        } finally {
                          setIsCheckingMic(false)
                        }
                      }}
                      disabled={isCheckingMic}
                      className="inline-flex items-center px-6 py-3 bg-green-600 border border-transparent rounded-lg font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isCheckingMic ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Проверяем микрофон...
                        </>
                      ) : (
                        <>
                          Начать собеседование
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(resume.status === 'parsing' || resume.status === 'pending') && (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-3"></div>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-900">
                      Обрабатываем ваше резюме
                    </h4>
                    <p className="text-xs text-yellow-700 mt-1">
                      Анализируем опыт и готовим персональные вопросы
                    </p>
                  </div>
                </div>
              </div>
            )}

            {resume.status === 'parse_failed' && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="h-5 w-5 text-red-600 mr-3">⚠️</div>
                  <div>
                    <h4 className="text-sm font-medium text-red-900">
                      Ошибка обработки
                    </h4>
                    <p className="text-xs text-red-700 mt-1">
                      Попробуйте загрузить файл в другом формате
                    </p>
                  </div>
                </div>
              </div>
            )}

            {resume.status === 'rejected' && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-4">
                <div className="text-center">
                  <h4 className="text-sm font-medium text-red-900 mb-1">
                    Резюме не соответствует вакансии
                  </h4>
                  <p className="text-xs text-red-700">
                    К сожалению, ваш опыт не подходит для данной позиции
                  </p>
                </div>
              </div>
            )}

            {!['parsed', 'parsing', 'pending', 'parse_failed', 'rejected'].includes(resume.status) && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="text-center">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    {getStatusDisplay(resume.status)}
                  </h4>
                  <p className="text-xs text-blue-700">
                    Мы свяжемся с вами для следующих шагов
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Откликнуться
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          {vacancyTitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="applicant_name" className="block text-sm font-medium text-gray-700">
              Имя *
            </label>
            <input
              type="text"
              id="applicant_name"
              name="applicant_name"
              required
              className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-primary-500 sm:text-sm"
              value={formData.applicant_name}
              onChange={handleInputChange}
              placeholder="Ваше полное имя"
            />
          </div>

          <div>
            <label htmlFor="applicant_email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              id="applicant_email"
              name="applicant_email"
              required
              className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-primary-500 sm:text-sm"
              value={formData.applicant_email}
              onChange={handleInputChange}
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="applicant_phone" className="block text-sm font-medium text-gray-700">
            Телефон
          </label>
          <InputMask
            mask="+7 (999) 999-99-99"
            maskChar="_"
            value={formData.applicant_phone}
            onChange={handleInputChange}
          >
            {() => (
              <input
                type="tel"
                id="applicant_phone"
                name="applicant_phone"
                className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-primary-500 sm:text-sm"
                placeholder="+7 (999) 999-99-99"
              />
            )}
          </InputMask>
        </div>

        {/* Cover Letter */}
        <div>
          <label htmlFor="cover_letter" className="block text-sm font-medium text-gray-700">
            Сопроводительное письмо
          </label>
          <textarea
            id="cover_letter"
            name="cover_letter"
            rows={4}
            className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-primary-500 sm:text-sm"
            value={formData.cover_letter}
            onChange={handleInputChange}
            placeholder="Расскажите о себе и почему вас интересует эта позиция..."
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Резюме *
          </label>
          
          {!file ? (
            <div 
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
                dragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="resume_file"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Загрузить резюме</span>
                    <input
                      id="resume_file"
                      name="resume_file"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">или перетащите сюда</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, DOCX до 10 МБ
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-between p-3 border border-gray-300 rounded-md">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-900">{file.name}</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({(file.size / 1024 / 1024).toFixed(2)} МБ)
                </span>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {createResumeMutation.error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
            Произошла ошибка при отправке резюме
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={createResumeMutation.isPending}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createResumeMutation.isPending ? 'Отправляем...' : 'Отправить резюме'}
          </button>
        </div>
      </form>
    </div>
  )
}