import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Avatar from '../components/Avatar'
import { 
  AcademicCapIcon,  
  ExclamationCircleIcon, 
  ClockIcon,
  PhotoIcon,
  UserCircleIcon,
  TrashIcon,
  PlusIcon,
  ArrowTopRightOnSquareIcon,
  CameraIcon
} from '@heroicons/react/24/solid'
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, updateProfileImage } from '../api/auth';
import { uploadGuideGallery, updateGuideProfile } from '../api/guides';
import { getImageUrl, getDefaultAvatar } from '../utils/image';
import { COUNTRIES, CITIES_BY_COUNTRY } from '../utils/constants';
import { searchUniversities, type University } from '../api/universities';

const SUPPORTED_LANGUAGES = ['English', 'Spanish', 'Turkish', 'Italian', 'French', 'German', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic'];

const INTEREST_TAGS = ['History', 'Foodie', 'Nightlife', 'Photography', 'Shopping', 'Museums', 'Nature', 'Art', 'Architecture', 'Sports'];

export default function GuideProfileEditor() {
  const { user: authUser, setUser } = useAuth(); // Destructure setUser
  const [activeTab, setActiveTab] = useState<'info' | 'availability' | 'gallery'>('info')
  const [loading, setLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false); // New state for loading circle
  const [uploadProgress, setUploadProgress] = useState(0); // Progress for profile image upload
  const [guideId, setGuideId] = useState<string | null>(null);

  // -- Task 1: Profile Info State --
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [motto, setMotto] = useState('');
  const [country, setCountry] = useState<string>(COUNTRIES[0]);
  const [city, setCity] = useState<string>('');
  const [university, setUniversity] = useState('')
  const [universityResults, setUniversityResults] = useState<University[]>([])
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false)
  const [isSearchingUniversity, setIsSearchingUniversity] = useState(false)
  const universityInputRef = useRef<HTMLInputElement>(null)
  const universityDropdownRef = useRef<HTMLDivElement>(null)
  const [major, setMajor] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [languageInput, setLanguageInput] = useState('')
  const [hourlyRate, setHourlyRate] = useState(20)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [bio, setBio] = useState("")
  const [photos, setPhotos] = useState<string[]>([]);
  // Availability state is likely defined below...

    // Load Data
    useEffect(() => {
        const load = async () => {
            if (authUser?.id) {
                const user = await getUserProfile(authUser.id);
                if (user) {
                    setProfileImage(user.profileImage || null);
                    if (user.guideProfile) {
                        setGuideId(user.guideProfile.id);
                        setMotto(user.guideProfile.motto || '');
                        setBio(user.guideProfile.bio || '');
                        setCountry(user.guideProfile.country || COUNTRIES[0]);
                        setCity(user.guideProfile.city || '');
                        setUniversity(user.guideProfile.university || '');
                        setMajor(user.guideProfile.major || '');
                        setHourlyRate(Number(user.guideProfile.hourlyRate) || 20);
                        // Ensure arrays
                        setLanguages(Array.isArray(user.guideProfile.languages) ? user.guideProfile.languages : []);
                        setSelectedTags(Array.isArray(user.guideProfile.tags) ? user.guideProfile.tags : []);
                        setPhotos(Array.isArray(user.guideProfile.gallery) ? user.guideProfile.gallery : []);
                    }
                }
            }
        };
        load();
    }, [authUser?.id]);

  // University search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (university && university.trim().length >= 2) {
        setIsSearchingUniversity(true)
        try {
          const results = await searchUniversities(university, country)
          setUniversityResults(results)
          setShowUniversityDropdown(results.length > 0)
        } catch (error) {
          console.error('Failed to search universities:', error)
        } finally {
          setIsSearchingUniversity(false)
        }
      } else {
        setUniversityResults([])
        setShowUniversityDropdown(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(delayDebounceFn)
  }, [university, country])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        universityDropdownRef.current &&
        !universityDropdownRef.current.contains(event.target as Node) &&
        universityInputRef.current &&
        !universityInputRef.current.contains(event.target as Node)
      ) {
        setShowUniversityDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       const file = e.target.files[0];
       
       if (authUser?.id) {
           setIsUploadingImage(true); 
           setUploadProgress(0);
           
           // Use updateProfileImage instead of generic updateUserProfile
           updateProfileImage(file, (percentCompleted) => {
                setUploadProgress(percentCompleted);
           }).then((data) => {
               if (data && data.profileImage) {
                   const newImageUrl = data.profileImage;
                   setProfileImage(newImageUrl);
                   // Update global auth context
                   if (authUser) {
                        setUser({ 
                            ...authUser, 
                            profileImage: newImageUrl 
                        });
                   }
               }
           }).catch(err => {
               console.error("Failed to upload image", err);
               alert("Failed to upload image.");
           }).finally(() => {
               setIsUploadingImage(false); 
               setUploadProgress(0);
           });
       }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!guideId) {
        alert("Guide profile is not loaded. Please try again later.");
        return;
    }
    if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files);
        setLoading(true);

        try {
            const uploadedUrls = await uploadGuideGallery(guideId, newFiles);
            if (uploadedUrls) {
                // Backend returns the full updated gallery list
                setPhotos(uploadedUrls); 
            } else {
                alert("Failed to upload photos.");
            }
        } catch (err) {
            console.error("Gallery upload error:", err);
            alert("An error occurred during upload.");
        } finally {
            setLoading(false);
            // Clear input so same files can be selected again if needed
            e.target.value = '';
        }
    }
  };

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
        setLanguages(languages.filter(l => l !== lang));
    } else {
        setLanguages([...languages, lang]);
    }
  };


  // -- Task 2: Availability State --
  const [availability, setAvailability] = useState<Record<string, { active: boolean; start: string; end: string }>>({
    monday: { active: true, start: '09:00', end: '17:00' },
    tuesday: { active: true, start: '09:00', end: '17:00' },
    wednesday: { active: true, start: '09:00', end: '17:00' },
    thursday: { active: true, start: '09:00', end: '17:00' },
    friday: { active: true, start: '09:00', end: '17:00' },
    saturday: { active: false, start: '10:00', end: '15:00' },
    sunday: { active: false, start: '10:00', end: '15:00' },
  });

  // -- Task 3: Gallery State -- (Managed via API, local 'photos' state initialized in useEffect)

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

  const handleSave = async () => {
    if (!guideId || !authUser?.id) {
        alert("Error: Guide profile not loaded.");
        return;
    }

    setLoading(true)
    try {
        const guideData = {
            motto,
            country,
            city,
            university,
            major,
            languages,
            hourlyRate,
            tags: selectedTags,
            bio,
            // Note: Availability schedule update requires backend support currently not visible in updateGuideProfile
        };

        const updatedGuide = await updateGuideProfile(guideId, guideData);

        if (updatedGuide) {
             // Refresh global user context to ensure all components have latest data
             const refreshedUser = await getUserProfile(authUser.id);
             if (refreshedUser && setUser) {
                setUser(refreshedUser);
             }
            alert('Profile saved successfully!');
        } else {
            alert('Failed to save profile. Please try again.');
        }
    } catch (error) {
        console.error("Save error:", error);
        alert('An error occurred while saving.');
    } finally {
        setLoading(false)
    }
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
          <div className="flex flex-col items-end gap-2">
            <Button onClick={handleSave} isLoading={loading} disabled={!isBioValid}>Save Changes</Button>
            {!isBioValid && <span className="text-xs text-red-500 font-medium whitespace-nowrap">* Bio must be 150+ chars</span>}
          </div>
        </div>

        {/* --- TAB: PROFILE INFO --- */}
        {activeTab === 'info' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Section: Profile Picture */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start">
               <div className="relative group shrink-0">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 relative">
                    {profileImage ? (
                        <img 
                            src={getImageUrl(profileImage)} 
                            alt="Profile" 
                            className={`w-full h-full object-cover ${isUploadingImage ? 'opacity-50' : ''}`} 
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = getDefaultAvatar(authUser?.name)
                            }} 
                        />
                    ) : (
                        <Avatar 
                            name={authUser?.name || 'Guide'} 
                            size="full" 
                            className={`w-full h-full text-4xl ${isUploadingImage ? 'opacity-50' : ''}`} 
                        />
                    )}
                    {/* Upload Overlay / Loader */}
                    {isUploadingImage && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 transition-all duration-200">
                             <div className="relative w-12 h-12">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="24"
                                        cy="24"
                                        r="20"
                                        stroke="white"
                                        strokeWidth="4"
                                        fill="transparent"
                                        className="opacity-30"
                                    />
                                    <circle
                                        cx="24"
                                        cy="24"
                                        r="20"
                                        stroke="white"
                                        strokeWidth="4"
                                        fill="transparent"
                                        strokeDasharray={126}
                                        strokeDashoffset={126 - (126 * uploadProgress) / 100}
                                        strokeLinecap="round"
                                        className="transition-all duration-100 ease-linear"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold">
                                    {uploadProgress}%
                                </div>
                             </div>
                        </div>
                    )}
                  </div>
                  <label htmlFor="p-upload" className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full cursor-pointer hover:bg-slate-800 transition-colors shadow-sm z-20">
                    <CameraIcon className="w-5 h-5" />
                  </label>
                  <input type="file" id="p-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
               </div>
               <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Headline / Motto</label>
                      <input 
                        type="text" 
                        value={motto}
                        onChange={(e) => setMotto(e.target.value)}
                        placeholder="e.g. History buff showing you the real Istanbul!"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                      <p className="text-xs text-slate-500">A short phrase that appears under your name in search results.</p>
                  </div>
                  
                  {/* Location Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Country</label>
                        <select 
                            value={country} 
                            onChange={(e) => {
                              setCountry(e.target.value)
                              setCity('') // Reset city when country changes
                            }}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        >
                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">City</label>
                        <select 
                            value={city} 
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        >
                            <option value="">Select city...</option>
                            {CITIES_BY_COUNTRY[country]?.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <p className="text-xs text-slate-500">Your base city for tours</p>
                    </div>
                  </div>
               </div>
            </section>

            {/* Section A: Academic Info */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <AcademicCapIcon className="w-5 h-5 text-indigo-500" /> Academic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1 md:col-span-2 relative">
                        <label className="text-sm font-bold text-slate-700">University</label>
                        <div className="relative">
                            <input 
                                ref={universityInputRef}
                                type="text"
                                value={university} 
                                onChange={(e) => setUniversity(e.target.value)}
                                onFocus={() => {
                                    if (universityResults.length > 0) {
                                        setShowUniversityDropdown(true)
                                    }
                                }}
                                placeholder="Type to search universities..."
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            />
                            {isSearchingUniversity && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                                </div>
                            )}
                        </div>
                        
                        {/* Dropdown Results */}
                        {showUniversityDropdown && universityResults.length > 0 && (
                            <div 
                                ref={universityDropdownRef}
                                className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                            >
                                {universityResults.map((uni, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => {
                                            setUniversity(uni.name)
                                            setShowUniversityDropdown(false)
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                                    >
                                        <div className="font-medium text-slate-900">{uni.name}</div>
                                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                            <span>{uni.country}</span>
                                            {uni.state_province && (
                                                <>
                                                    <span>•</span>
                                                    <span>{uni.state_province}</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
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
                                min="0"
                                step="1"
                                value={hourlyRate}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value)
                                  if (value >= 0) {
                                    setHourlyRate(value)
                                  }
                                }}
                                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <p className="text-xs text-slate-500">Set your hourly rate (minimum $0)</p>
                    </div>

                    {/* Languages */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700">Languages Spoken</label>
                        
                        {/* Selected Chips */}
                         <div className="flex flex-wrap gap-2">
                            {languages.map(lang => (
                                <span key={lang} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
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

                        {/* Quick Select */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Popular Languages</p>
                            <div className="flex flex-wrap gap-2">
                                {SUPPORTED_LANGUAGES.map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => toggleLanguage(lang)}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                                            languages.includes(lang) 
                                            ? 'bg-indigo-600 text-white border-indigo-600' 
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Input */}
                        <div className="flex gap-2 max-w-md">
                            <input 
                                type="text" 
                                value={languageInput}
                                onChange={(e) => setLanguageInput(e.target.value)}
                                onKeyDown={handleKeyDownLanguage}
                                placeholder="Add another language..."
                                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
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
                    aria-label="About Me / Bio *"
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
                      <div>
                        <input 
                            type="file" 
                            id="g-upload" 
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleGalleryUpload} 
                        />
                        <Button 
                            variant="secondary" 
                            onClick={() => document.getElementById('g-upload')?.click()}
                            isLoading={loading}
                        >
                          <span className="flex items-center gap-1">
                              <PlusIcon className="w-4 h-4" /> Add Photo
                          </span>
                        </Button>
                      </div>
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
