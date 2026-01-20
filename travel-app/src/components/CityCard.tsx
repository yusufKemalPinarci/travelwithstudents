import { Link } from 'react-router-dom'
import type { City } from '../types.ts'

type CityCardProps = {
  city: City
}

export default function CityCard({ city }: CityCardProps) {
  return (
    <Link to={`/search?city=${city.name}`} className="card-surface block overflow-hidden hover:-translate-y-1 transition shadow-soft">
      <div className="relative h-32 w-full overflow-hidden">
        <img src={city.image} alt={city.name} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-3 bottom-3 text-white">
          <p className="font-semibold">{city.name}</p>
          <p className="text-sm text-white/80">{city.country}</p>
        </div>
      </div>
    </Link>
  )
}
