import { Outlet } from 'react-router-dom'
import { BookingProvider } from './context/BookingContext'
import { AuthProvider } from './context/AuthContext'
import { ErrorProvider } from './context/ErrorContext'

import React from 'react';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Hata loglama yapılabilir
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Bir hata oluştu</h1>
          <pre className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 max-w-xl overflow-auto">
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg" onClick={() => window.location.reload()}>
            Yeniden Yükle
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppShell() {
  return (
    <AuthProvider>
      <ErrorProvider>
        <BookingProvider>
          <ErrorBoundary>
            <div className="app-shell">
              <Outlet />
            </div>
          </ErrorBoundary>
        </BookingProvider>
      </ErrorProvider>
    </AuthProvider>
  );
}

export default AppShell;
