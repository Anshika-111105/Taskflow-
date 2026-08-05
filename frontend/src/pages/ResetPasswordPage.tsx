import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react'
import { authService } from '../services/auth.service'
import { Spinner } from '../components/ui/Spinner'

interface FormData {
  password: string
  confirmPassword: string
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>()

  const password = watch('password')

  const onSubmit = async (d: FormData) => {
    if (!token) {
      setError('Invalid reset token.')
      return
    }
    setError('')
    try {
      await authService.resetPassword(token, d.password)
      setSuccess(true)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg || 'Failed to reset password. The token may be invalid or expired.')
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="card p-6 border-rose-500/20 bg-rose-500/5">
            <Lock size={32} className="text-rose-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-rose-400 mb-2">Invalid Reset Request</h2>
            <p className="text-slate-400 text-sm mb-6">
              No reset token was found in the URL. Please request a new password reset link.
            </p>
            <Link to="/forgot-password" className="btn-primary w-full justify-center">
              Request Reset Link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-brand-500/20 border border-brand-500/30 rounded-2xl mb-4">
            <Lock size={24} className="text-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Reset password</h1>
          <p className="text-slate-500 text-sm mt-1">Please enter your new password below</p>
        </div>

        <div className="card p-6">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-lg font-bold text-slate-100 mb-2">Password Reset Success</h2>
              <p className="text-slate-400 text-sm mb-6">
                Your password has been successfully reset. You can now log in using your new credentials.
              </p>
              <Link to="/login" className="btn-primary w-full justify-center">
                Go to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl px-4 py-2.5">
                  {error}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">New Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Required',
                    minLength: { value: 6, message: 'Must be at least 6 characters' }
                  })}
                />
                {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Confirm New Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword', {
                    required: 'Required',
                    validate: (value) => value === password || 'Passwords do not match'
                  })}
                />
                {errors.confirmPassword && <p className="text-xs text-rose-400 mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" className="btn-primary w-full justify-center mt-2" disabled={isSubmitting}>
                {isSubmitting && <Spinner size="sm" />} Save New Password
              </button>
            </form>
          )}
        </div>

        {!success && (
          <p className="text-center text-slate-500 text-sm mt-4">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-medium">
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
