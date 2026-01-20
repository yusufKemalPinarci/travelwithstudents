import { useNavigate } from 'react-router-dom'
import { HeartIcon, StarIcon, MapPinIcon } from '@heroicons/react/24/solid'
import { wishlist } from '../utils/mockData'

export default function WishlistPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">My Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <HeartIcon className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">Your wishlist is empty</h3>
          <p className="text-slate-500 mb-6">Explore the world and save your favorite experiences.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
          >
            Start Exploring
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div key={item.id} className="card-surface group cursor-pointer" onClick={() => navigate('/book')}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-white transition-colors shadow-sm">
                  <HeartIcon className="w-5 h-5" />
                </button>
                <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-xs font-bold text-slate-800 uppercase tracking-wide">
                  {item.tags?.[0] || 'Guide'}
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs font-medium text-slate-500">
                      <MapPinIcon className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {item.city}
                    </div>
                    <div className="flex items-center text-xs font-bold text-slate-700">
                        <StarIcon className="w-3.5 h-3.5 text-amber-400 mr-1" />
                        {item.rating} <span className="text-slate-400 font-normal ml-1">({item.reviews})</span>
                    </div>
                </div>

                <h3 className="font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">
                  {item.name}
                </h3>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                        From <span className="text-lg font-bold text-slate-900">${item.price}</span> / person
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
