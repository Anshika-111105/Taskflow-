import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, Plus, Trash2, CheckCircle2, Award, CheckSquare, ListTodo, Sparkles } from 'lucide-react'
import { format, addDays, subDays } from 'date-fns'
import { analyticsService } from '../services/analytics.service'
import { taskService } from '../services/task.service'
import type { DailyAnalytics, DailyTask, Priority } from '../types'
import { Modal } from '../components/ui/Modal'
import { TaskForm } from '../components/tasks/TaskForm'
import { Spinner } from '../components/ui/Spinner'
import { PriorityBadge } from '../components/ui/Badge'

export default function DailyPlannerPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [dailyData, setDailyData] = useState<DailyAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)

  const dateStr = format(currentDate, 'yyyy-MM-dd')

  const fetchDailyData = async () => {
    setLoading(true)
    try {
      const { data } = await analyticsService.getAnalytics(dateStr)
      if (data.daily) {
        setDailyData(data.daily)
      } else {
        // Fallback to empty daily analytics if key doesn't exist yet
        setDailyData({
          date: dateStr,
          total_tasks: 0,
          completed_tasks: 0,
          pending_tasks: 0,
          total_hours_planned: 0.0,
          total_hours_completed: 0.0,
          productivity_score: 0.0,
          tasks: []
        })
      }
    } catch (e) {
      console.error('Failed to load daily analytics', e)
      // Fallback on failure
      setDailyData({
        date: dateStr,
        total_tasks: 0,
        completed_tasks: 0,
        pending_tasks: 0,
        total_hours_planned: 0.0,
        total_hours_completed: 0.0,
        productivity_score: 0.0,
        tasks: []
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDailyData()
  }, [dateStr])

  const handlePrevDay = () => setCurrentDate((prev) => subDays(prev, 1))
  const handleNextDay = () => setCurrentDate((prev) => addDays(prev, 1))
  const handleToday = () => setCurrentDate(new Date())

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setCurrentDate(new Date(e.target.value))
    }
  }

  const handleMarkComplete = async (taskId: number) => {
    try {
      await taskService.updateTask(taskId, { status: 'Completed' })
      fetchDailyData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (taskId: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId)
        fetchDailyData()
      } catch (e) {
        console.error(e)
      }
    }
  }

  const formatDueTime = (dueStr?: string) => {
    if (!dueStr) return 'No deadline set'
    try {
      const d = new Date(dueStr)
      return format(d, 'h:mm a')
    } catch (e) {
      return 'No deadline set'
    }
  }

  const activeDaily: DailyAnalytics = dailyData || {
    date: dateStr,
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    total_hours_planned: 0.0,
    total_hours_completed: 0.0,
    productivity_score: 0.0,
    tasks: []
  }

  const scoreColor = activeDaily.productivity_score >= 70 ? 'text-emerald-400' :
    activeDaily.productivity_score >= 40 ? 'text-amber-400' : 'text-rose-400'

  const scoreBgColor = activeDaily.productivity_score >= 70 ? 'bg-emerald-500/10 border-emerald-500/20' :
    activeDaily.productivity_score >= 40 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20'

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header and Date Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Daily Task Planner</h1>
          <p className="text-slate-500 text-sm mt-0.5">Plan tasks, hours, and track daily productivity</p>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <button onClick={handlePrevDay} className="btn-ghost p-2" title="Previous Day">
            <ChevronLeft size={16} />
          </button>
          
          <button onClick={handleToday} className="btn-ghost px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">
            Today
          </button>

          <div className="relative flex items-center bg-slate-800 border border-slate-700/60 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-200">
            <Calendar size={14} className="text-slate-500 mr-2" />
            <span>{format(currentDate, 'eee, MMM d, yyyy')}</span>
            <input
              type="date"
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
              value={dateStr}
              onChange={handleDateChange}
            />
          </div>

          <button onClick={handleNextDay} className="btn-ghost p-2" title="Next Day">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Tasks list */}
          <div className="lg:col-span-2 space-y-4">
            {/* Planning Mode suggestion card */}
            <div className="card p-4 bg-brand-500/10 border border-brand-500/20 flex gap-3 items-start">
              <Sparkles className="text-brand-400 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <h4 className="text-xs font-semibold text-brand-400">Night Prep & Planning</h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Plan your day the night before! Navigate to tomorrow's date using the selector on the right, create your plan, set time limits, and log estimated hours of investment.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <ListTodo size={18} className="text-brand-400" />
                Scheduled Tasks ({activeDaily.total_tasks})
              </h2>
              <button onClick={() => setCreateOpen(true)} className="btn-primary py-1.5 text-xs">
                <Plus size={14} /> Add Plan / Task
              </button>
            </div>

            {activeDaily.tasks.length === 0 ? (
              <div className="card p-12 text-center border-dashed border-slate-800/80">
                <CheckSquare size={36} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No tasks planned for this day.</p>
                <button onClick={() => setCreateOpen(true)} className="btn-primary mt-4 mx-auto py-1.5 text-xs">
                  <Plus size={14} /> Add First Plan
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {activeDaily.tasks.map((t: DailyTask) => (
                  <div key={t.id} className="card p-4 hover:border-slate-700/80 transition-all group">
                    <div className="flex items-start gap-3">
                      {/* Custom checkbox */}
                      <button
                        onClick={() => t.status === 'Pending' && handleMarkComplete(t.id)}
                        disabled={t.status === 'Completed'}
                        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          t.status === 'Completed'
                            ? 'bg-emerald-500 border-emerald-500 text-slate-900 cursor-not-allowed'
                            : 'border-slate-600 hover:border-brand-500 hover:bg-brand-500/10 text-transparent'
                        }`}
                      >
                        <CheckCircle2 size={12} className={t.status === 'Completed' ? 'text-white' : ''} />
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${t.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                          {t.title}
                        </p>
                        {t.description && (
                          <p className="text-xs text-slate-400 mt-1">{t.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          <PriorityBadge priority={t.priority} />
                          
                          {t.duration_hours !== undefined && t.duration_hours > 0 && (
                            <span className="flex items-center gap-1.5 text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full font-medium" title="Estimated time to invest">
                              <Clock size={11} />
                              {t.duration_hours} hr{t.duration_hours !== 1 ? 's' : ''} to invest
                            </span>
                          )}

                          {t.due_date && (
                            <span className="text-[11px] text-slate-500">
                              Deadline: <span className="text-slate-400 font-medium">{formatDueTime(t.due_date)}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-slate-600 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Daily Productivity Metrics */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Award size={18} className="text-brand-400" />
              Daily Metrics
            </h2>

            {/* Productivity Score card */}
            <div className={`card p-5 border text-center ${scoreBgColor}`}>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Productivity Score</p>
              <div className="relative w-28 h-28 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className={scoreColor}
                    strokeDasharray={`${activeDaily.productivity_score * 2.513} 251.3`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-bold ${scoreColor}`}>{activeDaily.productivity_score}%</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <p>Completion: <span className="font-semibold text-slate-200">{activeDaily.completed_tasks}/{activeDaily.total_tasks} plans completed</span></p>
                <p>Hours Invested: <span className="font-semibold text-slate-200">{activeDaily.total_hours_completed}/{activeDaily.total_hours_planned} hrs</span></p>
              </div>
            </div>

            {/* Time tracker card */}
            <div className="card p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Daily Hours Tracker</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Task Hours Completed</span>
                  <span className="font-semibold text-slate-200">{activeDaily.total_hours_completed}h</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Task Hours Planned</span>
                  <span className="font-semibold text-slate-200">{activeDaily.total_hours_planned}h</span>
                </div>

                {/* Progress bar for hours */}
                <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                  <div
                    className="bg-brand-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        activeDaily.total_hours_planned > 0
                          ? Math.min((activeDaily.total_hours_completed / activeDaily.total_hours_planned) * 100, 100)
                          : 0
                      }%`
                    }}
                  />
                </div>
                
                {activeDaily.total_hours_planned > activeDaily.total_hours_completed && (
                  <p className="text-[11px] text-slate-500 mt-1 italic text-center">
                    {(activeDaily.total_hours_planned - activeDaily.total_hours_completed).toFixed(1)} hours of planned work remaining.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for creating a daily task */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={`Create Task for ${format(currentDate, 'MMM d, yyyy')}`}>
        <TaskForm
          onDone={() => {
            setCreateOpen(false)
            fetchDailyData()
          }}
          task={{
            id: 0,
            user_id: 0,
            title: '',
            description: '',
            priority: 'Medium' as Priority,
            status: 'Pending',
            due_date: dateStr + 'T12:00:00.000Z',  // Pre-set the date in datetime-local compatible format
            created_at: '',
            updated_at: ''
          }}
        />
      </Modal>
    </div>
  )
}
