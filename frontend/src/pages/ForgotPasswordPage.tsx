import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { KeyRound, ArrowLeft } from 'lucide-react'
import { authService } from '../services/auth.service'
import { Spinner } from '../components/ui/Spinner'

interface FormData {
  email: string
}

export default function ForgotPasswordPage() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [debugToken, setDebugToken] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>()

  const onSubmit = async (d: FormData) => {
    setError('')
    setSuccess('')
    setDebugToken(null)
    try {
      const { data } = await authService.forgotPassword(d.email)
      setSuccess(data.message || 'Reset instructions have been sent to your email.')
      if (data.debug_token) {
        setDebugToken(data.debug_token)
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg || 'An error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-brand-500/20 border border-brand-500/30 rounded-2xl mb-4">
            <KeyRound size={24} className="text-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Forgot password?</h1>
          <p className="text-slate-500 text-sm mt-1">No worries, we'll send you reset instructions</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl px-4 py-2.5">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl px-4 py-2.5">
                {success}
              </div>
            )}

            {!success && (
              <>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email Address</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="you@example.com"
                    {...register('email', { required: 'Required' })}
                  />
                  {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
                </div>

                <button type="submit" className="btn-primary w-full justify-center mt-2" disabled={isSubmitting}>
                  {isSubmitting && <Spinner size="sm" />} Reset Password
                </button>
              </>
            )}

            {/* Developer Testing Quick Link */}
            {debugToken && (
              <div className="mt-4 p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl text-center">
                <p className="text-xs text-brand-300 mb-2 font-medium">🛠️ Developer Debug Mode</p>
                <p className="text-xs text-slate-400 mb-3">Since email setup is local, you can use this shortcut to reset:</p>
                <Link
                  to={`/reset-password?token=${debugToken}`}
                  className="btn-primary w-full justify-center text-xs py-2 bg-brand-600 hover:bg-brand-500 border border-brand-400/20"
                >
                  Go to Reset Password
                </Link>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-4">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-medium">
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
