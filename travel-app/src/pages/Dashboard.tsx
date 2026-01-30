import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button.tsx'
import CityCard from '../components/CityCard.tsx'
import GuideCard from '../components/GuideCard.tsx'
import SearchBar from '../components/SearchBar.tsx'
import ReviewModal from '../components/ReviewModal.tsx'
import { cities } from '../utils/mockData.ts'
import { getAllGuides } from '../api/guides'
import type { Guide } from '../types'

export default function DashboardPage() {
  const { isAuthenticated } = useAuth()
  const [query, setQuery] = useState('')
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])

  // API'den guide'ları çek
  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true)
      const data = await getAllGuides()
      setGuides(data)
      
      // Extract unique categories from all guide tags
      const allTags = data.flatMap(guide => guide.tags || [])
      const uniqueTags = Array.from(new Set(allTags))
      // Take top 4 most common tags
      setCategories(uniqueTags.slice(0, 4))
      
      setLoading(false)
    }
    
    fetchGuides()
  }, [])

  const filteredGuides = useMemo(() => {
    if (!query.trim()) return guides
    const term = query.toLowerCase()
    return guides.filter(
      (guide) =>
        guide.name.toLowerCase().includes(term) ||
        guide.city.toLowerCase().includes(term) ||
        guide.tags?.some((tag) => tag.toLowerCase().includes(term)),
    )
  }, [query, guides])

  return (
    <div className="space-y-10">
      <section className="grid gap-8 rounded-2xl bg-white dark:bg-slate-900 p-4 md:p-6 shadow-card border border-slate-100 dark:border-slate-800">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">Travel with students</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Find a guide who knows the city like home</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Browse verified student guides, pick experiences that match your vibe, and book with secure checkout.
          </p>
          <SearchBar placeholder="Try 'food tour in Barcelona'" onSearch={setQuery} />
          <div className="flex flex-wrap gap-2">
            {categories.map((chip) => (
              <button
                key={chip}
                className="pill hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300"
                onClick={() => setQuery(chip)}
                type="button"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="section-heading">Featured Student Guides</h3>
          <Button variant="ghost" size="sm" as={Link} to="/search">
            View all
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Yükleniyor...</p>
          </div>
        ) : filteredGuides.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">Henüz guide bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredGuides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="section-heading">Trending cities</h3>
          <Link to="/search">
            <Button variant="ghost" size="sm">
              Explore cities
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cities.map((city) => (
            <CityCard key={city.id} city={city} />
          ))}
        </div>
      </section>

      <ReviewModal 
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        guideName="Alex Johnson"
        onSubmit={(data) => {
          console.log('Review submitted:', data)
          setIsReviewOpen(false)
        }}
      />
    </div>
  )
}
