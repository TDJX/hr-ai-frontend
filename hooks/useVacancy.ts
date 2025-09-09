import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vacancyService } from '@/services/vacancy.service'
import { GetVacanciesParams } from '@/types/api'
import { useEffect, useRef } from 'react'

export const useVacancies = (params?: GetVacanciesParams) => {
  return useQuery({
    queryKey: ['vacancies', params],
    queryFn: () => vacancyService.getVacancies(params),
    staleTime: 0, // Данные сразу считаются устаревшими
    refetchInterval: 5000, // Обновлять каждые 5 секунд
    retry: 2,
  })
}

export const useVacancy = (id: number) => {
  return useQuery({
    queryKey: ['vacancy', id],
    queryFn: () => vacancyService.getVacancy(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

export const useParseVacancyFile = () => {
  const mutation = useMutation({
    mutationFn: ({ file, createVacancy }: { file: File; createVacancy?: boolean }) =>
      vacancyService.parseFileAsync(file, createVacancy),
    onSuccess: (data) => {
      // Показать toast уведомление
      showToast('Задача парсинга запущена! Скоро вакансия появится в списке.')
    },
  })

  return mutation
}

// Простая функция для показа toast без React компонента
const showToast = (message: string) => {
  // Создать элемент toast
  const toast = document.createElement('div')
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    bottom: 40px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    z-index: 9999;
    max-width: 300px;
    word-wrap: break-word;
    transition: opacity 0.3s ease, transform 0.3s ease;
    transform: translateX(100%);
  `
  
  // Добавить в DOM
  document.body.appendChild(toast)
  
  // Анимация появления
  setTimeout(() => {
    toast.style.transform = 'translateX(0)'
  }, 10)
  
  // Удалить через 5 секунд
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(100%)'
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, 10000)
}