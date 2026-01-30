import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { getDefaultAvatar } from '../utils/image'

type AvatarProps = {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  verified?: boolean;
  className?: string;
  gender?: 'MALE' | 'FEMALE' | 'NOT_SPECIFIED';
}

export default function Avatar({ name, src, size = 'md', verified = false, className = '', gender }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const displayImage = src || getDefaultAvatar(name);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-20 w-20 text-xl',
    full: 'h-full w-full'
  }

  return (
    <div className={`relative inline-block ${className}`}> 
      <div className={`flex items-center justify-center rounded-full bg-slate-200 text-primary-700 font-bold overflow-hidden ${sizeClasses[size]}`}>
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={name} 
            className="w-full h-full object-cover" 
            onError={(e) => {
                (e.target as HTMLImageElement).src = getDefaultAvatar(name)
            }}
          />
        ) : (
          initials
        )}
      </div>
      {verified && (
        <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-[1px]">
          <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
        </div>
      )}
    </div>
  )
}
