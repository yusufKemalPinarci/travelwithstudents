import { useMemo, useState, useEffect } from 'react'
import GuideCard from '../components/GuideCard.tsx'
import { getAllGuides } from '../api/guides'

export default function MapSearchPage() {
  const [guides, setGuides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeGuide, setActiveGuide] = useState<string | null>(null)

  useEffect(() => {
    const fetchGuides = async () => {
      const data = await getAllGuides()
      setGuides(data)
      setLoading(false)
    }
    fetchGuides()
  }, [])

  const highlighted = useMemo(
    () => guides.find((guide) => guide.id === activeGuide) ?? guides[0],
    [activeGuide, guides],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,420px]">
      <div className="relative h-[70vh] rounded-2xl border border-slate-200 bg-slate-100 shadow-card">
        <div className="absolute inset-0 flex items-center justify-center text-slate-500">
          <p className="text-sm">Map placeholder – plug in @react-google-maps/api here</p>
        </div>
        <div className="absolute inset-4 pointer-events-none">
          <div className="pointer-events-auto w-80 max-w-full rounded-2xl bg-white p-4 shadow-card">
            <p className="text-sm font-semibold text-primary-600">Highlighted guide</p>
            <GuideCard guide={highlighted} compact />
          </div>
        </div>
      </div>

      <div className="space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-soft max-h-[70vh]">
        <div className="flex items-center justify-between">
          <h3 className="section-heading">Guides on map</h3>
          <span className="text-sm text-slate-500">{guides.length} results</span>
        </div>
        <div className="space-y-3">
          {guides.map((guide) => (
            <button
              key={guide.id}
              type="button"
              onClick={() => setActiveGuide(guide.id)}
              className={`w-full text-left ${activeGuide === guide.id ? 'ring-2 ring-primary-200' : ''}`}
            >
              <GuideCard guide={guide} compact />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
