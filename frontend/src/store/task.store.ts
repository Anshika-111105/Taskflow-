import { create } from 'zustand'
import type { Task, TaskFilters } from '../types'

interface TaskState {
  tasks: Task[]
  total: number
  filters: TaskFilters
  loading: boolean
  setTasks: (tasks: Task[], total: number) => void
  setFilters: (f: Partial<TaskFilters>) => void
  setLoading: (v: boolean) => void
  addTask: (t: Task) => void
  updateTask: (t: Task) => void
  removeTask: (id: number) => void
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  total: 0,
  filters: { page: 1, page_size: 20 },
  loading: false,
  setTasks: (tasks, total) => set({ tasks, total }),
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  setLoading: (loading) => set({ loading }),
  addTask: (t) => set((s) => ({ tasks: [t, ...s.tasks], total: s.total + 1 })),
  updateTask: (t) => set((s) => ({ tasks: s.tasks.map((x) => (x.id === t.id ? t : x)) })),
  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((x) => x.id !== id), total: s.total - 1 })),
}))
