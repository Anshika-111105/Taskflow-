import api from './api'
import type { Analytics } from '../types'

export const analyticsService = {
  getAnalytics: () => api.get<Analytics>('/analytics'),
}
