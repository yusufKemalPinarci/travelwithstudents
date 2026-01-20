import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { ShieldExclamationIcon } from '@heroicons/react/24/solid';

interface ProfileCompletionWidgetProps {
  user?: {
    isPhoneVerified?: boolean;
    bio?: string;
  };
}

export default function ProfileCompletionWidget({ user }: ProfileCompletionWidgetProps) {
  const navigate = useNavigate();

  // Mock user check if not provided
  const isPhoneVerified = user?.isPhoneVerified ?? false;
  const hasBio = !!user?.bio;
  
  if (isPhoneVerified && hasBio) return null;

  const calculateStrength = () => {
    let score = 20; // Base score for account creation
    if (isPhoneVerified) score += 40;
    if (hasBio) score += 40;
    return score;
  };

  const strength = calculateStrength();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 mb-1">
                <ShieldExclamationIcon className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900">Complete your profile</h3>
            </div>
            <p className="text-sm text-slate-600">
                Verify your identity and tell us about yourself to build trust with the community.
            </p>
            
            <div className="flex items-center gap-3 mt-3 max-w-sm">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                            strength < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${strength}%` }}
                    ></div>
                </div>
                <span className="text-xs font-bold text-slate-700">{strength}% Strength</span>
            </div>
        </div>
        
        <Button 
            onClick={() => {
                navigate('/settings');
                // Optional: Scroll to verification section logic could go here
                setTimeout(() => {
                    document.getElementById('verification')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }}
            variant="primary"
        >
            Complete Verification
        </Button>
      </div>
    </div>
  );
}
