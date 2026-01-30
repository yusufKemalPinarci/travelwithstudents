import { createContext, useContext, useState, ReactNode } from 'react'
import ErrorToast from '../components/ErrorToast'

interface ErrorContextType {
  showError: (message: string) => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null)

  const showError = (message: string) => {
    setError(message)
  }

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      {error && (
        <ErrorToast 
          message={error} 
          onClose={() => setError(null)}
        />
      )}
    </ErrorContext.Provider>
  )
}

export function useError() {
  const context = useContext(ErrorContext)
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  return context
}
