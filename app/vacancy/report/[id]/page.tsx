'use client'

import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
} from 'lucide-react'
import VacancyReports from "@/components/VacancyReports";
import { useInterviewReports } from "@/hooks/useReports";
import React from "react";

export default function VacancyPage() {
  const params = useParams()
  const router = useRouter()
  const vacancyId = parseInt(params.id as string)

  const { data: reports, isLoading, error } = useInterviewReports(vacancyId)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !reports) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <p>Не удалось загрузить информацию об отчетах</p>
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
      <div className="flex items-center justify-between">
        <button
          onClick={ () => router.back() }
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2"/>
          Назад к вакансии
        </button>
      </div>

      <VacancyReports reports={ reports ? reports : [] }/>
    </div>
  )
}
