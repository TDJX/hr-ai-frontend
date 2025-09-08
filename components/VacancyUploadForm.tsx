'use client'

import { useState } from 'react'
import { useParseVacancyFile } from '@/hooks/useVacancy'
import { Upload, X, FileText } from 'lucide-react'

export default function VacancyUploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const parseVacancyFile = useParseVacancyFile()

  const handleFileSelect = (file: File) => {
    // Проверка типа файла
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/rtf',
      'text/plain'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      alert('Поддерживаются только файлы: PDF, DOC, DOCX, RTF, TXT')
      return
    }

    // Проверка размера файла (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Размер файла не должен превышать 10 МБ')
      return
    }

    setSelectedFile(file)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      alert('Пожалуйста, выберите файл')
      return
    }

    try {
      await parseVacancyFile.mutateAsync({
        file: selectedFile,
        createVacancy: true
      })
      
      // Очистить форму после успешной отправки
      setSelectedFile(null)
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error)
      alert('Произошла ошибка при загрузке файла')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
          Создать вакансию из файла
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary-500 bg-primary-50'
                : selectedFile
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <FileText className="h-12 w-12 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} МБ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Удалить
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <Upload className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Перетащите файл сюда или{' '}
                    <label className="text-primary-600 hover:text-primary-500 cursor-pointer underline">
                      выберите файл
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.rtf,.txt"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    PDF, DOC, DOCX, RTF, TXT до 10 МБ
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={!selectedFile || parseVacancyFile.isPending}
              className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                selectedFile && !parseVacancyFile.isPending
                  ? 'bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {parseVacancyFile.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Обработка...
                </div>
              ) : (
                'Создать вакансию'
              )}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          После загрузки файл будет обработан и вакансия появится в списке
        </p>
      </div>
    </div>
  )
}