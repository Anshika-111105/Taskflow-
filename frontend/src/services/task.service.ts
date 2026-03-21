import api from './api'
import type { Task, TasksResponse, TaskHistory, TaskFilters } from '../types'

export const taskService = {
  getTasks: (filters: TaskFilters = {}) =>
    api.get<TasksResponse>('/tasks', { params: filters }),

  getTask: (id: number) =>
    api.get<Task>(`/tasks/${id}`),

  createTask: (data: { title: string; description?: string; priority?: string; due_date?: string }) =>
    api.post<Task>('/tasks', data),

  updateTask: (id: number, data: Partial<Task>) =>
    api.put<Task>(`/tasks/${id}`, data),

  deleteTask: (id: number) =>
    api.delete(`/tasks/${id}`),

  getHistory: (id: number) =>
    api.get<TaskHistory[]>(`/tasks/${id}/history`),
}
