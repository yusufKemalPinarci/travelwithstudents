import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="hidden lg:flex relative overflow-hidden items-center justify-center p-12 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-500 text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.15),transparent_30%)]" />
        <div className="relative max-w-xl space-y-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur">
            Trusted student guides
          </p>
          <h1 className="text-3xl font-bold leading-tight">Discover cities with local student guides</h1>
          <p className="text-white/80">
            Book authentic tours from students who know their campus and city best. Flexible schedules,
            curated experiences, and safe payments.
          </p>
          <div className="flex gap-3 text-sm">
            <span className="pill bg-white/10 border border-white/20 text-white">Verified students</span>
            <span className="pill bg-white/10 border border-white/20 text-white">Insider tips</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 lg:p-12 bg-slate-50">
        <div className="w-full max-w-md card-surface shadow-card p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
