import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ElementType, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg'

type ButtonBaseProps = {
  variant?: Variant
  size?: Size
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  as?: ElementType
  to?: string
  fullWidth?: boolean
  isLoading?: boolean
  disabled?: boolean
  className?: string
  children: ReactNode
}

type ButtonProps = ButtonBaseProps &
  (ButtonHTMLAttributes<HTMLButtonElement> | AnchorHTMLAttributes<HTMLAnchorElement>)

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary-600 text-white shadow-card hover:bg-primary-700 focus-visible:ring-primary-500',
  secondary: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-500',
  ghost:
    'bg-transparent text-blue-900 border border-slate-200 hover:bg-slate-100 focus-visible:ring-primary-500',
  outline:
    'bg-white text-blue-900 border border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-500',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-3 py-2',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-base px-5 py-3',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  as: Component = 'button',
  to,
  fullWidth,
  isLoading = false,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-transform duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
      to={to}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      )}
      {!isLoading && leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </Component>
  )
}
