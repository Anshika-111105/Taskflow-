import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, BarChart3, LogOut, Zap } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-slate-900/90 border-r border-slate-800/60 backdrop-blur-md flex flex-col z-40">
      <div className="p-5 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-brand-500 rounded-lg">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-100 tracking-tight">TaskFlow</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-800/60">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="h-8 w-8 rounded-full bg-brand-500/30 flex items-center justify-center text-brand-400 font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="btn-ghost w-full text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )
}