'use client'

import { useState } from 'react'
import { VacancyRead } from '@/types/api'
import { useVacancies } from '@/hooks/useVacancy'
import Link from 'next/link'
import { Search, MapPin, Clock, Banknote, Plus } from 'lucide-react'
import VacancyUploadForm from '@/components/VacancyUploadForm'

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchParams, setSearchParams] = useState({
    active_only: true,
    title: undefined as string | undefined,
  })

  const { data: vacancies = [], isLoading, error, refetch } = useVacancies(searchParams)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams({
      active_only: true,
      title: searchTerm || undefined,
    })
  }

  const formatSalary = (vacancy: VacancyRead) => {
    if (!vacancy.salary_from && !vacancy.salary_to) return 'Зарплата не указана'
    
    const currency = vacancy.salary_currency === 'RUR' ? '₽' : vacancy.salary_currency
    
    if (vacancy.salary_from && vacancy.salary_to) {
      return `${vacancy.salary_from.toLocaleString()} - ${vacancy.salary_to.toLocaleString()} ${currency}`
    }
    
    if (vacancy.salary_from) {
      return `от ${vacancy.salary_from.toLocaleString()} ${currency}`
    }
    
    if (vacancy.salary_to) {
      return `до ${vacancy.salary_to.toLocaleString()} ${currency}`
    }
  }

  const getExperienceText = (experience: string) => {
    const mapping = {
      noExperience: 'Без опыта',
      between1And3: '1-3 года',
      between3And6: '3-6 лет',
      moreThan6: 'Более 6 лет'
    }
    return mapping[experience as keyof typeof mapping] || experience
  }

  const getEmploymentText = (employment: string) => {
    const mapping = {
      full: 'Полная занятость',
      part: 'Частичная занятость',
      project: 'Проектная работа',
      volunteer: 'Волонтерство',
      probation: 'Стажировка'
    }
    return mapping[employment as keyof typeof mapping] || employment
  }

  const formatNullableField = (value: string | null | undefined) => {
    if (!value || value === 'null') return 'Не указано'
    return value
  }

  const VacancyPlaceholder = () => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-24"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
        </div>
      </div>
    </div>
  )

  const getVacanciesWithPlaceholders = (vacancies: VacancyRead[]) => {
    const itemsPerRow = 3
    const remainder = vacancies.length % itemsPerRow
    const placeholdersNeeded = remainder === 0 ? 0 : itemsPerRow - remainder
    
    const placeholders = Array(placeholdersNeeded).fill(null).map((_, index) => ({
      id: `placeholder-${index}`,
      isPlaceholder: true
    }))
    
    return [...vacancies, ...placeholders]
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Найдите работу мечты
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Выберите понравившуюся вам вакансию, заполните форму и прикрепите резюме.<br/>
          После недолговременной обработки вашего документа мы предоставим вам возможность подключится к сессии для собеседования, если ваше резюме удовлетворит вакансию.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Поиск по названию вакансии..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Найти
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-600">Не удалось загрузить вакансии</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Попробовать снова
          </button>
        </div>
      )}

      {/* Vacancies Grid */}
      {!error && vacancies.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {getVacanciesWithPlaceholders(vacancies).map((item, index) => {
            if ('isPlaceholder' in item) {
              return <VacancyPlaceholder key={item.id} />
            }
            
            const vacancy = item as VacancyRead
            return (
              <Link
                key={vacancy.id}
                href={`/vacancy/${vacancy.id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {vacancy.title}
                    </h3>
                    {vacancy.premium && (
                      <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                        Premium
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Banknote className="h-4 w-4 mr-2" />
                      <span>{formatSalary(vacancy)}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{formatNullableField(vacancy.area_name)}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{getExperienceText(vacancy.experience)}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 mb-4">
                    <p className="font-medium">{formatNullableField(vacancy.company_name)}</p>
                    <p className="line-clamp-2 mt-1">{formatNullableField(vacancy.description)}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                      {getEmploymentText(vacancy.employment_type)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(vacancy.published_at || vacancy.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!error && !isLoading && vacancies.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Вакансии не найдены
          </h3>
          <p className="text-gray-600">
            Попробуйте изменить параметры поиска или вернитесь позже
          </p>
        </div>
      )}

      {/* Create Vacancy Button */}
      {!showCreateForm && (
        <div className="flex justify-center pt-8">
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            Создать вакансию
          </button>
        </div>
      )}

      {/* Create Vacancy Form */}
      {showCreateForm && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Свернуть
            </button>
          </div>
          <VacancyUploadForm />
        </div>
      )}
    </div>
  )
}