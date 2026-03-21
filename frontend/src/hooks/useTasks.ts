import { useCallback } from 'react'
import { useTaskStore } from '../store/task.store'
import { taskService } from '../services/task.service'
import type { Task } from '../types'

export function useTasks() {
  const { filters, setTasks, setLoading, addTask, updateTask, removeTask } = useTaskStore()

  const fetchTasks = useCallback(async (overrides = {}) => {
    setLoading(true)
    try {
      const { data } = await taskService.getTasks({ ...filters, ...overrides })
      setTasks(data.tasks, data.total)
    } finally {
      setLoading(false)
    }
  }, [filters, setLoading, setTasks])

  const create = async (payload: Parameters<typeof taskService.createTask>[0]) => {
    const { data } = await taskService.createTask(payload)
    addTask(data)
    return data
  }

  const update = async (id: number, payload: Partial<Task>) => {
    const { data } = await taskService.updateTask(id, payload)
    updateTask(data)
    return data
  }

  const remove = async (id: number) => {
    await taskService.deleteTask(id)
    removeTask(id)
  }

  const markComplete = (id: number) => update(id, { status: 'Completed' })
  const archive = (id: number) => update(id, { status: 'Archived' })

  return { fetchTasks, create, update, remove, markComplete, archive }
}
