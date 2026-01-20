import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { CheckBadgeIcon, ShieldCheckIcon, DevicePhoneMobileIcon, AcademicCapIcon, EnvelopeIcon } from '@heroicons/react/24/solid';

export default function VerificationPage() {
  const { user } = useAuth();
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
       {user?.role === 'Student Guide' ? <StudentVerification user={user} /> : <TravelerVerification user={user} />}
    </div>
  );
}

function StudentVerification({ user }: { user: any }) {
    
    return (
        <div className="space-y-6">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
                    <AcademicCapIcon className="w-10 h-10 text-blue-600" />
                    Student Verification Center
                </h1>
                <p className="text-slate-500 mt-2">Manage your verified credentials to maintain your guide status.</p>
            </div>

            {/* Section 1: University Email (Read Only) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                             <AcademicCapIcon className="w-5 h-5 text-slate-400" /> University Status
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Your enrollment is verified via your .edu email.</p>
                    </div>
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-full border border-emerald-100">
                        <CheckBadgeIcon className="w-4 h-4" /> Verified
                    </span>
                </div>
                
                <div className="relative">
                    <input 
                        type="text" 
                        value={user?.email || "student@university.edu"} 
                        readOnly 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 font-medium cursor-not-allowed"
                    />
                     <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
                     </div>
                </div>
            </div>

            {/* Section 2: Phone Verification */}
            <PhoneVerificationSection />
        </div>
    )
}

function TravelerVerification({ user }: { user: any }) {
    return (
       <div className="space-y-6">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
                    <ShieldCheckIcon className="w-10 h-10 text-blue-600" />
                    Trust & Safety
                </h1>
                <p className="text-slate-500 mt-2">Verify your contact details to build trust with guides.</p>
            </div>

           {/* Section 1: Email Verification */}
           <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                             <EnvelopeIcon className="w-5 h-5 text-slate-400" /> Email Address
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Used for booking confirmations and receipts.</p>
                    </div>
                     {!user?.isEmailVerified && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-sm font-bold rounded-full border border-amber-100">
                             Unverified
                        </span>
                     )}
                </div>
                
                <div className="flex gap-3">
                    <input 
                        type="text" 
                        value={user?.email || "traveler@example.com"} 
                        readOnly 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium"
                    />
                    {!user?.isEmailVerified && (
                        <Button variant="outline">Verify</Button>
                    )}
                </div>
            </div>

            {/* Section 2: Phone Verification */}
            <PhoneVerificationSection />
       </div>
    )
}

function PhoneVerificationSection() {
    const [phone, setPhone] = useState('');
    const [showOtp, setShowOtp] = useState(false);

    return (
         <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="mb-4">
                <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        <DevicePhoneMobileIcon className="w-5 h-5 text-slate-400" /> Phone Number
                </h2>
                <p className="text-sm text-slate-500 mt-1">Helps guides reach you during your trip. We'll send a code to verify.</p>
            </div>
            
            {!showOtp ? (
                <div className="flex gap-3">
                    <input 
                        type="tel" 
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    <Button onClick={() => setShowOtp(true)} disabled={!phone}>Send Code</Button>
                </div>
            ) : (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm font-medium text-slate-900">Enter the 6-digit code sent to {phone}</p>
                    <div className="flex gap-2">
                        {[1,2,3,4,5,6].map(i => (
                            <input 
                                key={i} 
                                type="text" 
                                maxLength={1}
                                className="w-12 h-12 text-center text-xl font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <button onClick={() => setShowOtp(false)} className="text-sm text-slate-500 hover:text-slate-900">Change number</button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 border-none">Verify</Button>
                    </div>
                </div>
            )}
        </div>
    )
}
