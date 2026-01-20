import { MapIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button.tsx'
import { useAuth } from '../context/AuthContext.tsx';

export default function NotFoundPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isGuide = user?.role === 'Student Guide';

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center min-h-[60vh]">
      <div className="h-32 w-32 rounded-full bg-primary-50 text-primary-200 flex items-center justify-center relative overflow-hidden">
        <MapIcon className="w-20 h-20" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary-100 to-transparent"></div>
      </div>
      <div>
        <h1 className="text-4xl font-black text-slate-900 mb-2">Whoops!</h1>
        <p className="text-xl text-slate-600 font-medium">We can't seem to find the page you're looking for.</p>
        <p className="text-slate-500 mt-2">The guide might have wandered off the map.</p>
      </div>
      <div className="flex gap-4">
          <Button as={Link} to={isGuide ? "/guide" : "/"} variant="primary">
            {isGuide ? "Go to Dashboard" : "Go Home"}
          </Button>
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
      </div>
    </div>
  )
}
