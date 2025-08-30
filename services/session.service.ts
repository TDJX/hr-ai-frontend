import { kyClient } from '@/lib/ky-client'
import { SessionRead } from '@/types/api'

export const sessionService = {
  async getCurrentSession(): Promise<SessionRead> {
    return kyClient.get('api/v1/sessions/current').json<SessionRead>()
  },

  async refreshSession(): Promise<void> {
    return kyClient.post('api/v1/sessions/refresh').json<void>()
  },

  async logout(): Promise<void> {
    return kyClient.post('api/v1/sessions/logout').json<void>()
  },

  async healthCheck(): Promise<void> {
    return kyClient.get('api/v1/sessions/health').json<void>()
  },
}