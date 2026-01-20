import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import { 
  AcademicCapIcon, 
  ExclamationCircleIcon, 
  ClockIcon,
  PhotoIcon,
  UserCircleIcon,
  TrashIcon,
  PlusIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/solid'

const UNIVERSITIES = [
  'Boğaziçi University', 
  'Columbia University',
  'Harvard University',
  'Istanbul University', 
  'Koç University', 
  'New York University',
  'ODTÜ / METU', 
  'Sabancı University', 
  'Stanford University',
  'UCLA',
  'University of Amsterdam',
  'Yıldız Technical University'
];

const GRADUATION_YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

const INTEREST_TAGS = ['History', 'Foodie', 'Nightlife', 'Photography', 'Shopping', 'Museums', 'Nature', 'Art', 'Architecture', 'Sports'];

export default function GuideProfileEditor() {
  const [activeTab, setActiveTab] = useState<'info' | 'availability' | 'gallery'>('info')
  const [loading, setLoading] = useState(false)
  
  // -- Task 1: Profile Info State --
  const [university, setUniversity] = useState('Boğaziçi University')
  const [major, setMajor] = useState('History')
  const [gradYear, setGradYear] = useState(new Date().getFullYear() + 2)
  const [languages, setLanguages] = useState<string[]>(['English', 'Turkish'])
  const [languageInput, setLanguageInput] = useState('')
  const [hourlyRate, setHourlyRate] = useState(28)
  const [selectedTags, setSelectedTags] = useState<string[]>(['History', 'Foodie'])
  const [bio, setBio] = useState("History student at UvA, passionate about sharing the hidden stories of Amsterdam's canals. I specialize in food tours and WWII history.")

  // -- Task 2: Availability State --
  const [availability, setAvailability] = useState<Record<string, { active: boolean; start: string; end: string }>>({
    monday: { active: true, start: '09:00', end: '17:00' },
    tuesday: { active: true, start: '09:00', end: '17:00' },
    wednesday: { active: true, start: '09:00', end: '17:00' },
    thursday: { active: true, start: '09:00', end: '17:00' },
    friday: { active: true, start: '09:00', end: '17:00' },
    saturday: { active: false, start: '10:00', end: '15:00' },
    sunday: { active: false, start: '10:00', end: '15:00' },
  })

  // -- Task 3: Gallery State --
  const [photos, setPhotos] = useState([
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517404215738-15263e9f9178?auto=format&fit=crop&w=400&q=80'
  ])

  // Helpers
  const handleAddLanguage = () => {
    if (languageInput.trim() && !languages.includes(languageInput.trim())) {
      setLanguages([...languages, languageInput.trim()])
      setLanguageInput('')
    }
  }

  const handleKeyDownLanguage = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddLanguage()
    }
  }

  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang))
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const toggleDay = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active }
    }))
  }

  const updateTime = (day: string, type: 'start' | 'end', value: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], [type]: value }
    }))
  }

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => {
        setLoading(false)
        alert('Profile saved successfully!')
    }, 800)
  }

  const isBioValid = bio.length >= 150

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto px-4 py-8 relative">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="px-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Profile Settings
          </p>
          <nav className="flex flex-col gap-1">
            <SidebarItem
              active={activeTab === 'info'}
              onClick={() => setActiveTab('info')}
              icon={<UserCircleIcon className="w-5 h-5" />}
              label="Profile Info"
            />
            <SidebarItem
              active={activeTab === 'availability'}
              onClick={() => setActiveTab('availability')}
              icon={<ClockIcon className="w-5 h-5" />}
              label="Availability"
            />
            <SidebarItem
              active={activeTab === 'gallery'}
              onClick={() => setActiveTab('gallery')}
              icon={<PhotoIcon className="w-5 h-5" />}
              label="My City Gallery"
            />
          </nav>
        </div>

        {/* Task 4: Public Profile Preview Button (Sticky) */}
        <div className="sticky top-24 mt-auto p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
          <p className="text-xs font-semibold text-slate-500">Preview what travelers see</p>
          <Link 
            to="/profile/g1" // Mock ID
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors text-sm"
          >
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            View Public Profile
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Profile</h1>
            <p className="text-slate-500 mt-1">Manage your professional persona and schedule.</p>
          </div>
          <Button onClick={handleSave} isLoading={loading}>Save Changes</Button>
        </div>

        {/* --- TAB: PROFILE INFO --- */}
        {activeTab === 'info' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Section A: Academic Info */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <AcademicCapIcon className="w-5 h-5 text-indigo-500" /> Academic Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">University</label>
                        <select 
                            value={university} 
                            onChange={(e) => setUniversity(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        >
                            {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Department / Major</label>
                        <input 
                            type="text"
                            value={major}
                            onChange={(e) => setMajor(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Graduation Year</label>
                        <select 
                            value={gradYear}
                            onChange={(e) => setGradYear(parseInt(e.target.value))}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                             {GRADUATION_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
            </section>

            {/* Section B: Guide Details */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Guide Details</h2>
                <div className="space-y-6">
                    {/* Hourly Rate */}
                    <div className="space-y-1 max-w-xs">
                        <label className="text-sm font-bold text-slate-700">Hourly Rate ($)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                            <input 
                                type="number" 
                                min="10"
                                value={hourlyRate}
                                onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <p className="text-xs text-slate-500">Recommended for beginners: $10 - $20/hr</p>
                    </div>

                    {/* Languages - Tag Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Languages Spoken</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {languages.map(lang => (
                                <span key={lang} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                                    {lang}
                                    <button 
                                        onClick={() => removeLanguage(lang)}
                                        className="hover:text-indigo-900 focus:outline-none"
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2 max-w-md">
                            <input 
                                type="text" 
                                value={languageInput}
                                onChange={(e) => setLanguageInput(e.target.value)}
                                onKeyDown={handleKeyDownLanguage}
                                placeholder="Type language and press Enter..."
                                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                            <Button variant="secondary" size="sm" onClick={handleAddLanguage} type="button">Add</Button>
                        </div>
                    </div>

                    {/* Interests Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Interests & Tags</label>
                        <div className="flex flex-wrap gap-2">
                            {INTEREST_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors border ${
                                        selectedTags.includes(tag) 
                                        ? 'bg-slate-900 text-white border-slate-900' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

             {/* Section C: About Me Bio */}
             <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-900">About Me</h2>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${isBioValid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {bio.length} / 150 chars
                    </span>
                </div>
                <textarea
                    rows={6}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none resize-none leading-relaxed"
                />
                {!isBioValid && (
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                        <ExclamationCircleIcon className="w-4 h-4" /> 
                        Please write at least 150 characters to help travelers get to know you.
                    </p>
                )}
             </section>
          </div>
        )}

        {/* --- TAB: AVAILABILITY --- */}
        {activeTab === 'availability' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                 <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900">Weekly Schedule</h2>
                    <p className="text-slate-500 text-sm">Set your standard availability. You can override specific dates in the Calendar.</p>
                 </div>
                 
                 <div className="space-y-4">
                     {Object.entries(availability).map(([day, { active, start, end }]) => (
                         <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                             <div className="flex items-center gap-3 w-40">
                                 <label className="relative inline-flex items-center cursor-pointer">
                                     <input type="checkbox" checked={active} onChange={() => toggleDay(day)} className="sr-only peer" />
                                     <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                 </label>
                                 <span className="font-bold text-slate-700 capitalize">{day}</span>
                             </div>
                             
                             {active ? (
                                 <div className="flex items-center gap-2 flex-1">
                                     <input 
                                        type="time" 
                                        value={start}
                                        onChange={(e) => updateTime(day, 'start', e.target.value)}
                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                                     />
                                     <span className="text-slate-400 font-medium">to</span>
                                     <input 
                                        type="time" 
                                        value={end}
                                        onChange={(e) => updateTime(day, 'end', e.target.value)}
                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                                     />
                                 </div>
                             ) : (
                                 <div className="flex-1 text-slate-400 text-sm italic py-2">Unavailable</div>
                             )}
                         </div>
                     ))}
                 </div>
             </div>
          </div>
        )}

        {/* --- TAB: GALLERY --- */}
        {activeTab === 'gallery' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">My City Gallery</h2>
                        <p className="text-slate-500 text-sm">Upload photos of yourself exploring the city. No stock photos!</p>
                      </div>
                      <Button variant="outline" size="sm">
                          <span className="flex items-center gap-1">
                              <PlusIcon className="w-4 h-4" /> Add Photo
                          </span>
                      </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {photos.map((src, idx) => (
                          <div key={idx} className="relative group aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                              <img src={src} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button 
                                    onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                                    className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                      <TrashIcon className="w-5 h-5" />
                                  </button>
                              </div>
                          </div>
                      ))}
                      {/* Empty Slots */}
                      {Array.from({ length: Math.max(0, 6 - photos.length) }).map((_, idx) => (
                          <div key={`empty-${idx}`} className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 aspect-[4/3] hover:bg-slate-50 transition-colors cursor-pointer">
                              <PhotoIcon className="w-8 h-8 mb-2 opacity-50" />
                              <span className="text-xs font-bold">Empty Slot</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
        )}
      </main>
    </div>
  )
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${
        active
          ? 'bg-slate-900 text-white shadow-md'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <span className={active ? 'text-primary-300' : 'text-slate-400'}>{icon}</span>
      {label}
    </button>
  )
}
