import { useEffect, useState } from 'react'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import { useTaskStore } from '../store/task.store'
import { useTasks } from '../hooks/useTasks'
import { TaskCard } from '../components/tasks/TaskCard'
import { TaskForm } from '../components/tasks/TaskForm'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'
import type { Priority, Status } from '../types'

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High']
const STATUSES: Status[] = ['Pending', 'Completed', 'Archived']

export default function TasksPage() {
  const { tasks, total, filters, loading, setFilters } = useTaskStore()
  const { fetchTasks } = useTasks()
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchTasks() }, [filters])

  const filtered = tasks.filter((t) =>
    search ? t.title.toLowerCase().includes(search.toLowerCase()) : true
  )
  const totalPages = Math.ceil(total / (filters.page_size ?? 20))

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Tasks</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} task{total !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary">
          <Plus size={16} /> New Task
        </button>
      </div>
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search size={14} className="text-slate-500" />
          <input
            className="bg-transparent text-sm text-slate-300 placeholder:text-slate-500 outline-none flex-1"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-slate-500" />
          <select
            className="bg-slate-800 text-sm text-slate-300 rounded-lg px-3 py-1.5 border border-slate-700/50 outline-none"
            value={filters.priority ?? ''}
            onChange={(e) => setFilters({ priority: (e.target.value as Priority) || undefined, page: 1 })}
          >
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select
            className="bg-slate-800 text-sm text-slate-300 rounded-lg px-3 py-1.5 border border-slate-700/50 outline-none"
            value={filters.status ?? ''}
            onChange={(e) => setFilters({ status: (e.target.value as Status) || undefined, page: 1 })}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {(filters.priority || filters.status) && (
            <button className="text-xs text-rose-400 hover:text-rose-300" onClick={() => setFilters({ priority: undefined, status: undefined, page: 1 })}>Clear</button>
          )}
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500">No tasks found.</p>
          <button onClick={() => setCreateOpen(true)} className="btn-primary mt-3 mx-auto">
            <Plus size={14} /> Create first task
          </button>
        </div>
      ) : (
        <div className="space-y-2">{filtered.map((t) => <TaskCard key={t.id} task={t} />)}</div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button className="btn-ghost text-sm" disabled={filters.page === 1} onClick={() => setFilters({ page: (filters.page ?? 1) - 1 })}>Prev</button>
          <span className="text-sm text-slate-500">Page {filters.page} of {totalPages}</span>
          <button className="btn-ghost text-sm" disabled={filters.page === totalPages} onClick={() => setFilters({ page: (filters.page ?? 1) + 1 })}>Next</button>
        </div>
      )}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Task">
        <TaskForm onDone={() => { setCreateOpen(false); fetchTasks() }} />
      </Modal>
    </div>
  )
}
