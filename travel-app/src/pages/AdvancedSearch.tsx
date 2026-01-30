import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FunnelIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import GuideCard from '../components/GuideCard.tsx'
import PaginationControls from '../components/PaginationControls.tsx'
import SearchBar from '../components/SearchBar.tsx'
import EmptyState from '../components/EmptyState.tsx'
import { getAllGuides } from '../api/guides'
import type { Guide } from '../types'
import { LANGUAGES, TOUR_CATEGORIES, COUNTRIES, CITIES_BY_COUNTRY } from '../utils/constants'

const languages = [...LANGUAGES]
const expertise = [...TOUR_CATEGORIES]

export default function AdvancedSearchPage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  
  // URL'den city parametresini al ve filtrele
  useEffect(() => {
    const city = searchParams.get('city')
    if (city) {
      setQuery(city)
      setSelectedCity(city)
    }
  }, [searchParams])

  // API'den guide'ları çek
  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true)
      const params: any = {}
      if (selectedDate) {
        params.date = selectedDate
      }
      const data = await getAllGuides(params)
      setGuides(data)
      setLoading(false)
    }
    fetchGuides()
  }, [selectedDate])

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([])
  const [maxPrice, setMaxPrice] = useState(150)
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

      const matchesCountry = !selectedCountry || guide.city.toLowerCase().includes(selectedCountry.toLowerCase())
      const matchesCity = !selectedCity || guide.city.toLowerCase() === selectedCity.toLowerCase()

      const matchesLanguage = selectedLanguages.length === 0 ||
        selectedLanguages.some((lang) => guide.tags?.join(' ').toLowerCase().includes(lang.toLowerCase()))

      const matchesExpertise = selectedExpertise.length === 0 ||
        selectedExpertise.some((exp) => guide.tags?.join(' ').toLowerCase().includes(exp.toLowerCase()))

      const matchesPrice = guide.price <= maxPrice

      return matchesQuery && matchesCountry && matchesCity && matchesLanguage && matchesExpertise && matchesPrice
    })
  }, [query, selectedCountry, selectedCity, selectedLanguages, selectedExpertise, maxPrice])

  const totalPages = Math.max(1, Math.ceil(filteredGuides.length / pageSize))
  const pagedGuides = filteredGuides.slice((page - 1) * pageSize, page * pageSize)

  const toggleValue = (value: string, list: string[], setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value])
    setPage(1)
  }

  const handleReset = () => {
    setQuery('')
    setSelectedCountry('')
    setSelectedCity('')
    setSelectedDate('')
    setSelectedLanguages([])
    setSelectedExpertise([])
    setMaxPrice(80)
    setPage(1)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[280px,1fr] items-start">
      {/* Sidebar Filters */}
      <aside className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-slate-500" />
                Filters
            </h3>
            {(selectedCountry || selectedCity || selectedDate || selectedLanguages.length > 0 || selectedExpertise.length > 0 || maxPrice < 80) && (
                <button 
                    onClick={handleReset}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full transition-colors"
                >
                    <XMarkIcon className="w-3 h-3" /> Clear
                </button>
            )}
        </div>

        <div className="space-y-6 divide-y divide-slate-100">
           {/* Date Filter */}
           <div className="pt-2">
             <label className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
               <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
               Available on Date
             </label>
             <input
               type="date"
               value={selectedDate}
               min={new Date().toISOString().split('T')[0]}
               onChange={(e) => {
                 setSelectedDate(e.target.value)
                 setPage(1)
               }}
               className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
             />
             {selectedDate && (
               <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                 Showing guides available on this date
               </p>
             )}
           </div>

           {/* Country Filter */}
           <div className="pt-6">
             <label className="text-sm font-bold text-slate-900 block mb-3">Country</label>
             <select
               value={selectedCountry}
               onChange={(e) => {
                 setSelectedCountry(e.target.value)
                 setSelectedCity('') // Reset city when country changes
                 setPage(1)
               }}
               className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
             >
               <option value="">All Countries</option>
               {COUNTRIES.map(country => (
                 <option key={country} value={country}>{country}</option>
               ))}
             </select>
           </div>

           {/* City Filter */}
           <div className="pt-6">
             <label className="text-sm font-bold text-slate-900 block mb-3">City</label>
             <select
               value={selectedCity}
               onChange={(e) => {
                 setSelectedCity(e.target.value)
                 setPage(1)
               }}
               className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
             >
               <option value="">All Cities</option>
               {selectedCountry ? (
                 CITIES_BY_COUNTRY[selectedCountry]?.map(city => (
                   <option key={city} value={city}>{city}</option>
                 ))
               ) : (
                 Object.entries(CITIES_BY_COUNTRY).map(([country, cities]) =>
                   cities.map(city => (
                     <option key={`${country}-${city}`} value={city}>{city}, {country}</option>
                   ))
                 )
               )}
             </select>
           </div>

           {/* Price Filter */}
           <div className="pt-2">
             <div className="flex justify-between items-center mb-4">
               <span className="text-sm font-bold text-slate-900">Hourly Rate</span>
               <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                 Up to ${maxPrice}
               </span>
             </div>
             <input
               type="range"
               min={0}
               max={150}
               step={5}
               value={maxPrice}
               onChange={(e) => {
                 setMaxPrice(Number(e.target.value))
                 setPage(1)
               }}
               className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
             />
             <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
               <span>$0</span>
               <span>$150+</span>
             </div>
           </div>

           {/* Language Filter */}
           <div className="pt-6">
              <p className="text-sm font-bold text-slate-900 mb-3">Languages</p>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => {
                    const isSelected = selectedLanguages.includes(lang);
                    return (
                        <button
                          key={lang}
                          onClick={() => toggleValue(lang, selectedLanguages, setSelectedLanguages)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                              isSelected 
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105' 
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {lang}
                        </button>
                    )
                })}
              </div>
           </div>

           {/* Expertise Filter */}
           <div className="pt-6">
              <p className="text-sm font-bold text-slate-900 mb-3">Expertise</p>
              <div className="flex flex-wrap gap-2">
                {expertise.map((exp) => {
                    const isSelected = selectedExpertise.includes(exp);
                    return (
                        <button
                          key={exp}
                          onClick={() => toggleValue(exp, selectedExpertise, setSelectedExpertise)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                              isSelected 
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105' 
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {exp}
                        </button>
                    )
                })}
              </div>
           </div>
        </div>
      </aside>

      <section className="space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
             <SearchBar placeholder="Search by city (e.g. Istanbul), name or keyword..." onSearch={setQuery} />
        </div>
        
        {loading ? (
             <div className="text-center py-12">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                 <p className="text-slate-500">
                   {selectedDate ? 'Finding available guides for your date...' : 'Finding best local guides...'}
                 </p>
             </div>
        ) : filteredGuides.length > 0 ? (
          <>
            <div className="flex items-center justify-between px-2">
                 <p className="text-sm font-medium text-slate-500">
                     Showing <span className="text-slate-900 font-bold">{filteredGuides.length}</span> {selectedDate && 'available'} guides
                     {selectedDate && (
                       <span className="ml-2 text-orange-600 font-semibold">
                         on {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                       </span>
                     )}
                 </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {pagedGuides.map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
            <div className="pt-8 flex justify-center">
                 <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        ) : (
          <EmptyState onAction={handleReset} />
        )}
      </section>
    </div>
  )
}
