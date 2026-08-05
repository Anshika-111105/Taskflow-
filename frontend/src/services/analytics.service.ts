import api from './api'
import type { Analytics } from '../types'

export const analyticsService = {
  getAnalytics: (date?: string) => api.get<Analytics>('/analytics', { params: date ? { date } : {} }),
}
