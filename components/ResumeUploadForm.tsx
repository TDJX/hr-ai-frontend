'use client'

import { useState } from 'react'
import InputMask from 'react-input-mask'
import { ResumeCreate } from '@/types/api'
import { useCreateResume, useResumesByVacancy } from '@/hooks/useResume'
import { Upload, FileText, X, CheckCircle, Clock } from 'lucide-react'

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

  const createResumeMutation = useCreateResume()
  const { data: existingResumes, isLoading: isLoadingResumes } = useResumesByVacancy(vacancyId)

  // Проверяем есть ли уже резюме для этой вакансии в текущей сессии
  const hasExistingResume = existingResumes && existingResumes.length > 0

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        return
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ]
      
      if (!allowedTypes.includes(selectedFile.type)) {
        return
      }
      
      setFile(selectedFile)
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

  if (success || hasExistingResume) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center">
          <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-green-800">
              {success ? 'Резюме успешно отправлено!' : 'Ваше резюме уже отправлено!'}
            </h3>
            <p className="mt-2 text-green-700">
              Готовим для вас сессию для собеседования. Мы свяжемся с вами в ближайшее время.
            </p>
            {hasExistingResume && existingResumes && (
              <div className="mt-4 space-y-2">
                {existingResumes.map((resume) => (
                  <div key={resume.id} className="flex items-center text-sm text-green-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      Отправлено: {new Date(resume.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} • Статус: {resume.status === 'pending' ? 'На рассмотрении' : 
                        resume.status === 'under_review' ? 'На проверке' :
                        resume.status === 'interview_scheduled' ? 'Собеседование назначено' :
                        resume.status === 'interviewed' ? 'Проведено собеседование' :
                        resume.status === 'accepted' ? 'Принят' :
                        resume.status === 'rejected' ? 'Отклонен' : resume.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Откликнуться на вакансию
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
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary-400 transition-colors">
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
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">или перетащите сюда</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX, TXT до 10 МБ
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