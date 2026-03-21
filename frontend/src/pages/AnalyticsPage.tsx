import { useEffect, useState } from 'react';
import { analyticsService } from '../services/analytics.service'
import { Analytics } from '../types';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Award, Clock, Target } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const PRIORITY_COLORS = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };
const STATUS_COLORS = ['#4f6ef7', '#10b981', '#64748b'];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getAnalytics()
      .then((r: { data: Analytics }) => setAnalytics(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!analytics) return null;

  const priorityData = Object.entries(analytics.priority_distribution).map(([name, value]) => ({ name, value }));
  const statusData = [
    { name: 'Pending', value: analytics.pending_tasks },
    { name: 'Completed', value: analytics.completed_tasks },
    { name: 'Archived', value: analytics.archived_tasks },
  ];

  // Last 14 days for area chart
  const chartData = analytics.daily_chart_data.slice(-14).map(d => ({
    ...d,
    date: format(parseISO(d.date), 'MMM d')
  }));

  const scoreColor = analytics.productivity_score >= 70 ? '#10b981' :
    analytics.productivity_score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Your productivity insights</p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Completion Rate', value: `${analytics.completion_percentage}%`, icon: Target, color: 'text-brand-400', bg: 'bg-brand-500/10' },
          { label: 'Productivity Score', value: `${analytics.productivity_score}/100`, icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Avg Completion', value: `${analytics.average_completion_hours}h`, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Best Day Tasks', value: analytics.most_productive_day_count, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-slate-400 text-sm">{label}</p>
          </div>
        ))}
      </div>

      {/* Area Chart – Daily completions */}
      <div className="card p-5">
        <h2 className="font-semibold text-white mb-4">Daily Completions (Last 14 Days)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f6ef7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }} />
            <Area type="monotone" dataKey="completed" stroke="#4f6ef7" fill="url(#grad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Priority distribution – bar */}
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">Priority Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {priorityData.map((entry) => (
                  <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status distribution – pie */}
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                paddingAngle={4} dataKey="value">
                {statusData.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }} />
              <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Productivity score explanation */}
      <div className="card p-5">
        <h2 className="font-semibold text-white mb-3">Productivity Score Formula</h2>
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="10" />
              <circle cx="50" cy="50" r="40" fill="none" stroke={scoreColor} strokeWidth="10"
                strokeDasharray={`${analytics.productivity_score * 2.513} 251.3`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold" style={{ color: scoreColor }}>{analytics.productivity_score}</span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-400">
            <p><span className="text-white font-medium">Completion Rate × 50</span> — % of tasks marked complete</p>
            <p><span className="text-white font-medium">High Priority Rate × 30</span> — % of high-priority tasks done</p>
            <p><span className="text-white font-medium">On-Time Rate × 20</span> — % completed before due date</p>
            <p className="text-slate-500 text-xs">Max score: 100 | Score ≥ 70 = High performer</p>
          </div>
        </div>
      </div>
    </div>
  );
}
