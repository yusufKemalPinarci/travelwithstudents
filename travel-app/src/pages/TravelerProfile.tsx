import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
    CheckBadgeIcon, 
    GlobeAmericasIcon, 
    ChatBubbleLeftRightIcon, 
    PencilSquareIcon,
    CameraIcon,
    SparklesIcon,
    MapPinIcon,
    AcademicCapIcon,
    PhotoIcon,
    ClockIcon,
    TrashIcon,
    PlusIcon,
    UserCircleIcon
} from '@heroicons/react/24/solid';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../api/auth';
import { updateGuideProfile, uploadGuideGallery } from '../api/guides';
import InputField from '../components/InputField';
import LocationPicker from '../components/LocationPicker';
import { getImageUrl } from '../utils/image';

const SUPPORTED_LANGUAGES = ['English', 'Spanish', 'Turkish', 'Italian', 'French', 'German', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic'];
const INTEREST_TAGS = ['History', 'Foodie', 'Nightlife', 'Photography', 'Shopping', 'Museums', 'Nature', 'Art', 'Architecture', 'Sports'];

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

// Helper to fix corrupted language data from legacy bugs
const normalizeLanguages = (langs: string[]) => {
    let normalized = [...langs];
    const mergedIndex = normalized.indexOf('EnglishSpanish');
    if (mergedIndex !== -1) {
        // Remove corrupted entry and add correct ones
        normalized.splice(mergedIndex, 1);
        normalized.push('English');
        normalized.push('Spanish');
    }
    // De-duplicate
    return [...new Set(normalized)];
};

export default function TravelerProfile() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser, setUser } = useAuth(); // Destructure setUser
  
  // Logic: If accessing my own profile or via direct /traveler/me link
  const isOwnProfile = authUser?.id === id; 
  const [showMap, setShowMap] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'availability' | 'gallery'>('info');

  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // Add uploading state for loading circle

  useEffect(() => {
    if (location.state?.edit && isOwnProfile) {
        setIsEditing(true);
    }
  }, [location.state, isOwnProfile]);

  const [profileData, setProfileData] = useState<any>(null);
  const [guideData, setGuideData] = useState<any>(null);
  const [guideId, setGuideId] = useState<string | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
        if (!id) return;
        try {
            const data: any = await getUserProfile(id);
            if (data) {
                 setProfileData({
                      id: data.id,
                      name: data.name,
                      bio: data.travelerProfile?.bio || '',
                      location: data.travelerProfile?.location || '',
                      languages: normalizeLanguages(data.travelerProfile?.languages || []),
                      interests: data.travelerProfile?.interests || [],
                      joined: data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
                      isVerified: data.isEmailVerified, 
                      email: data.email,
                      phone: data.phoneNumber || '',
                      image: data.profileImage
                  });
                  
                  // If user is a Student Guide, load guide profile data
                  if (data.guideProfile) {
                      setGuideId(data.guideProfile.id);
                      setGuideData({
                          motto: data.guideProfile.motto || '',
                          university: data.guideProfile.university || '',
                          major: data.guideProfile.major || '',
                          hourlyRate: data.guideProfile.hourlyRate || 0,
                          bio: data.guideProfile.bio || '',
                          languages: data.guideProfile.languages || [],
                          tags: data.guideProfile.tags || [],
                          gallery: data.guideProfile.gallery || [],
                          availability: data.guideProfile.availability || {
                              monday: { active: true, start: '09:00', end: '17:00' },
                              tuesday: { active: true, start: '09:00', end: '17:00' },
                              wednesday: { active: true, start: '09:00', end: '17:00' },
                              thursday: { active: true, start: '09:00', end: '17:00' },
                              friday: { active: true, start: '09:00', end: '17:00' },
                              saturday: { active: false, start: '10:00', end: '15:00' },
                              sunday: { active: false, start: '10:00', end: '15:00' }
                          }
                      });
                  }
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };
    fetchProfile();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!profileData || !id) return;

      setIsUploading(true);
      try {
          let updateData: any;

          if (selectedFile) {
            const formData = new FormData();
            formData.append('name', profileData.name);
            formData.append('phoneNumber', profileData.phone);
            formData.append('bio', profileData.bio || '');
            formData.append('location', profileData.location || '');
            
            if (profileData.languages) {
                profileData.languages.forEach((l: string) => formData.append('languages', l));
            }
            if (profileData.interests) {
                profileData.interests.forEach((i: string) => formData.append('interests', i));
            }
            
            formData.append('avatar', selectedFile);
            updateData = formData;
          } else {
            updateData = {
              name: profileData.name,
              phoneNumber: profileData.phone,
              profileImage: profileData.image,
              bio: profileData.bio,
              location: profileData.location,
              languages: profileData.languages,
              interests: profileData.interests
            };
          }

          const updatedUser: any = await updateUserProfile(id, updateData);
          
          // If user is a guide, also update guide profile
          if (guideData && authUser?.guideProfile?.id) {
              const guideUpdateData = {
                  motto: guideData.motto,
                  university: guideData.university,
                  major: guideData.major,
                  hourlyRate: guideData.hourlyRate,
                  bio: guideData.bio,
                  languages: guideData.languages,
                  tags: guideData.tags,
                  gallery: guideData.gallery,
                  availability: guideData.availability
              };
              await updateGuideProfile(authUser.guideProfile.id, guideUpdateData);
          }
          
          if (updatedUser) {
              // Update local state
              setProfileData((prev: any) => ({
                  ...prev,
                  name: updatedUser.name,
                  image: updatedUser.profileImage,
                  bio: updatedUser.travelerProfile?.bio,
                  location: updatedUser.travelerProfile?.location,
                  languages: updatedUser.travelerProfile?.languages,
                  interests: updatedUser.travelerProfile?.interests,
                  phone: updatedUser.phoneNumber
              }));
              
              // Sync with Global Auth Context (Navbar etc.)
              if (isOwnProfile && setUser) {
                  setUser({ ...authUser, ...updatedUser });
              }

              setIsEditing(false);
              setSelectedFile(null);
              setTempImage(null);
          }
      } catch (error) {
          console.error("Failed to update profile", error);
          alert('Failed to save profile. Please try again.');
      } finally {
          setIsUploading(false);
      }
  };
    
  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (!profileData) return <div className="p-8 text-center">User not found</div>;

  const handleChange = (field: keyof typeof profileData, value: any) => {
      setProfileData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleGuideChange = (field: string, value: any) => {
      setGuideData((prev: any) => ({ ...prev, [field]: value }));
  };
  
  const toggleDay = (day: string) => {
    if (!guideData?.availability) return;
    const newAvailability = {
      ...guideData.availability,
      [day]: { 
        ...guideData.availability[day], 
        active: !guideData.availability[day].active 
      }
    };
    handleGuideChange('availability', newAvailability);
  };

  const updateTime = (day: string, type: 'start' | 'end', value: string) => {
    if (!guideData?.availability) return;
    const newAvailability = {
      ...guideData.availability,
      [day]: { 
        ...guideData.availability[day], 
        [type]: value 
      }
    };
    handleGuideChange('availability', newAvailability);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!guideId) {
        alert("Guide profile is not loaded. Please try again later.");
        return;
    }
    if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files);
        setIsUploadingGallery(true);

        try {
            const uploadedUrls = await uploadGuideGallery(guideId, newFiles);
            if (uploadedUrls) {
                handleGuideChange('gallery', uploadedUrls);
            } else {
                alert("Failed to upload photos.");
            }
        } catch (err) {
            console.error("Gallery upload error:", err);
            alert("An error occurred during upload.");
        } finally {
            setIsUploadingGallery(false);
            e.target.value = '';
        }
    }
  };

  const removeGalleryPhoto = (index: number) => {
    if (!guideData?.gallery) return;
    const newGallery = guideData.gallery.filter((_: any, idx: number) => idx !== index);
    handleGuideChange('gallery', newGallery);
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
            setTempImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (guideData) {
        // If user is a guide, update guide languages
        const current = guideData.languages || [];
        if (current.includes(lang)) {
            handleGuideChange('languages', current.filter((l: string) => l !== lang));
        } else {
            handleGuideChange('languages', [...current, lang]);
        }
    } else {
        // Otherwise update traveler languages
        const current = profileData.languages;
        if (current.includes(lang)) {
            handleChange('languages', current.filter(l => l !== lang));
        } else {
            handleChange('languages', [...current, lang]);
        }
    }
  };

  const toggleInterest = (tag: string) => {
    if (guideData) {
        // If user is a guide, update guide tags
        const current = guideData.tags || [];
        if (current.includes(tag)) {
            handleGuideChange('tags', current.filter((t: string) => t !== tag));
        } else {
            handleGuideChange('tags', [...current, tag]);
        }
    } else {
        // Otherwise update traveler interests
        const current = profileData.interests || [];
        if (current.includes(tag)) {
            handleChange('interests', current.filter(t => t !== tag));
        } else {
            handleChange('interests', [...current, tag]);
        }
    }
  };

  const currentImage = isEditing && tempImage ? tempImage : getImageUrl(profileData.image);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-6 z-10 w-full md:w-auto">
            <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 relative group">
                    {currentImage ? (
                        <img src={currentImage} alt={profileData.name} className={`w-full h-full object-cover ${isUploading ? 'opacity-50' : ''}`} />
                    ) : (
                        <Avatar 
                            name={profileData.name} 
                            size="full" 
                            verified={profileData.isVerified} 
                            className={`w-full h-full text-4xl ${isUploading ? 'opacity-50' : ''}`} 
                        />
                    )}
                    
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                             <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    
                    {isEditing && !isUploading && (
                        <>
                            <label htmlFor="p-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <CameraIcon className="w-8 h-8 text-white" />
                            </label>
                            <input type="file" id="p-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </>
                    )}
                </div>
            </div>
            
            <div className="flex-1 space-y-2">
                {isEditing ? (
                    <div className="space-y-3 max-w-sm">
                        <InputField 
                            label="Full Name" 
                            value={profileData.name} 
                            onChange={(e) => handleChange('name', e.target.value)} 
                        />
                        <div className="relative">
                            <InputField 
                                label="Location" 
                                value={profileData.location} 
                                onChange={(e) => handleChange('location', e.target.value)} 
                            />
                            <button 
                                type="button"
                                onClick={() => setShowMap(true)}
                                className="absolute top-8 right-2 p-1 text-primary-600 hover:bg-primary-50 rounded"
                                title="Pick on Map"
                            >
                                <MapPinIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-black text-slate-900">{profileData.name}</h1>
                            {profileData.isVerified && (
                                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckBadgeIcon className="w-3.5 h-3.5" /> Verified
                                </span>
                            )}
                        </div>
                        {guideData?.motto && (
                            <p className="text-primary-600 font-semibold text-lg italic">"{guideData.motto}"</p>
                        )}
                        <p className="text-slate-500 font-medium flex items-center gap-2">
                            <GlobeAmericasIcon className="w-4 h-4" /> {profileData.location} • Joined {profileData.joined}
                        </p>
                    </>
                )}
                
                {/* Guide Motto - Edit Mode */}
                {isEditing && guideData && (
                    <div className="mt-3 max-w-sm">
                        <InputField 
                            label="Guide Motto/Headline" 
                            value={guideData.motto || ''} 
                            onChange={(e) => handleGuideChange('motto', e.target.value)}
                            placeholder="e.g. History buff showing you the real Istanbul!"
                        />
                    </div>
                )}
            </div>
          </div>
          
      {showMap && (
        <LocationPicker 
            initialLocation={profileData.location}
            onClose={() => setShowMap(false)}
            onLocationSelect={(loc) => handleChange('location', loc)}
        />
      )}

          {isOwnProfile && !isEditing && (
             <Button 
               variant="outline" 
               onClick={() => setIsEditing(true)} 
               className="z-20 shrink-0 ml-auto md:ml-0"
             >
                <PencilSquareIcon className="w-4 h-4 mr-2" />
                Edit Profile
             </Button>
          )}

          {/* Just for visuals */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-100/50 to-transparent rounded-bl-full pointer-events-none z-0"></div>
      </div>

      <form onSubmit={handleSave} className={guideData && isEditing ? "flex flex-col md:flex-row gap-8" : "grid md:grid-cols-3 gap-8"}>
          {/* Sidebar - Only for Student Guides in Edit Mode */}
          {guideData && isEditing && (
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
                
                {/* Save Button - Sticky */}
                <div className="sticky top-24 mt-auto">
                  <Button type="submit" isLoading={isUploading} className="w-full">
                    Save Changes
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsEditing(false)}
                    className="w-full mt-2"
                  >
                    Cancel
                  </Button>
                </div>
              </aside>
          )}
          
          {/* Main Content */}
          <div className={guideData && isEditing ? "flex-1 min-w-0" : "md:col-span-2 space-y-8"}>
              {/* For Guide in Edit Mode - Show Tab Content */}
              {guideData && isEditing ? (
                  <div className="space-y-6">
                      {/* TAB: PROFILE INFO */}
                      {activeTab === 'info' && (
                          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              {/* Profile Picture Section */}
                              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                  <h2 className="text-lg font-bold text-slate-900 mb-4">Guide Motto/Headline</h2>
                                  <InputField 
                                      label="" 
                                      value={guideData.motto || ''} 
                                      onChange={(e) => handleGuideChange('motto', e.target.value)}
                                      placeholder="e.g. History buff showing you the real Istanbul!"
                                  />
                                  <p className="text-xs text-slate-500 mt-1">A short phrase that appears under your name.</p>
                              </section>

                              {/* Academic Information */}
                              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                  <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                      <AcademicCapIcon className="w-5 h-5 text-indigo-500" /> Academic Information
                                  </h2>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="md:col-span-2">
                                          <label className="text-sm font-bold text-slate-700 block mb-1">University</label>
                                          <select 
                                              value={guideData.university} 
                                              onChange={(e) => handleGuideChange('university', e.target.value)}
                                              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                                          >
                                              {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                                          </select>
                                      </div>
                                      <div>
                                          <label className="text-sm font-bold text-slate-700 block mb-1">Department / Major</label>
                                          <input 
                                              type="text"
                                              value={guideData.major}
                                              onChange={(e) => handleGuideChange('major', e.target.value)}
                                              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                                          />
                                      </div>
                                      <div className="md:col-span-2">
                                          <label className="text-sm font-bold text-slate-700 block mb-1">Hourly Rate ($)</label>
                                          <div className="relative max-w-xs">
                                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                              <input 
                                                  type="number" 
                                                  min="10"
                                                  value={guideData.hourlyRate}
                                                  onChange={(e) => handleGuideChange('hourlyRate', parseInt(e.target.value))}
                                                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                              />
                                          </div>
                                      </div>
                                  </div>
                              </section>

                              {/* Languages */}
                              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                  <h2 className="text-lg font-bold text-slate-900 mb-4">Languages Spoken</h2>
                                  <div className="flex flex-wrap gap-2">
                                      {SUPPORTED_LANGUAGES.map(lang => {
                                          const displayLanguages = guideData.languages || [];
                                          const isSelected = displayLanguages.includes(lang);
                                          return (
                                              <button
                                                  key={lang}
                                                  type="button"
                                                  onClick={() => toggleLanguage(lang)}
                                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                                                      isSelected
                                                      ? 'bg-indigo-600 text-white border-indigo-600' 
                                                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                  }`}
                                              >
                                                  {lang}
                                              </button>
                                          );
                                      })}
                                  </div>
                              </section>

                              {/* Interests & Tags */}
                              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                  <h2 className="text-lg font-bold text-slate-900 mb-4">Interests & Tags</h2>
                                  <div className="flex flex-wrap gap-2">
                                      {INTEREST_TAGS.map(tag => {
                                          const displayInterests = guideData.tags || [];
                                          const isSelected = displayInterests.includes(tag);
                                          return (
                                              <button
                                                  key={tag}
                                                  type="button"
                                                  onClick={() => toggleInterest(tag)}
                                                  className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors border ${
                                                      isSelected 
                                                      ? 'bg-slate-900 text-white border-slate-900' 
                                                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                  }`}
                                              >
                                                  {tag}
                                              </button>
                                          );
                                      })}
                                  </div>
                              </section>

                              {/* About Me Bio */}
                              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                  <div className="flex justify-between items-center mb-4">
                                      <h2 className="text-lg font-bold text-slate-900">About Me</h2>
                                      <span className={`text-xs font-bold px-2 py-1 rounded ${guideData.bio.length >= 150 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                          {guideData.bio.length} / 150 chars
                                      </span>
                                  </div>
                                  <textarea
                                      rows={6}
                                      value={guideData.bio}
                                      onChange={(e) => handleGuideChange('bio', e.target.value)}
                                      className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none resize-none leading-relaxed"
                                      placeholder="Tell travelers about yourself as a guide..."
                                  />
                              </section>
                          </div>
                      )}

                      {/* TAB: AVAILABILITY */}
                      {activeTab === 'availability' && (
                          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                  <div className="mb-6">
                                      <h2 className="text-lg font-bold text-slate-900">Weekly Schedule</h2>
                                      <p className="text-slate-500 text-sm">Set your standard availability.</p>
                                  </div>
                                  
                                  <div className="space-y-4">
                                      {Object.entries(guideData.availability || {}).map(([day, { active, start, end }]: [string, any]) => (
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
                              </section>
                          </div>
                      )}

                      {/* TAB: GALLERY */}
                      {activeTab === 'gallery' && (
                          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                  <div className="flex justify-between items-start mb-6">
                                      <div>
                                          <h2 className="text-lg font-bold text-slate-900">My City Gallery</h2>
                                          <p className="text-slate-500 text-sm">Upload photos of yourself exploring the city.</p>
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
                                              type="button"
                                              variant="secondary" 
                                              onClick={() => document.getElementById('g-upload')?.click()}
                                              isLoading={isUploadingGallery}
                                          >
                                              <PlusIcon className="w-4 h-4 mr-1" /> Add Photo
                                          </Button>
                                      </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                      {guideData.gallery && guideData.gallery.map((src: string, idx: number) => (
                                          <div key={idx} className="relative group aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                                              <img src={getImageUrl(src)} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                  <button 
                                                      type="button"
                                                      onClick={() => removeGalleryPhoto(idx)}
                                                      className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                                                  >
                                                      <TrashIcon className="w-5 h-5" />
                                                  </button>
                                              </div>
                                          </div>
                                      ))}
                                      {Array.from({ length: Math.max(0, 6 - (guideData.gallery?.length || 0)) }).map((_, idx) => (
                                          <div key={`empty-${idx}`} className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 aspect-[4/3] hover:bg-slate-50 transition-colors">
                                              <PhotoIcon className="w-8 h-8 mb-2 opacity-50" />
                                              <span className="text-xs font-bold">Empty Slot</span>
                                          </div>
                                      ))}
                                  </div>
                              </section>
                          </div>
                      )}
                  </div>
              ) : (
                  /* Show all sections if not editing or not a guide */
                  <div className="space-y-8">
                      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-slate-900">About Me</h2>
                      {isEditing && (
                          <span className={`text-xs font-bold px-2 py-1 rounded ${profileData.bio.length >= 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                              {profileData.bio.length} chars
                          </span>
                      )}
                  </div>
                  
                  {isEditing ? (
                      <div className="space-y-2">
                          <textarea 
                            className="w-full p-4 border border-slate-300 rounded-xl text-slate-900 min-h-[150px] focus:ring-2 focus:ring-primary-500 outline-none resize-none leading-relaxed"
                            value={guideData ? guideData.bio : profileData.bio}
                            onChange={(e) => guideData ? handleGuideChange('bio', e.target.value) : handleChange('bio', e.target.value)}
                            placeholder={guideData ? "Tell travelers about yourself as a guide..." : "Tell guides a bit about yourself..."}
                          />
                          <p className="text-xs text-slate-500">
                              {guideData ? "Writing a good bio helps travelers understand your expertise." : "Writing a good bio helps guides tailor the experience for you."}
                          </p>
                      </div>
                  ) : (
                      <p className="text-slate-600 leading-relaxed text-lg">
                          {guideData?.bio || profileData.bio || 'No bio yet.'}
                      </p>
                  )}
              </section>

              {/* Student Guide Academic Information */}
              {guideData && (
                  <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <AcademicCapIcon className="w-6 h-6 text-indigo-500" /> Academic Information
                      </h2>
                      {isEditing ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                  <label className="text-sm font-bold text-slate-700 block mb-1">University</label>
                                  <select 
                                      value={guideData.university} 
                                      onChange={(e) => handleGuideChange('university', e.target.value)}
                                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                                  >
                                      {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="text-sm font-bold text-slate-700 block mb-1">Department / Major</label>
                                  <input 
                                      type="text"
                                      value={guideData.major}
                                      onChange={(e) => handleGuideChange('major', e.target.value)}
                                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                                  />
                              </div>
                              <div>
                                  <label className="text-sm font-bold text-slate-700 block mb-1">Graduation Year</label>
                                  <select 
                                      value={guideData.graduationYear}
                                      onChange={(e) => handleGuideChange('graduationYear', parseInt(e.target.value))}
                                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                                  >
                                      {GRADUATION_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                  </select>
                              </div>
                              <div className="md:col-span-2">
                                  <label className="text-sm font-bold text-slate-700 block mb-1">Hourly Rate ($)</label>
                                  <div className="relative max-w-xs">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                      <input 
                                          type="number" 
                                          min="10"
                                          value={guideData.hourlyRate}
                                          onChange={(e) => handleGuideChange('hourlyRate', parseInt(e.target.value))}
                                          className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                      />
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {guideData.university && (
                                  <div>
                                      <p className="text-sm font-bold text-slate-500 mb-1">University</p>
                                      <p className="text-slate-900 font-semibold">{guideData.university}</p>
                                  </div>
                              )}
                              {guideData.major && (
                                  <div>
                                      <p className="text-sm font-bold text-slate-500 mb-1">Major</p>
                                      <p className="text-slate-900 font-semibold">{guideData.major}</p>
                                  </div>
                              )}
                              {guideData.hourlyRate > 0 && (
                                  <div>
                                      <p className="text-sm font-bold text-slate-500 mb-1">Hourly Rate</p>
                                      <p className="text-slate-900 font-semibold text-xl">${guideData.hourlyRate}/hr</p>
                                  </div>
                              )}
                          </div>
                      )}
                  </section>
              )}

              {/* Student Guide Gallery */}
              {guideData && (
                  <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                              <PhotoIcon className="w-6 h-6 text-amber-500" /> My City Gallery
                          </h2>
                          {isEditing && (
                              <div>
                                  <input 
                                      type="file" 
                                      id="gallery-upload" 
                                      multiple 
                                      accept="image/*" 
                                      className="hidden" 
                                      onChange={handleGalleryUpload} 
                                  />
                                  <Button 
                                      type="button"
                                      variant="secondary" 
                                      size="sm"
                                      onClick={() => document.getElementById('gallery-upload')?.click()}
                                      isLoading={isUploadingGallery}
                                  >
                                      <PlusIcon className="w-4 h-4 mr-1" /> Add Photo
                                  </Button>
                              </div>
                          )}
                      </div>
                      {guideData.gallery && guideData.gallery.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {guideData.gallery.map((src: string, idx: number) => (
                                  <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 group">
                                      <img src={getImageUrl(src)} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                                      {isEditing && (
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                              <button 
                                                type="button"
                                                onClick={() => removeGalleryPhoto(idx)}
                                                className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                                              >
                                                  <TrashIcon className="w-5 h-5" />
                                              </button>
                                          </div>
                                      )}
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <p className="text-slate-400 text-center py-8 italic">No gallery photos yet.</p>
                      )}
                  </section>
              )}

              {/* Availability Section - Only for guides */}
              {guideData && (
                  <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="mb-4">
                          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                              <ClockIcon className="w-6 h-6 text-primary-600" /> Weekly Availability
                          </h2>
                          <p className="text-slate-500 text-sm mt-1">
                              {isEditing ? "Set your standard availability schedule." : "When this guide is typically available."}
                          </p>
                      </div>
                      
                      <div className="space-y-3">
                          {Object.entries(guideData.availability || {}).map(([day, { active, start, end }]: [string, any]) => (
                              <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                                  <div className="flex items-center gap-3 w-32">
                                      {isEditing ? (
                                          <label className="relative inline-flex items-center cursor-pointer">
                                              <input 
                                                  type="checkbox" 
                                                  checked={active} 
                                                  onChange={() => toggleDay(day)} 
                                                  className="sr-only peer" 
                                              />
                                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                          </label>
                                      ) : (
                                          <div className={`w-3 h-3 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                      )}
                                      <span className="font-bold text-slate-700 capitalize">{day}</span>
                                  </div>
                                  
                                  {active ? (
                                      isEditing ? (
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
                                          <div className="flex-1 text-slate-700 font-medium">
                                              {start} - {end}
                                          </div>
                                      )
                                  ) : (
                                      <div className="flex-1 text-slate-400 text-sm italic">Unavailable</div>
                                  )}
                              </div>
                          ))}
                      </div>
                  </section>
              )}

              {/* Interests Section (Visible here on mobile, or generally nice to have) */}
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                   <h3 className="font-bold text-slate-900 flex items-center gap-2">
                       <SparklesIcon className="w-5 h-5 text-amber-500" /> Interests & Preferences
                   </h3>
                   <p className="text-sm text-slate-500 mb-2">
                       {isEditing ? "Select what you love to do on your trips." : `What ${profileData.name.split(' ')[0]} loves to do.`}
                   </p>
                   
                   <div className="flex flex-wrap gap-2">
                       {INTEREST_TAGS.map(tag => {
                           const displayInterests = guideData?.tags && guideData.tags.length > 0 ? guideData.tags : profileData.interests;
                           const isSelected = displayInterests?.includes(tag);
                           if (!isEditing && !isSelected) return null; // Only show selected in view mode

                           return (
                               <button
                                   key={tag}
                                   type="button"
                                   disabled={!isEditing}
                                   onClick={() => toggleInterest(tag)}
                                   className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors border ${
                                       isSelected 
                                       ? 'bg-slate-900 text-white border-slate-900' 
                                       : isEditing 
                                            ? 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                            : 'bg-slate-50 text-slate-500 border-slate-200 opacity-80' // View mode unselected (hidden by logic above anyway)
                                   }`}
                               >
                                   {tag}
                               </button>
                           )
                       })}
                       {!isEditing && (!profileData.interests || profileData.interests.length === 0) && (!guideData?.tags || guideData.tags.length === 0) && (
                           <span className="text-slate-400 italic text-sm">No interests listed yet.</span>
                       )}
                   </div>
              </div>

              {isEditing && (
                  <div className="flex gap-4 pt-4 border-t border-slate-200">
                      <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                      <Button type="submit" variant="primary">Save Changes</Button>
                  </div>
              )}
                  </div>
              )}
          </div>

          {/* Sidebar - Only shown when not in guide edit mode */}
          {(!guideData || !isEditing) && (
          <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                   <h3 className="font-bold text-slate-900 flex items-center gap-2">
                       <ChatBubbleLeftRightIcon className="w-5 h-5 text-slate-400" /> Languages
                   </h3>
                   {isEditing ? (
                       <div className="space-y-3">
                           <div className="flex flex-wrap gap-2">
                               {SUPPORTED_LANGUAGES.map(lang => {
                                   const displayLanguages = guideData?.languages && guideData.languages.length > 0 ? guideData.languages : profileData.languages;
                                   const isSelected = displayLanguages.includes(lang);
                                   return (
                                       <button
                                          key={lang}
                                          type="button"
                                          onClick={() => toggleLanguage(lang)}
                                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors border ${
                                              isSelected
                                              ? 'bg-indigo-600 text-white border-indigo-600' 
                                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                          }`}
                                      >
                                          {lang}
                                      </button>
                                   );
                               })}
                           </div>
                       </div>
                   ) : (
                       <div className="flex flex-wrap gap-2">
                           {(guideData?.languages && guideData.languages.length > 0 ? guideData.languages : profileData.languages).map((lang: string) => (
                               <span key={lang} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                                   {lang}
                               </span>
                           ))}
                       </div>
                   )}
              </div>
              
              <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100">
                   <h3 className="font-bold text-primary-900 mb-4">Verified Information</h3>
                   <ul className="space-y-3">
                       <li className="flex items-center gap-3 text-sm text-primary-800">
                           <CheckBadgeIcon className="w-5 h-5 text-primary-600" /> 
                           {profileData.email}
                       </li>
                       <li className="flex items-center gap-3 text-sm text-primary-800">
                           <CheckBadgeIcon className="w-5 h-5 text-primary-600" /> 
                           {profileData.phone}
                       </li>
                   </ul>
              </div>
          </div>
          )}
      </form>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${
        active
          ? 'bg-slate-900 text-white shadow-md'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <span className={active ? 'text-primary-300' : 'text-slate-400'}>{icon}</span>
      {label}
    </button>
  );
}
