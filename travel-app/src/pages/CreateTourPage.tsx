import { useState } from 'react'
import { PhotoIcon, CurrencyDollarIcon, MapPinIcon, ClockIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

const STEPS = [
    { id: 1, name: 'Basics' },
    { id: 2, name: 'Details' },
    { id: 3, name: 'Photos' },
    { id: 4, name: 'Pricing' },
    { id: 5, name: 'Review' }
]

export default function CreateTourPage() {
    const [step, setStep] = useState(1)
    
    // Form State
    const [formData, setFormData] = useState({
        title: '',
        category: 'Walking',
        location: '',
        duration: 2,
        language: 'English',
        description: '',
        price: 0,
        photos: [] as string[]
    })

    const handleNext = () => setStep(prev => Math.min(prev + 1, 5))
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1))

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div>
                 <h1 className="text-2xl font-bold text-slate-900">Create a New Tour</h1>
                 <p className="text-slate-500">Share your local knowledge with the world.</p>
            </div>

            {/* Progress Bar */}
            <div className="card-surface p-4">
                 <div className="flex items-center justify-between relative px-2">
                     <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-0"></div>
                     <div 
                        className="absolute top-1/2 left-0 h-0.5 bg-orange-500 -z-0 transition-all duration-300"
                        style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                     ></div>
                     
                     {STEPS.map((s) => {
                         const isActive = s.id <= step
                         const isCurrent = s.id === step
                         return (
                             <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                                     isActive ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-slate-300 text-slate-400'
                                 }`}>
                                     {s.id}
                                 </div>
                                 <span className={`text-xs font-medium whitespace-nowrap ${isCurrent ? 'text-orange-600' : 'text-slate-500'}`}>{s.name}</span>
                             </div>
                         )
                     })}
                 </div>
            </div>

            {/* Form Content */}
            <div className="card-surface p-8 min-h-[400px]">
                {step === 1 && (
                    <div className="space-y-6 fade-in">
                        <h2 className="text-xl font-bold">The Basics</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tour Title</label>
                                <input 
                                    type="text" 
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    placeholder="e.g. Hidden Gems of Gothic Quarter"
                                    className="w-full rounded-lg border-slate-300 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <select 
                                        className="w-full rounded-lg border-slate-300 focus:ring-orange-500 focus:border-orange-500"
                                        value={formData.category}
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                    >
                                        <option>Walking</option>
                                        <option>Food & Drink</option>
                                        <option>Nightlife</option>
                                        <option>History</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">City / Location</label>
                                    <div className="relative">
                                        <MapPinIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="text" 
                                            value={formData.location}
                                            onChange={e => setFormData({...formData, location: e.target.value})}
                                            className="w-full rounded-lg border-slate-300 pl-10 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 fade-in">
                        <h2 className="text-xl font-bold">Details</h2>
                         <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea 
                                    rows={5}
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    className="w-full rounded-lg border-slate-300 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="What will you do? Where will you go?"
                                />
                             </div>
                             <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Hours)</label>
                                    <div className="relative">
                                        <ClockIcon className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                                        <input 
                                            type="number" 
                                            value={formData.duration}
                                            onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                                            className="w-full rounded-lg border-slate-300 pl-10 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                                    <div className="relative">
                                        <GlobeAltIcon className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                                        <select 
                                            value={formData.language}
                                            onChange={e => setFormData({...formData, language: e.target.value})}
                                            className="w-full rounded-lg border-slate-300 pl-10 focus:ring-orange-500 focus:border-orange-500"
                                        >
                                            <option>English</option>
                                            <option>Spanish</option>
                                            <option>French</option>
                                            <option>German</option>
                                        </select>
                                    </div>
                                </div>
                             </div>
                         </div>
                    </div>
                )}
                
                {step === 3 && (
                     <div className="space-y-6 fade-in">
                        <h2 className="text-xl font-bold">Photos</h2>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                            <PhotoIcon className="w-12 h-12 mb-3 text-slate-400" />
                            <p className="font-medium">Drag and drop photos here</p>
                            <p className="text-sm">or click to browse</p>
                        </div>
                        <p className="text-xs text-slate-400">Upload at least 3 photos to showcase your experience.</p>
                     </div>
                )}

                {step === 4 && (
                     <div className="space-y-6 fade-in">
                        <h2 className="text-xl font-bold">Pricing</h2>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price per person</label>
                            <div className="relative max-w-xs">
                                <CurrencyDollarIcon className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                                <input 
                                    type="number" 
                                    value={formData.price}
                                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                                    className="w-full rounded-lg border-slate-300 pl-10 focus:ring-orange-500 focus:border-orange-500 text-lg font-bold"
                                />
                            </div>
                            <p className="text-sm text-slate-500 mt-2">Stitch fee: 10%</p>
                            <p className="text-sm font-bold text-emerald-600">You earn: ${(formData.price * 0.9).toFixed(2)}</p>
                        </div>
                     </div>
                )}

                {step === 5 && (
                    <div className="space-y-6 fade-in text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Ready to Publish?</h2>
                        <p className="text-slate-600 max-w-md mx-auto">
                            Your tour <strong>"{formData.title}"</strong> will be reviewed by our team. 
                        </p>
                        
                        <div className="bg-slate-50 p-4 rounded-lg text-left max-w-md mx-auto text-sm space-y-2 border border-slate-200">
                             <div className="flex justify-between">
                                 <span className="text-slate-500">Location:</span>
                                 <span className="font-medium">{formData.location}</span>
                             </div>
                             <div className="flex justify-between">
                                 <span className="text-slate-500">Duration:</span>
                                 <span className="font-medium">{formData.duration}h</span>
                             </div>
                             <div className="flex justify-between">
                                 <span className="text-slate-500">Price:</span>
                                 <span className="font-medium">${formData.price}</span>
                             </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                 <button 
                    onClick={handleBack}
                    disabled={step === 1}
                    className="px-6 py-2.5 font-semibold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 rounded-lg transition-colors"
                 >
                     Back
                 </button>
                 <button 
                    onClick={handleNext}
                    className="bg-orange-600 text-white px-8 py-2.5 rounded-lg font-bold shadow-sm hover:bg-orange-700 transition-colors"
                 >
                     {step === 5 ? 'Submit' : 'Next'}
                 </button>
            </div>
        </div>
    )
}
