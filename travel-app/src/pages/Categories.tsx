import { categories } from '../utils/mockData.ts'

export default function CategoriesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-primary-600">Themes</p>
          <h1 className="text-2xl font-bold text-slate-900">Explore curated categories</h1>
        </div>
        <span className="pill bg-slate-100 text-slate-600">{categories.length} categories</span>
      </div>

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {categories.map((category) => (
          <div key={category.id} className="mb-4 break-inside-avoid">
            <div className="card-surface overflow-hidden shadow-soft">
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-sm text-white/80">{category.description}</p>
                  <p className="text-xl font-semibold">{category.name}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
