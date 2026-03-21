import api from './api'
import type { AuthTokens } from '../types'

export const authService = {
  register: (name: string, email: string, password: string) =>
    api.post<AuthTokens>('/auth/register', { name, email, password }),

  login: (email: string, password: string) =>
    api.post<AuthTokens>('/auth/login', { email, password }),

  refresh: (refresh_token: string) =>
    api.post<AuthTokens>('/auth/refresh', { refresh_token }),
}
