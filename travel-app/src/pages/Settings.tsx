import { useState, useEffect } from 'react';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import { 
  ShieldCheckIcon, 
  CameraIcon, 
  EnvelopeIcon, 
  Cog6ToothIcon, 
  BellIcon, 
  LockClosedIcon, 
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../api/auth';

export default function Settings() {
  const { user, setUser } = useAuth();
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    marketing: false
  });
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('usd');
  const [showOnlineStatus, setShowOnlineStatus] = useState(user?.showOnlineStatus ?? true);
  const [isOnline, setIsOnline] = useState(user?.isOnline ?? true);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'NOT_SPECIFIED'>(user?.gender || 'NOT_SPECIFIED');

  useEffect(() => {
    setShowOnlineStatus(user?.showOnlineStatus ?? true);
    setIsOnline(user?.isOnline ?? true);
    setGender(user?.gender || 'NOT_SPECIFIED');
  }, [user]);

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOnlineStatusSave = async () => {
    if (!user) return;
    
    try {
      const updated = await updateUserProfile(user.id, {
        isOnline,
        showOnlineStatus,
        gender
      });
      
      if (updated && setUser) {
        setUser({ ...user, isOnline: updated.isOnline, showOnlineStatus: updated.showOnlineStatus, gender: updated.gender });
      }
      
      // Toast notification
      const toast = document.createElement('div');
      toast.className = "fixed bottom-10 right-10 bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3";
      toast.innerHTML = `
          <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <div>
              <p class="font-bold text-sm">Status Updated</p>
              <p class="text-xs text-slate-300">Your online status preferences have been saved.</p>
          </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => {
          toast.style.opacity = "0";
          setTimeout(() => toast.remove(), 300);
      }, 3000);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleGeneralSettingsSave = () => {
    // Save language, currency, and gender preferences
    localStorage.setItem('appLanguage', language);
    localStorage.setItem('currency', currency);
    
    // Show success toast
    const toast = document.createElement('div');
    toast.className = "fixed bottom-10 right-10 bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3";
    toast.innerHTML = `
        <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <div>
            <p class="font-bold text-sm">Settings Saved</p>
            <p class="text-xs text-slate-300">Your preferences have been updated successfully.</p>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-900 dark:text-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">App Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 text-base mt-2">Manage your application preferences and security.</p>
      </div>

      <div className="space-y-10">
        
        {/* Profile Card */}
        <section className="card-surface p-4 md:p-6 flex flex-col md:flex-row items-center gap-6">
             <div className="relative group cursor-pointer">
                 <div className="w-20 h-20 rounded-full border-4 border-slate-200 dark:border-slate-700 overflow-hidden">
                     <Avatar name={user?.name || "User"} size="xl" verified={user?.isEmailVerified} gender={user?.gender} />
                 </div>
                 <div className="absolute inset-0 bg-slate-900/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <CameraIcon className="w-6 h-6 text-white" />
                 </div>
                 <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
             </div>
             <div className="text-center md:text-left">
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name || "Guest User"}</h2>
                 <p className="text-slate-500 dark:text-slate-400">{user?.email || "guest@example.com"}</p>
                 <Button variant="ghost" size="sm" className="mt-2 text-primary-600 dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800">Change Profile Photo</Button>
             </div>
        </section>

        {/* Contact Information */}
        <section className="card-surface overflow-hidden">
             <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                 <h2 className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                     <EnvelopeIcon className="w-5 h-5 text-slate-500" /> Contact Information
                 </h2>
             </div>
             <div className="p-4 md:p-6 grid gap-6 max-w-2xl">
                {/* Email Field */}
                <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 mb-2">Email Address</label>
                    <div className="relative">
                        <input 
                            type="email" 
                            defaultValue={user?.email || "alex@example.com"}
                            readOnly={user?.role === 'Student Guide'}
                            className={`w-full px-4 py-2 border rounded-lg text-sm transition-colors ${
                                user?.role === 'Student Guide' 
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed' 
                                : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500'
                            }`}
                        />
                         {user?.role === 'Student Guide' && (
                             <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                 <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                                 <span>Verified student email cannot be changed here.</span>
                             </div>
                         )}
                    </div>
                </div>

                {/* Phone Field */}
                <div>
                     <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 mb-2">Phone Number</label>
                     <div className="flex gap-3">
                         <input 
                            type="tel" 
                            defaultValue="+1 (555) 123-4567" 
                            placeholder="+1 (555) 000-0000"
                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                         />
                     </div>
                </div>
                
                <div className="pt-2">
                    <Button onClick={() => {
                        // Toast alert
                        const toast = document.createElement('div');
                        toast.className = "fixed bottom-10 right-10 bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-bounce-in";
                        toast.innerHTML = `
                            <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                                <p class="font-bold text-sm">Contact Updated</p>
                                <p class="text-xs text-slate-300">Please go to Trust & Verification to re-verify if needed.</p>
                            </div>
                        `;
                        document.body.appendChild(toast);
                        
                        // Add fade out animation css inline if needed or rely on tailwind
                        toast.style.animation = "slideIn 0.3s ease-out";
                        
                        setTimeout(() => {
                            toast.style.opacity = "0";
                            setTimeout(() => toast.remove(), 300);
                        }, 4000);
                    }}>
                        Save Changes
                    </Button>
                </div>
             </div>
        </section>
        
        {/* General Settings */}
        <section className="card-surface overflow-hidden">
             <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                 <h2 className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                     <Cog6ToothIcon className="w-5 h-5 text-slate-500" /> General
                 </h2>
             </div>
             <div className="p-4 md:p-6 space-y-6">
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                     <div>
                         <p className="font-bold text-slate-900 dark:text-white">App Language</p>
                         <p className="text-sm text-slate-500 dark:text-slate-400">Select your preferred interface language.</p>
                     </div>
                     <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                     >
                         <option>English</option>
                         <option>Spanish</option>
                         <option>Dutch</option>
                         <option>French</option>
                         <option>German</option>
                     </select>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                     <div>
                         <p className="font-bold text-slate-900 dark:text-white">Gender</p>
                         <p className="text-sm text-slate-500 dark:text-slate-400">Used for default profile avatar if no photo is uploaded.</p>
                     </div>
                     <select 
                        value={gender}
                        onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE' | 'NOT_SPECIFIED')}
                        className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                     >
                         <option value="NOT_SPECIFIED">Prefer not to say</option>
                         <option value="MALE">Male</option>
                         <option value="FEMALE">Female</option>
                     </select>
                 </div>

                 <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                     <div>
                         <p className="font-bold text-slate-900 dark:text-white">Currency</p>
                         <p className="text-sm text-slate-500 dark:text-slate-400">Choose how prices are displayed (USD, EUR, etc.).</p>
                     </div>
                     <select 
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                     >
                         <option value="usd">USD ($)</option>
                         <option value="eur">EUR (€)</option>
                         <option value="gbp">GBP (£)</option>
                         <option value="jpy">JPY (¥)</option>
                     </select>
                 </div>
                 
                 <div className="pt-4">
                    <Button onClick={handleGeneralSettingsSave}>
                        Save General Settings
                    </Button>
                 </div>
             </div>
        </section>

        {/* Notification Settings */}
        <section className="card-surface overflow-hidden">
             <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                 <h2 className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                     <BellIcon className="w-5 h-5 text-slate-500" /> Notifications
                 </h2>
             </div>
             <div className="p-4 md:p-6 space-y-6">
                 {/* Online Status Visibility */}
                 <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                     <div className="flex-1">
                         <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           {showOnlineStatus ? <EyeIcon className="w-4 h-4 text-emerald-500" /> : <EyeSlashIcon className="w-4 h-4 text-slate-400" />}
                           Show Online Status
                         </p>
                         <p className="text-sm text-slate-500 dark:text-slate-400">Let others see when you're online and available.</p>
                     </div>
                     <ToggleSwitch checked={showOnlineStatus} onChange={() => setShowOnlineStatus(!showOnlineStatus)} />
                 </div>

                 {/* Current Status */}
                 {showOnlineStatus && (
                   <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                       <div>
                           <p className="font-bold text-slate-900 dark:text-white">Set as Online</p>
                           <p className="text-sm text-slate-500 dark:text-slate-400">Mark yourself as available to receive bookings.</p>
                       </div>
                       <ToggleSwitch checked={isOnline} onChange={() => setIsOnline(!isOnline)} />
                   </div>
                 )}

                 <div className="pt-2">
                    <Button onClick={handleOnlineStatusSave}>
                        Save Status Preferences
                    </Button>
                 </div>

                 {/* Push Notifications */}
                 <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                     <div>
                         <p className="font-bold text-slate-900 dark:text-white">Push Notifications</p>
                         <p className="text-sm text-slate-500 dark:text-slate-400">Receive alerts on your device for new bookings.</p>
                     </div>
                     <ToggleSwitch checked={notifications.push} onChange={() => handleToggle('push')} />
                 </div>
                 
                 {/* Email Notifications */}
                 <div className="flex items-center justify-between">
                     <div>
                         <p className="font-bold text-slate-900 dark:text-white">Email Notifications</p>
                         <p className="text-sm text-slate-500 dark:text-slate-400">Get booking confirmations and summaries.</p>
                     </div>
                     <ToggleSwitch checked={notifications.email} onChange={() => handleToggle('email')} />
                 </div>

                 {/* SMS Notifications */}
                 <div className="flex items-center justify-between">
                     <div>
                         <p className="font-bold text-slate-900 dark:text-white">SMS Notifications</p>
                         <p className="text-sm text-slate-500 dark:text-slate-400">Receive text messages for urgent updates.</p>
                     </div>
                     <ToggleSwitch checked={notifications.sms} onChange={() => handleToggle('sms')} />
                 </div>
                 
                  {/* Marketing */}
                 <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                     <div>
                         <p className="font-bold text-slate-700 dark:text-slate-300">Marketing & Tips</p>
                         <p className="text-sm text-slate-500 dark:text-slate-400">Receive tips to improve your tours and promo offers.</p>
                     </div>
                     <ToggleSwitch checked={notifications.marketing} onChange={() => handleToggle('marketing')} />
                 </div>
             </div>
        </section>

        {/* Security / Danger Zone */}
        <section className="card-surface overflow-hidden">
             <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                 <h2 className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                     <LockClosedIcon className="w-5 h-5 text-slate-500" /> Security
                 </h2>
             </div>
             <div className="p-4 md:p-6 space-y-6">
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                     <div>
                         <p className="font-bold text-slate-900 dark:text-white">Change Password</p>
                         <p className="text-sm text-slate-500 dark:text-slate-400">Update your account password regularly.</p>
                     </div>
                     <Button variant="secondary" size="sm">Update Password</Button>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                     <div>
                         <p className="font-bold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</p>
                         <p className="text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security to your account.</p>
                     </div>
                     <Button variant="secondary" size="sm">Enable 2FA</Button>
                 </div>

                 <div className="pt-8 mt-4 border-t border-slate-100 dark:border-slate-700">
                     <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900 rounded-xl p-5">
                         <h3 className="font-bold text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-2">
                             <ExclamationTriangleIcon className="w-5 h-5" /> Danger Zone
                         </h3>
                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                             <p className="text-sm text-rose-800/80 dark:text-rose-300">
                                 Deactivating your account will hide your profile and cancel all pending bookings. 
                                 Deleting your account is permanent.
                             </p>
                             <div className="flex gap-3 shrink-0">
                                 <Button variant="ghost" className="text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30">Deactivate</Button>
                                 <button className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">
                                     Delete Account
                                 </button>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
        </section>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button 
            role="switch" 
            aria-checked={checked}
            onClick={onChange}
            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                ${checked ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}
            `}
        >
            <span
                className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${checked ? 'translate-x-6' : 'translate-x-1'}
                `}
            />
        </button>
    )
}
