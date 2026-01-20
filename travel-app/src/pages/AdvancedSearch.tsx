import { useMemo, useState } from 'react'
import GuideCard from '../components/GuideCard.tsx'
import PaginationControls from '../components/PaginationControls.tsx'
import SearchBar from '../components/SearchBar.tsx'
import EmptyState from '../components/EmptyState.tsx'
import { guides } from '../utils/mockData.ts'

const languages = ['English', 'Spanish', 'Turkish', 'Italian']
const expertise = ['Food', 'Museums', 'Nightlife', 'History']

export default function AdvancedSearchPage() {
  const [query, setQuery] = useState('')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([])
  const [maxPrice, setMaxPrice] = useState(40)
  const [page, setPage] = useState(1)
  const pageSize = 6

  const filteredGuides = useMemo(() => {
    const term = query.toLowerCase()
    return guides.filter((guide) => {
      const matchesQuery =
        !term ||
        guide.name.toLowerCase().includes(term) ||
        guide.city.toLowerCase().includes(term) ||
        guide.tags?.some((tag) => tag.toLowerCase().includes(term))

      const matchesLanguage = selectedLanguages.length === 0 ||
        selectedLanguages.some((lang) => guide.tags?.join(' ').toLowerCase().includes(lang.toLowerCase()))

      const matchesExpertise = selectedExpertise.length === 0 ||
        selectedExpertise.some((exp) => guide.tags?.join(' ').toLowerCase().includes(exp.toLowerCase()))

      const matchesPrice = guide.price <= maxPrice

      return matchesQuery && matchesLanguage && matchesExpertise && matchesPrice
    })
  }, [query, selectedLanguages, selectedExpertise, maxPrice])

  const totalPages = Math.max(1, Math.ceil(filteredGuides.length / pageSize))
  const pagedGuides = filteredGuides.slice((page - 1) * pageSize, page * pageSize)

  const toggleValue = (value: string, list: string[], setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value])
    setPage(1)
  }

  const handleReset = () => {
    setQuery('')
    setSelectedLanguages([])
    setSelectedExpertise([])
    setMaxPrice(80)
    setPage(1)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <aside className="card-surface h-fit p-4 lg:sticky lg:top-24">
        <h3 className="section-heading">Filters</h3>
        <div className="space-y-4 pt-4">
          <div>
            <p className="text-sm font-semibold text-slate-700">Language</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang}
                  className={`pill ${selectedLanguages.includes(lang) ? 'bg-primary-50 text-primary-700 border border-primary-100' : ''}`}
                  onClick={() => toggleValue(lang, selectedLanguages, setSelectedLanguages)}
                  type="button"
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700">Expertise</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {expertise.map((exp) => (
                <button
                  key={exp}
                  className={`pill ${selectedExpertise.includes(exp) ? 'bg-accent-50 text-accent-700 border border-accent-100' : ''}`}
                  onClick={() => toggleValue(exp, selectedExpertise, setSelectedExpertise)}
                  type="button"
                >
                  {exp}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700">Max rate (${maxPrice}/hr)</p>
            <input
              type="range"
              min={20}
              max={80}
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value))
                setPage(1)
              }}
              className="w-full accent-primary-600"
            />
          </div>
        </div>
      </aside>

      <section className="space-y-4">
        <SearchBar placeholder="Search guides, cities, or tags" onSearch={setQuery} />
        
        {filteredGuides.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pagedGuides.map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
            <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        ) : (
          <EmptyState onAction={handleReset} />
        )}
      </section>
    </div>
  )
}
