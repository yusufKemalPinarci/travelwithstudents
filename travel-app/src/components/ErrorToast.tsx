import { useEffect } from 'react'
import { XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

interface ErrorToastProps {
  message: string
  onClose: () => void
  duration?: number
}

export default function ErrorToast({ message, onClose, duration = 5000 }: ErrorToastProps) {
  const { user } = useAuth()
  const isGuide = user?.role === 'STUDENT_GUIDE'

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return (
    <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-5 duration-300">
      <div className={`
        max-w-md rounded-xl shadow-2xl border-2 p-4 pr-12
        ${isGuide 
          ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' 
          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        }
      `}>
        <div className="flex items-start gap-3">
          <XCircleIcon className={`
            w-6 h-6 flex-shrink-0 mt-0.5
            ${isGuide ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}
          `} />
          <div className="flex-1">
            <h3 className={`
              font-bold text-sm mb-1
              ${isGuide ? 'text-orange-900 dark:text-orange-300' : 'text-blue-900 dark:text-blue-300'}
            `}>
              Error
            </h3>
            <p className={`
              text-sm
              ${isGuide ? 'text-orange-800 dark:text-orange-400' : 'text-blue-800 dark:text-blue-400'}
            `}>
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`
              absolute top-3 right-3 p-1 rounded-lg transition-colors
              ${isGuide 
                ? 'hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400' 
                : 'hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400'
              }
            `}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
