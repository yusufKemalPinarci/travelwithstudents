import { useMemo, useState } from 'react'
import Button from '../components/Button.tsx'
import CityCard from '../components/CityCard.tsx'
import GuideCard from '../components/GuideCard.tsx'
import SearchBar from '../components/SearchBar.tsx'
import ReviewModal from '../components/ReviewModal.tsx'
import ProfileCompletionWidget from '../components/ProfileCompletionWidget.tsx'
import { cities, guides } from '../utils/mockData.ts'

export default function DashboardPage() {
  const [query, setQuery] = useState('')
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  
  // Mock current user for demonstration
  const currentUser = {
      isPhoneVerified: false,
      bio: ''
  };

  const filteredGuides = useMemo(() => {
    if (!query.trim()) return guides
    const term = query.toLowerCase()
    return guides.filter(
      (guide) =>
        guide.name.toLowerCase().includes(term) ||
        guide.city.toLowerCase().includes(term) ||
        guide.tags?.some((tag) => tag.toLowerCase().includes(term)),
    )
  }, [query])

  return (
    <div className="space-y-10">
      <ProfileCompletionWidget user={currentUser} />
      <section className="grid gap-8 rounded-2xl bg-white p-6 shadow-card">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-primary-600">Travel with students</p>
          <h2 className="text-3xl font-bold text-slate-900">Find a guide who knows the city like home</h2>
          <p className="text-slate-600">
            Browse verified student guides, pick experiences that match your vibe, and book with secure checkout.
          </p>
          <SearchBar placeholder="Try 'food tour in Barcelona'" onSearch={setQuery} />
          <div className="flex flex-wrap gap-2">
            {['Food tours', 'Campus walk', 'Nightlife', 'Museums'].map((chip) => (
              <button
                key={chip}
                className="pill hover:bg-primary-50 hover:text-primary-700"
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
          <h3 className="section-heading">Featured guides</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsReviewOpen(true)}>
              Test Review Modal
            </Button>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredGuides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="section-heading">Trending cities</h3>
          <Button variant="ghost" size="sm">
            Explore cities
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
