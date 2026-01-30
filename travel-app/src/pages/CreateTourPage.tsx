import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhotoIcon, CurrencyDollarIcon, MapPinIcon, ClockIcon, GlobeAltIcon, XMarkIcon } from '@heroicons/react/24/outline'
import LocationPicker from '../components/LocationPicker'
import { TOUR_CATEGORIES, LANGUAGES } from '../utils/constants'
import apiClient from '../api/client'

const STEPS = [
    { id: 1, name: 'Basics' },
    { id: 2, name: 'Details' },
    { id: 3, name: 'Photos' },
    { id: 4, name: 'Pricing' },
    { id: 5, name: 'Review' }
]

export default function CreateTourPage() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [showLocationPicker, setShowLocationPicker] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
    const [errors, setErrors] = useState<string[]>([])
    
    // Form State
    const [formData, setFormData] = useState({
        title: '',
        category: TOUR_CATEGORIES[0],
        location: '',
        duration: 2,
        language: LANGUAGES[0],
        description: '',
        price: 0,
        photos: [] as File[],
        tourDate: '',
        tourTime: '',
        maxParticipants: 10
    })
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
    const [showErrorModal, setShowErrorModal] = useState(false)

    const validateStep = (stepNumber: number): boolean => {
        const newErrors: string[] = []
        
        switch(stepNumber) {
            case 1: // Basics
                if (!formData.title.trim()) newErrors.push('Tour title is required')
                if (!formData.location.trim()) newErrors.push('Location is required')
                if (!formData.tourDate) newErrors.push('Tour date is required')
                if (!formData.tourTime) newErrors.push('Tour time is required')
                break
            case 2: // Details
                if (!formData.description.trim()) newErrors.push('Description is required')
                if (formData.duration < 1) newErrors.push('Duration must be at least 1 hour')
                if (formData.maxParticipants < 1) newErrors.push('Max participants must be at least 1')
                break
            case 3: // Photos
                if (formData.photos.length < 1) newErrors.push('At least 1 photo is required')
                break
            case 4: // Pricing
                if (formData.price <= 0) newErrors.push('Price must be greater than 0')
                break
        }
        
        setErrors(newErrors)
        return newErrors.length === 0
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            
            setFormData(prev => ({
                ...prev,
                photos: [...prev.photos, ...filesArray]
            }));
            setPhotoPreviews(prev => [...prev, ...newPreviews]);
            setErrors([]) // Clear errors when photos added
        }
    };

    const removePhoto = (index: number) => {
        // Revoke blob URL to prevent memory leak
        URL.revokeObjectURL(photoPreviews[index]);
        
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(prev => Math.min(prev + 1, 5))
            setErrors([])
            setShowErrorModal(false)
        } else {
            setShowErrorModal(true)
        }
    }
    
    const handleBack = () => {
        setStep(prev => Math.max(prev - 1, 1))
        setErrors([])
    }
    
    const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
        setSelectedLocation(location)
        setFormData(prev => ({ ...prev, location: location.address }))
        setShowLocationPicker(false)
    }
    
    const handleSubmit = async () => {
        // Validate all steps and collect errors
        const allErrors: string[] = []
        
        // Debug: Log current form data
        console.log('Form data at submit:', {
            title: formData.title,
            titleLength: formData.title?.length,
            titleTrimmed: formData.title?.trim(),
            location: formData.location,
            tourDate: formData.tourDate,
            tourTime: formData.tourTime,
            description: formData.description,
            price: formData.price,
            photos: formData.photos.length
        });
        
        // Check step 1
        if (!formData.title || !formData.title.trim()) allErrors.push('Tour title is required')
        if (!formData.location || !formData.location.trim()) allErrors.push('Location is required')
        if (!formData.tourDate) allErrors.push('Tour date is required')
        if (!formData.tourTime) allErrors.push('Tour time is required')
        
        // Check step 2
        if (!formData.description || !formData.description.trim()) allErrors.push('Description is required')
        if (formData.duration < 1) allErrors.push('Duration must be at least 1 hour')
        if (formData.maxParticipants < 1) allErrors.push('Max participants must be at least 1')
        
        // Check step 3
        if (formData.photos.length < 1) allErrors.push('At least 1 photo is required')
        
        // Check step 4
        if (formData.price <= 0) allErrors.push('Price must be greater than 0')

        console.log('Validation errors:', allErrors);

        if (allErrors.length > 0) {
            setErrors(allErrors)
            setShowErrorModal(true)
            return
        }
        
        try {
            // Create FormData for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title.trim());
            formDataToSend.append('category', formData.category);
            formDataToSend.append('location', formData.location.trim());
            formDataToSend.append('duration', formData.duration.toString());
            formDataToSend.append('language', formData.language);
            formDataToSend.append('description', formData.description.trim());
            formDataToSend.append('price', formData.price.toString());
            formDataToSend.append('tourDate', formData.tourDate);
            formDataToSend.append('tourTime', formData.tourTime);
            formDataToSend.append('maxParticipants', formData.maxParticipants.toString());
            
            // Append photo files
            formData.photos.forEach((file) => {
                formDataToSend.append('photos', file);
            });

            // Debug: Log form data
            console.log('Submitting tour with data:', {
                title: formData.title,
                price: formData.price,
                photos: formData.photos.length,
                tourDate: formData.tourDate,
                tourTime: formData.tourTime
            });

            const response = await apiClient.post('/tours', formDataToSend);

            // Show success toast
            const toast = document.createElement('div')
            toast.className = "fixed bottom-10 right-10 bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3"
            toast.innerHTML = `
                <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                    <p class="font-bold text-sm">Tour Submitted!</p>
                    <p class="text-xs text-slate-300">Your tour is under review. We'll notify you soon.</p>
                </div>
            `
            document.body.appendChild(toast)
            setTimeout(() => {
                toast.style.opacity = "0"
                setTimeout(() => toast.remove(), 300)
            }, 3000)
            
            // Navigate to guide dashboard after 1 second
            setTimeout(() => {
                navigate('/guide/dashboard')
            }, 1000)
        } catch (error: any) {
            console.error('Failed to submit tour:', error)
            
            // Show backend error in modal
            const errorMessage = error.response?.data?.message || 'Failed to create tour. Please try again.'
            setErrors([errorMessage])
            setShowErrorModal(true)
        }
    }

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

            {/* Error Modal */}
            {showErrorModal && errors.length > 0 && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6 animate-in zoom-in-95 duration-200">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Please Complete Required Fields</h2>
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 max-h-60 overflow-y-auto">
                                    <ul className="space-y-2 text-sm text-red-700 dark:text-red-300 text-left">
                                        {errors.map((error, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-red-500 mt-1 flex-shrink-0">•</span>
                                                <span className="flex-1">{error}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setShowErrorModal(false)
                                setErrors([])
                            }}
                            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-3.5 rounded-xl font-semibold hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}

            {/* Form Content */}
            <div className="card-surface p-8 min-h-[400px]">
                {step === 1 && (
                    <div className="space-y-6 fade-in">
                        <h2 className="text-xl font-bold">The Basics</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tour Title</label>
                                <input 
                                    type="text" 
                                    value={formData.title}
                                    onChange={e => setFormData(prev => ({...prev, title: e.target.value}))}
                                    placeholder="e.g. Hidden Gems of Gothic Quarter"
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-orange-500 focus:border-orange-500 px-4 py-2.5"
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                                    <select 
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-orange-500 focus:border-orange-500 px-4 py-2.5"
                                        value={formData.category}
                                        onChange={e => setFormData(prev => ({...prev, category: e.target.value}))}
                                    >
                                        {TOUR_CATEGORIES.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">City / Location</label>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <MapPinIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input 
                                                type="text" 
                                                value={formData.location}
                                                onChange={e => setFormData(prev => ({...prev, location: e.target.value}))}
                                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 pl-10 pr-4 py-2.5 focus:ring-orange-500 focus:border-orange-500"
                                                placeholder="Enter location or pick from map"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowLocationPicker(true)}
                                            className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                                        >
                                            <MapPinIcon className="w-4 h-4" />
                                            Pick location from map
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tour Date</label>
                                    <input 
                                        type="date" 
                                        value={formData.tourDate}
                                        onChange={e => setFormData(prev => ({...prev, tourDate: e.target.value}))}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-orange-500 focus:border-orange-500 px-4 py-2.5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tour Time</label>
                                    <select
                                        value={formData.tourTime}
                                        onChange={e => setFormData(prev => ({...prev, tourTime: e.target.value}))}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-orange-500 focus:border-orange-500 px-4 py-2.5"
                                    >
                                        <option value="">Select time</option>
                                        <option value="06:00">06:00 AM</option>
                                        <option value="06:30">06:30 AM</option>
                                        <option value="07:00">07:00 AM</option>
                                        <option value="07:30">07:30 AM</option>
                                        <option value="08:00">08:00 AM</option>
                                        <option value="08:30">08:30 AM</option>
                                        <option value="09:00">09:00 AM</option>
                                        <option value="09:30">09:30 AM</option>
                                        <option value="10:00">10:00 AM</option>
                                        <option value="10:30">10:30 AM</option>
                                        <option value="11:00">11:00 AM</option>
                                        <option value="11:30">11:30 AM</option>
                                        <option value="12:00">12:00 PM</option>
                                        <option value="12:30">12:30 PM</option>
                                        <option value="13:00">01:00 PM</option>
                                        <option value="13:30">01:30 PM</option>
                                        <option value="14:00">02:00 PM</option>
                                        <option value="14:30">02:30 PM</option>
                                        <option value="15:00">03:00 PM</option>
                                        <option value="15:30">03:30 PM</option>
                                        <option value="16:00">04:00 PM</option>
                                        <option value="16:30">04:30 PM</option>
                                        <option value="17:00">05:00 PM</option>
                                        <option value="17:30">05:30 PM</option>
                                        <option value="18:00">06:00 PM</option>
                                        <option value="18:30">06:30 PM</option>
                                        <option value="19:00">07:00 PM</option>
                                        <option value="19:30">07:30 PM</option>
                                        <option value="20:00">08:00 PM</option>
                                        <option value="20:30">08:30 PM</option>
                                        <option value="21:00">09:00 PM</option>
                                        <option value="21:30">09:30 PM</option>
                                        <option value="22:00">10:00 PM</option>
                                    </select>
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
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                <textarea 
                                    rows={5}
                                    value={formData.description}
                                    onChange={e => setFormData(prev => ({...prev, description: e.target.value}))}
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-orange-500 focus:border-orange-500 px-4 py-3"
                                    placeholder="What will you do? Where will you go?"
                                />
                             </div>
                             <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Duration (Hours)</label>
                                    <div className="relative">
                                        <ClockIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="number" 
                                            value={formData.duration}
                                            onChange={e => setFormData(prev => ({...prev, duration: Number(e.target.value)}))}
                                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 pl-10 pr-4 py-2.5 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Language</label>
                                    <div className="relative">
                                        <GlobeAltIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <select 
                                            value={formData.language}
                                            onChange={e => setFormData(prev => ({...prev, language: e.target.value}))}
                                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 pl-10 pr-4 py-2.5 focus:ring-orange-500 focus:border-orange-500 appearance-none"
                                        >
                                            {LANGUAGES.map(language => (
                                                <option key={language} value={language}>{language}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Maximum Participants</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    max="100"
                                    value={formData.maxParticipants}
                                    onChange={e => setFormData(prev => ({...prev, maxParticipants: Number(e.target.value)}))}
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-orange-500 focus:border-orange-500 px-4 py-2.5"
                                    placeholder="How many people can join this tour?"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Set the maximum number of participants for this tour</p>
                             </div>
                         </div>
                    </div>
                )}
                
                {step === 3 && (
                     <div className="space-y-6 fade-in">
                        <h2 className="text-xl font-bold">Photos</h2>
                        
                        <div className="space-y-4">
                            <label 
                                htmlFor="tour-photos" 
                                className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <PhotoIcon className="w-12 h-12 mb-3 text-slate-400" />
                                <p className="font-medium">Drag and drop photos here</p>
                                <p className="text-sm">or click to browse</p>
                                <input 
                                    type="file" 
                                    id="tour-photos" 
                                    multiple 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleImageUpload} 
                                />
                            </label>

                            {/* Previews */}
                            {photoPreviews.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {photoPreviews.map((preview, index) => (
                                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-slate-100">
                                            <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <p className="text-xs text-slate-400">Upload at least 3 photos to showcase your experience.</p>
                     </div>
                )}

                {step === 4 && (
                     <div className="space-y-6 fade-in">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pricing</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Price per person</label>
                                <div className="relative max-w-sm">
                                    <CurrencyDollarIcon className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="number" 
                                        min="0"
                                        step="0.01"
                                        value={formData.price || ''}
                                        onChange={e => setFormData(prev => ({...prev, price: parseFloat(e.target.value) || 0}))}
                                        placeholder="0.00"
                                        className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-800 pl-12 pr-4 py-4 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-2xl font-bold text-slate-900 dark:text-white transition-all"
                                    />
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-2 border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-400">Tour price</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">${formData.price.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-400">Platform fee (10%)</span>
                                    <span className="font-semibold text-red-600 dark:text-red-400">-${(formData.price * 0.1).toFixed(2)}</span>
                                </div>
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between">
                                    <span className="font-bold text-slate-900 dark:text-white">You earn</span>
                                    <span className="font-bold text-2xl text-emerald-600 dark:text-emerald-400">${(formData.price * 0.9).toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <p className="text-xs text-slate-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                💡 <strong>Tip:</strong> Research similar tours in your area to set a competitive price.
                            </p>
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
                             <div className="flex justify-between">
                                 <span className="text-slate-500">Photos:</span>
                                 <span className="font-medium">{formData.photos.length} uploaded</span>
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
                    onClick={step === 5 ? handleSubmit : handleNext}
                    className="bg-orange-600 text-white px-8 py-2.5 rounded-lg font-bold shadow-sm hover:bg-orange-700 transition-colors"
                 >
                     {step === 5 ? 'Submit' : 'Next'}
                 </button>
            </div>
            
            {/* Location Picker Modal */}
            {showLocationPicker && (
                <LocationPicker 
                    onLocationSelect={handleLocationSelect}
                    initialLocation={selectedLocation}
                    onClose={() => setShowLocationPicker(false)}
                />
            )}
        </div>
    )
}
