import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckBadgeIcon, GlobeAmericasIcon, ChatBubbleLeftRightIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/InputField';

// Mock Traveler Data (Fallback)
const mockTraveler = {
  id: 'u1',
  name: 'Alex Johnson',
  bio: 'Avid backpacker and food lover. Always looking for the best street food and hidden local spots. I speak English and basic Spanish.',
  location: 'New York, USA',
  languages: ['English', 'Spanish'],
  joined: 'March 2024',
  isVerified: true,
  email: 'alex@example.com',
  phone: '+1 (555) 0123-456'
};

export default function TravelerProfile() {
  const { id } = useParams();
  const { user: authUser } = useAuth();
  
  // Logic: If accessing my own profile or via direct /traveler/me link
  // Note: In a real app, you'd fetch the specific user by ID.
  // For this mock, if the ID matches authUser, we show authUser data (or mock of it).
  
  const isOwnProfile = authUser?.id === id || authUser?.id === mockTraveler.id;  // Simplified for demo

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(mockTraveler);

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      setIsEditing(false);
      // API Call to save profile would go here
  };

  const handleChange = (field: keyof typeof profileData, value: string | string[]) => {
      setProfileData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden">
          <div className="relative z-10">
             <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-100 flex items-center justify-center text-primary-700 text-3xl font-bold border-4 border-white shadow-md relative group cursor-pointer">
                <Avatar name={profileData.name} size="lg" verified={profileData.isVerified} />
                {isEditing && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PencilSquareIcon className="w-6 h-6 text-white" />
                    </div>
                )}
             </div>
          </div>
          
          <div className="flex-1 space-y-2 z-10 w-full">
              {isEditing ? (
                  <div className="space-y-3 max-w-sm">
                      <InputField 
                        label="Full Name" 
                        value={profileData.name} 
                        onChange={(e) => handleChange('name', e.target.value)} 
                      />
                      <InputField 
                        label="Location" 
                        value={profileData.location} 
                        onChange={(e) => handleChange('location', e.target.value)} 
                      />
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
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        <GlobeAmericasIcon className="w-4 h-4" /> {profileData.location} • Joined {profileData.joined}
                    </p>
                  </>
              )}
          </div>
          
          {isOwnProfile && !isEditing && (
             <Button variant="outline" onClick={() => setIsEditing(true)} className="z-10">
                Edit Profile
             </Button>
          )}

          {/* Just for visuals */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-100/50 to-transparent rounded-bl-full pointer-events-none"></div>
      </div>

      <form onSubmit={handleSave} className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
              <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">About Me</h2>
                  {isEditing ? (
                      <textarea 
                        className="w-full p-3 border border-slate-300 rounded-lg text-slate-700 min-h-[150px] focus:ring-2 focus:ring-primary-500 transition-all font-sans text-lg"
                        value={profileData.bio}
                        onChange={(e) => handleChange('bio', e.target.value)}
                      />
                  ) : (
                      <p className="text-slate-600 leading-relaxed text-lg">
                          {profileData.bio}
                      </p>
                  )}
              </section>

              {isEditing && (
                  <div className="flex gap-4">
                      <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                      <Button type="submit" variant="primary">Save Changes</Button>
                  </div>
              )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                   <h3 className="font-bold text-slate-900 flex items-center gap-2">
                       <ChatBubbleLeftRightIcon className="w-5 h-5 text-slate-400" /> Languages
                   </h3>
                   {isEditing ? (
                       <InputField 
                            label="Languages (comma separated)" 
                            value={profileData.languages.join(', ')} 
                            onChange={(e) => handleChange('languages', e.target.value.split(',').map(s => s.trim()))}
                       />
                   ) : (
                       <div className="flex flex-wrap gap-2">
                           {profileData.languages.map(lang => (
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
      </form>
    </div>
  );
}
