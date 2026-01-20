import { Outlet, Link } from 'react-router-dom'

export default function CheckoutLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white py-4">
        <div className="mx-auto max-w-3xl px-4 flex justify-between items-center">
             <Link to="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-sm">
                    TS
                </div>
                <span className="font-bold text-slate-900">Travel with Student</span>
            </Link>
             <div className="flex items-center gap-1 text-sm text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Secure Checkout
            </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="py-6 text-center text-xs text-slate-400">
        <p>&copy; 2026 Travel with Student. All payments are encrypted.</p>
      </footer>
    </div>
  )
}
