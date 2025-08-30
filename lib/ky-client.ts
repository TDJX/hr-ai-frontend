import ky from 'ky'

// Используем прокси Next.js для избежания CORS проблем
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

// Базовый клиент без Content-Type заголовка
const baseKyClient = ky.create({
  prefixUrl: API_BASE_URL,
  credentials: 'include',
  hooks: {
    beforeError: [
      (error) => {
        const { response } = error
        if (response && response.body) {
          error.name = 'APIError'
          error.message = `${response.status} ${response.statusText}`
        }
        return error
      },
    ],
  },
})

// JSON клиент
export const kyClient = baseKyClient.extend({
  headers: {
    'Content-Type': 'application/json',
  },
})

// FormData клиент (без Content-Type заголовка)
export const kyFormClient = baseKyClient

export default kyClient