import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Zap } from 'lucide-react'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../store/auth.store'
import { Spinner } from '../components/ui/Spinner'

interface FormData { email: string; password: string }

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>()

  const onSubmit = async (d: FormData) => {
    setError('')
    try {
      const { data } = await authService.login(d.email, d.password)
      setAuth(data.user, data.access_token, data.refresh_token)
      navigate('/dashboard')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg || 'Login failed. Check your credentials.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-brand-500/20 border border-brand-500/30 rounded-2xl mb-4">
            <Zap size={24} className="text-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your TaskFlow account</p>
        </div>
        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl px-4 py-2.5">{error}</div>}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email</label>
              <input className="input" type="email" placeholder="you@example.com" {...register('email', { required: 'Required' })} />
              {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Password</label>
              <input className="input" type="password" placeholder="••••••••" {...register('password', { required: 'Required' })} />
              {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" className="btn-primary w-full justify-center mt-2" disabled={isSubmitting}>
              {isSubmitting && <Spinner size="sm" />} Sign In
            </button>
          </form>
        </div>
        <p className="text-center text-slate-500 text-sm mt-4">
          No account? <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">Create one</Link>
        </p>
      </div>
    </div>
  )
}