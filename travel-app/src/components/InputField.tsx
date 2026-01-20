import type { InputHTMLAttributes } from 'react'

type InputFieldProps = {
  label: string
  error?: string
  hasError?: boolean
} & InputHTMLAttributes<HTMLInputElement>

export default function InputField({ label, error, hasError, className = '', ...props }: InputFieldProps) {
  const borderClass = error || hasError 
    ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
    : "border-slate-200 focus:border-primary-500 focus:ring-primary-100"

  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-slate-900 shadow-inner shadow-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${borderClass} ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  )
}
