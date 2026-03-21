import { useEffect, useState } from 'react'
import { CheckCircle2, ListTodo, TrendingUp, Zap, Clock, Star } from 'lucide-react'
import { analyticsService } from '../services/analytics.service'
import { useAuthStore } from '../store/auth.store'
import type { Analytics } from '../types'
import { StatCard } from '../components/ui/StatCard'
import { CompletionChart } from '../components/charts/CompletionChart'
import { PriorityChart } from '../components/charts/PriorityChart'
import { Spinner } from '../components/ui/Spinner'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsService.getAnalytics()
      .then(({ data }) => setAnalytics(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 text-sm mt-0.5">Here is your productivity overview</p>
      </div>
      {analytics && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Tasks" value={analytics.total_tasks} icon={<ListTodo size={18} />} />
            <StatCard title="Completed" value={analytics.completed_tasks} sub={analytics.completion_percentage + '% rate'} icon={<CheckCircle2 size={18} />} color="text-emerald-400" />
            <StatCard title="Completed Today" value={analytics.completed_today} sub={analytics.completed_this_week + ' this week'} icon={<TrendingUp size={18} />} color="text-amber-400" />
            <StatCard title="Productivity Score" value={analytics.productivity_score + '%'} sub="Weighted formula" icon={<Zap size={18} />} color="text-purple-400" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <StatCard title="Avg Completion" value={analytics.average_completion_hours + 'h'} icon={<Clock size={18} />} color="text-sky-400" />
            <StatCard title="This Month" value={analytics.completed_this_month} icon={<Star size={18} />} color="text-rose-400" />
            <StatCard title="Most Productive Day"
              value={analytics.most_productive_day
                ? new Date(analytics.most_productive_day).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })
                : '—'}
              icon={<TrendingUp size={18} />} color="text-brand-500" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card p-5 lg:col-span-2">
              <h2 className="text-sm font-semibold text-slate-300 mb-4">Completions - Last 30 Days</h2>
              <CompletionChart data={analytics.daily_chart_data} />
            </div>
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-slate-300 mb-4">Priority Distribution</h2>
              <PriorityChart data={analytics.priority_distribution} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
