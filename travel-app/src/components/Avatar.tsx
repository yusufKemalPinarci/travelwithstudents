import { CheckCircleIcon } from '@heroicons/react/24/solid';

type AvatarProps = {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  verified?: boolean;
  className?: string; // Add className prop
}

export default function Avatar({ name, size = 'md', verified = false, className = '' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-full w-full text-2xl' // Add fully responsive or larger size
  }

  return (
    <div className={`relative ${size === 'xl' ? 'w-full h-full' : 'inline-block'} ${className}`}> 
      <div className={`flex items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold ${sizeClasses[size]}`}>
        {initials}
      </div>
      {verified && (
        <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-[1px]">
          <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
        </div>
      )}
    </div>
  )
}
