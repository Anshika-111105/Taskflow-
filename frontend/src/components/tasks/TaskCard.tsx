import { useState } from 'react'
import { CheckCircle2, Archive, Pencil, Trash2, Clock, History } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Task, TaskHistory } from '../../types'
import { PriorityBadge, StatusBadge } from '../ui/Badge'
import { useTasks } from '../../hooks/useTasks'
import { Modal } from '../ui/Modal'
import { TaskForm } from './TaskForm'
import { taskService } from '../../services/task.service'

interface Props { task: Task }

export function TaskCard({ task }: Props) {
  const { markComplete, archive, remove } = useTasks()
  const [editOpen, setEditOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState<TaskHistory[]>([])

  const loadHistory = async () => {
    const { data } = await taskService.getHistory(task.id)
    setHistory(data)
    setHistoryOpen(true)
  }

  return (
    <>
      <div className="card p-4 hover:border-slate-700/80 transition-all duration-200 group">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm ${task.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
              {task.due_date && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock size={11} />
                  {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {task.status === 'Pending' && (
              <button onClick={() => markComplete(task.id)} className="btn-ghost p-1.5 text-emerald-400 hover:bg-emerald-500/10" title="Complete">
                <CheckCircle2 size={14} />
              </button>
            )}
            {task.status !== 'Archived' && (
              <button onClick={() => archive(task.id)} className="btn-ghost p-1.5 text-purple-400 hover:bg-purple-500/10" title="Archive">
                <Archive size={14} />
              </button>
            )}
            <button onClick={() => setEditOpen(true)} className="btn-ghost p-1.5" title="Edit">
              <Pencil size={14} />
            </button>
            <button onClick={loadHistory} className="btn-ghost p-1.5" title="History">
              <History size={14} />
            </button>
            <button onClick={() => remove(task.id)} className="btn-ghost p-1.5 text-rose-400 hover:bg-rose-500/10" title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Task">
        <TaskForm task={task} onDone={() => setEditOpen(false)} />
      </Modal>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Task History">
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {history.length === 0 && <p className="text-slate-500 text-sm">No history yet.</p>}
          {history.map((h) => (
            <div key={h.id} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                h.action_type === 'created' ? 'bg-emerald-500/15 text-emerald-400' :
                h.action_type === 'completed' ? 'bg-brand-500/15 text-brand-400' :
                h.action_type === 'deleted' ? 'bg-rose-500/15 text-rose-400' :
                'bg-amber-500/15 text-amber-400'
              }`}>{h.action_type}</span>
              <span className="text-xs text-slate-500">
                {formatDistanceToNow(new Date(h.timestamp), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}