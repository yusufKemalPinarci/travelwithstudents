import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button.tsx'
import InputField from '../components/InputField.tsx'
import SocialLoginButtons from '../components/SocialLoginButtons.tsx'
import ToggleButton from '../components/ToggleButton.tsx'

const roles = ['Traveler', 'Student Guide'] as const

type Role = (typeof roles)[number]

type FormState = {
  name: string
  email: string
  password: string
  confirm?: string
}

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register } = useAuth()
  // Ensure mode is strictly 'login' or 'register'
  const initialMode = (location.state as any)?.mode === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [role, setRole] = useState<Role>('Traveler')
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const headline = useMemo(
    () => (mode === 'login' ? 'Welcome back' : 'Create your guide account'),
    [mode],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Email and password are required.')
      return
    }

    if (mode === 'register' && !form.name) {
      setError('Name is required.')
      return
    }
    
    // Edu-Mail Validation for Student Guides
    if (mode === 'register' && role === 'Student Guide') {
        const eduRegex = /@.*\.(edu|edu\.tr|ac\.uk)$/i;
        if (!eduRegex.test(form.email)) {
            setError('Student guides must register with a valid university email (.edu, .edu.tr, .ac.uk).');
            return;
        }
    }

    if (mode === 'register' && form.password !== form.confirm) {
      setError('Passwords must match.')
      return
    }

    setLoading(true)
    
    try {
      let result;
      const apiRole = role === 'Traveler' ? 'TRAVELER' : 'STUDENT_GUIDE';

      if (mode === 'login') {
        result = await login({ email: form.email, password: form.password });
      } else {
        result = await register({ 
          email: form.email, 
          password: form.password,
          name: form.name,
          role: apiRole
        });
      }

      if (result.success && result.user) {
        // Routing Logic based on Role
        const userRole = result.user.role;
        
        // Default navigation based on role
        if (userRole === 'STUDENT_GUIDE') {
          // Student guides go to their dashboard
          navigate('/guide/dashboard');
        } else {
          // Travelers go to home page
          navigate('/');
        }
      } else {
        setError(result.message || 'Authentication failed');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-8 py-12 px-4 sm:px-0">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {headline}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {mode === 'login'
            ? 'Sign in to your account'
            : 'Start your journey with us today'}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 px-4 py-6 shadow-soft sm:rounded-xl sm:px-10 border border-slate-100 dark:border-slate-800">
        <div className="mb-6 flex justify-center">
          <ToggleButton
            options={roles}
            selected={role}
            onChange={(r) => setRole(r as Role)}
          />
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <InputField
              id="name"
              type="text"
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          )}

          <InputField
            id="email"
            type="email"
            label="Email address"
            value={form.email}
            onChange={(e) => {
                setForm({ ...form, email: e.target.value })
                setError('') // Clear error on change
            }}
            placeholder={role === 'Student Guide' ? "you@university.edu" : "name@example.com"}
            hasError={error.includes('Student guides must') || error.includes('Email')}
          />

          <InputField
            id="password"
            type="password"
            label="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {mode === 'register' && (
            <InputField
              id="confirm"
              type="password"
              label="Confirm Password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
          )}

          {error && <div className="text-sm text-red-500">{error}</div>}

          <Button type="submit" fullWidth isLoading={loading}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-slate-500">
              Or continue with
            </span>
          </div>
        </div>

        <SocialLoginButtons />

        <div className="mt-6 text-center text-sm">
          <span className="text-slate-600">
            {mode === 'login'
              ? "Don't have an account? "
              : 'Already have an account? '}
          </span>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
              setForm({ name: '', email: '', password: '', confirm: '' })
            }}
            className="font-medium text-primary-600 hover:text-primary-500 hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </div>

        {/* Skip Login - Browse as Guest */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <span>Continue without signing in</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="text-xs text-slate-400 mt-1">Browse tours as a guest</p>
        </div>
      </div>
    </div>
  )
}
