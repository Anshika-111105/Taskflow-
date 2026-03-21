import type { ReactNode } from 'react'

interface Props {
  title: string
  value: string | number
  sub?: string
  icon: ReactNode
  color?: string
}

export function StatCard({ title, value, sub, icon, color = 'text-brand-500' }: Props) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-xl bg-slate-800 ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-slate-100 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
