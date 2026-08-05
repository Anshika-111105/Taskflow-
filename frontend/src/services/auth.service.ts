import api from './api'
import type { AuthTokens } from '../types'

export const authService = {
  register: (name: string, email: string, password: string) =>
    api.post<AuthTokens>('/auth/register', { name, email, password }),

  login: (email: string, password: string) =>
    api.post<AuthTokens>('/auth/login', { email, password }),

  refresh: (refresh_token: string) =>
    api.post<AuthTokens>('/auth/refresh', { refresh_token }),

  forgotPassword: (email: string) =>
    api.post<{ message: string; debug_token?: string }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, new_password: string) =>
    api.post<{ message: string }>('/auth/reset-password', { token, new_password }),
}
