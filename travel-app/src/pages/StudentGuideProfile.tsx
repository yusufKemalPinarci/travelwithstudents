import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    CheckBadgeIcon, 
    DevicePhoneMobileIcon,
    AcademicCapIcon,
    MapPinIcon
} from '@heroicons/react/24/solid';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../api/auth';
import { getGuideById } from '../api/guides';
import { getImageUrl } from '../utils/image';
import RatingStars from '../components/RatingStars';

export default function StudentGuideProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [guideProfile, setGuideProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      try {
        const userData = await getUserProfile(user.id);
        setProfile(userData);
        
        // Get guideProfile from user data
        if (userData?.guideProfile?.id) {
          const guideData = await getGuideById(userData.guideProfile.id);
          setGuideProfile(guideData);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!profile || !guideProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="card-surface p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar 
            src={profile.profileImage ? getImageUrl(profile.profileImage) : undefined}
            alt={profile.name}
            size="xl"
            gender={profile.gender}
            name={profile.name}
          />
          
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{profile.name}</h1>
              {guideProfile.isStudentVerified && (
                <CheckBadgeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            
            <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-600 dark:text-slate-300 mb-2">
              <AcademicCapIcon className="w-5 h-5" />
              <span>{guideProfile.university}</span>
            </div>
            
            <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-600 dark:text-slate-300 mb-4">
              <MapPinIcon className="w-5 h-5" />
              <span>{guideProfile.city}</span>
            </div>

            {guideProfile.reviews > 0 ? (
              <RatingStars rating={guideProfile.rating} count={guideProfile.reviews} />
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No reviews yet</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              as={Link} 
              to="/guide/edit-profile"
              variant="primary"
              size="md"
            >
              Edit Profile
            </Button>
            <Button 
              as={Link} 
              to={`/profile/${user?.id}`}
              target="_blank"
              variant="outline"
              size="md"
            >
              View Public Profile
            </Button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="card-surface p-6 mb-6">
        <h3 className="section-heading mb-4">About</h3>
        <p className="text-slate-600 dark:text-slate-300">
          {guideProfile.bio || "No bio provided."}
        </p>
        
        {/* Verification Badges */}
        <div className="flex flex-wrap gap-4 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
          {guideProfile.isPhoneVerified && (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-md">
              <DevicePhoneMobileIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" /> 
              Phone Verified
            </div>
          )}
          {guideProfile.isStudentVerified && (
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-md">
              <CheckBadgeIcon className="w-4 h-4" /> 
              Student Verified
            </div>
          )}
        </div>

        {/* Tags */}
        {guideProfile.tags && guideProfile.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {guideProfile.tags.map((tag: string) => (
              <span key={tag} className="pill bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card-surface p-6 text-center">
          <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
            ${guideProfile.price}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Per Hour</p>
        </div>
        
        <div className="card-surface p-6 text-center">
          <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
            {guideProfile.totalBookings || 0}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Tours Completed</p>
        </div>
        
        <div className="card-surface p-6 text-center">
          <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
            {guideProfile.reviews || 0}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Reviews</p>
        </div>
      </div>

      {/* Languages Section */}
      {guideProfile.languages && guideProfile.languages.length > 0 && (
        <div className="card-surface p-6 mb-6">
          <h3 className="section-heading mb-4">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {guideProfile.languages.map((lang: string) => (
              <span key={lang} className="pill bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
