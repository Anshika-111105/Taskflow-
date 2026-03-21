import { useForm } from 'react-hook-form'
import { useTasks } from '../../hooks/useTasks'
import { Spinner } from '../ui/Spinner'
import type { Priority, Task } from '../../types'

interface Props {
  task?: Task
  onDone: () => void
}

interface FormData {
  title: string
  description: string
  priority: string
  due_date: string
}

export function TaskForm({ task, onDone }: Props) {
  const { create, update } = useTasks()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      priority: task?.priority ?? 'Medium',
      due_date: task?.due_date ? task.due_date.slice(0, 16) : '',
    },
  })

  const onSubmit = async (d: FormData) => {
    const payload = {
      title: d.title,
      description: d.description || undefined,
      priority: d.priority as Priority,
      due_date: d.due_date ? new Date(d.due_date).toISOString() : undefined,
    }
    if (task) {
      await update(task.id, payload)
    } else {
      await create(payload)
    }
    onDone()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-slate-400 mb-1.5 block">Title *</label>
        <input
          className="input"
          placeholder="Task title..."
          {...register('title', { required: 'Title is required' })}
        />
        {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label className="text-xs font-medium text-slate-400 mb-1.5 block">Description</label>
        <textarea
          className="input resize-none h-24"
          placeholder="Optional description..."
          {...register('description')}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Priority</label>
          <select className="input" {...register('priority')}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Due Date</label>
          <input type="datetime-local" className="input" {...register('due_date')} />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1 justify-center" disabled={isSubmitting}>
          {isSubmitting && <Spinner size="sm" />}
          {task ? 'Update Task' : 'Create Task'}
        </button>
        <button type="button" onClick={onDone} className="btn-ghost flex-1 justify-center">
          Cancel
        </button>
      </div>
    </form>
  )
}
