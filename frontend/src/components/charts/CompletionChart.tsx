import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'

interface Props {
  data: { date: string; completed: number }[]
}

export function CompletionChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), 'MMM d'),
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={formatted} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="completionGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f6ef7" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} interval={6} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
          labelStyle={{ color: '#94a3b8' }}
          itemStyle={{ color: '#4f6ef7' }}
        />
        <Area type="monotone" dataKey="completed" stroke="#4f6ef7" strokeWidth={2} fill="url(#completionGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
