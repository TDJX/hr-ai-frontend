'use client'

import { useParams, useRouter } from 'next/navigation'
import { useVacancy } from '@/hooks/useVacancy'
import { VacancyRead } from '@/types/api'
import {
  ArrowLeft,
  MapPin,
  Clock,
  Banknote,
  Building,
  Users,
  Calendar,
  Phone,
  Mail,
  Globe, FileText
} from 'lucide-react'
import ResumeUploadForm from '@/components/ResumeUploadForm'

export default function VacancyPage() {
  const params = useParams()
  const router = useRouter()
  const vacancyId = parseInt(params.id as string)

  const { data: vacancy, isLoading, error } = useVacancy(vacancyId)

  const formatSalary = (vacancy: VacancyRead) => {
    if (!vacancy.salary_from && !vacancy.salary_to) return 'Зарплата не указана'

    const currency = vacancy.salary_currency === 'RUR' ? '₽' : vacancy.salary_currency

    if (vacancy.salary_from && vacancy.salary_to) {
      return `${ vacancy.salary_from.toLocaleString() } - ${ vacancy.salary_to.toLocaleString() } ${ currency }`
    }

    if (vacancy.salary_from) {
      return `от ${ vacancy.salary_from.toLocaleString() } ${ currency }`
    }

    if (vacancy.salary_to) {
      return `до ${ vacancy.salary_to.toLocaleString() } ${ currency }`
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

  const getScheduleText = (schedule: string) => {
    const mapping = {
      fullDay: 'Полный день',
      shift: 'Сменный график',
      flexible: 'Гибкий график',
      remote: 'Удаленная работа',
      flyInFlyOut: 'Вахтовый метод'
    }
    return mapping[schedule as keyof typeof mapping] || schedule
  }

  const formatNullableField = (value: string | null | undefined) => {
    if (!value || value === 'null') return 'Не указано'
    return value
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !vacancy) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <p>Не удалось загрузить информацию о вакансии</p>
        </div>
        <button
          onClick={ () => router.back() }
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2"/>
          Назад
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */ }
      <div className="flex items-center justify-between">
        <button
          onClick={ () => router.back() }
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2"/>
          Назад к вакансиям
        </button>

        { vacancy.premium && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
            Premium
          </span>
        ) }
      </div>

      {/* Main Content */ }
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Vacancy Details */ }
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Company */ }
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              { vacancy.title }
            </h1>

            <div className="flex items-center mb-6">
              <Building className="h-5 w-5 text-gray-400 mr-2"/>
              <span className="text-lg font-medium text-gray-900">
                {formatNullableField(vacancy.company_name)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <Banknote className="h-4 w-4 mr-2"/>
                <span>{ formatSalary(vacancy) }</span>
              </div>

              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{formatNullableField(vacancy.area_name)}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2"/>
                <span>{ getExperienceText(vacancy.experience) }</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2"/>
                <span>{ getEmploymentText(vacancy.employment_type) }</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2"/>
                <span>{ formatNullableField(getScheduleText(vacancy.schedule)) }</span>
              </div>

              { vacancy.published_at && (
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2"/>
                  <span>Опубликовано { new Date(vacancy.published_at).toLocaleDateString('ru-RU') }</span>
                </div>
              ) }
            </div>
          </div>

          {/* Description */ }
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Описание вакансии
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                { formatNullableField(vacancy.description) }
              </p>
            </div>
          </div>

          {/* Key Skills */ }
          { vacancy.key_skills && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Ключевые навыки
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700">{ formatNullableField(vacancy.key_skills) }</p>
              </div>
            </div>
          ) }

          {/* Company Description */ }
          { vacancy.company_description && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                О компании
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                  { formatNullableField(vacancy.company_description) }
                </p>
              </div>
            </div>
          ) }

          {/* Location Details */ }
          { ( vacancy.address || vacancy.metro_stations ) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Местоположение
              </h2>
              <div className="space-y-2 text-gray-700">
                { vacancy.address && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0"/>
                    <span>{ formatNullableField(vacancy.address) }</span>
                  </div>
                ) }
                { vacancy.metro_stations && (
                  <div className="flex items-start">
                    <span className="text-sm font-medium mr-2">Метро:</span>
                    <span className="text-sm">{ formatNullableField(vacancy.metro_stations) }</span>
                  </div>
                ) }
              </div>
            </div>
          ) }
        </div>

        {/* Right Column - Application Form and Contact Info */ }
        <div className="space-y-6">
          {/* Contact Information */ }
          { ( vacancy.contacts_name || vacancy.contacts_email || vacancy.contacts_phone || vacancy.url ) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Контактная информация
              </h3>
              <div className="space-y-3 text-sm">
                { vacancy.contacts_name && (
                  <div className="flex items-center text-gray-700">
                    <Users className="h-4 w-4 mr-2"/>
                    <span>{ formatNullableField(vacancy.contacts_name) }</span>
                  </div>
                ) }
                { vacancy.contacts_email && (
                  <div className="flex items-center text-gray-700">
                    <Mail className="h-4 w-4 mr-2"/>
                    <a
                      href={ `mailto:${ vacancy.contacts_email }` }
                      className="hover:text-primary-600"
                    >
                      { formatNullableField(vacancy.contacts_email) }
                    </a>
                  </div>
                ) }
                { vacancy.contacts_phone && (
                  <div className="flex items-center text-gray-700">
                    <Phone className="h-4 w-4 mr-2"/>
                    <a
                      href={ `tel:${ vacancy.contacts_phone }` }
                      className="hover:text-primary-600"
                    >
                      { formatNullableField(vacancy.contacts_phone) }
                    </a>
                  </div>
                ) }
                { vacancy.url && (
                  <div className="flex items-center text-gray-700">
                    <Globe className="h-4 w-4 mr-2"/>
                    <a
                      href={ vacancy.url }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary-600"
                    >
                      Перейти к вакансии
                    </a>
                  </div>
                ) }
              </div>
            </div>
          ) }
          <div>
            <a
              href={`/vacancy/report/${vacancyId}`}
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow hover:bg-indigo-700 transition"
            >
              Открыть отчеты
            </a>
          </div>

          {/* Application Form */ }
          <ResumeUploadForm
            vacancyId={ vacancy.id }
            vacancyTitle={ vacancy.title }
          />
        </div>
      </div>
    </div>
  )
}
