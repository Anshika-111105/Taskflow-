import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props {
  data: { Low: number; Medium: number; High: number }
}

const COLORS = ['#10b981', '#f59e0b', '#f43f5e']

export function PriorityChart({ data }: Props) {
  const entries = [
    { name: 'Low', value: data.Low },
    { name: 'Medium', value: data.Medium },
    { name: 'High', value: data.High },
  ].filter((e) => e.value > 0)

  if (entries.length === 0) return <p className="text-slate-500 text-sm text-center py-8">No tasks yet</p>

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={entries} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
          {entries.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
          itemStyle={{ color: '#94a3b8' }}
        />
        <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}
