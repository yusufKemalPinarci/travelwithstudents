import { useState } from 'react'
import { AcademicCapIcon, CloudArrowUpIcon, DocumentIcon, CheckBadgeIcon, ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/solid'
import Button from './Button'

const universities = [
  "New York University",
  "Columbia University",
  "UCLA",
  "Harvard University",
  "Stanford University",
  "University of Amsterdam",
  "Boğaziçi University",
  "Technical University of Munich"
]

export default function StudentVerificationForm() {
  const [status, setStatus] = useState<'none' | 'pending' | 'verified'>('none')
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    university: '',
    email: '',
    major: ''
  })
  const [error, setError] = useState('')

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        setFile(e.dataTransfer.files[0])
    }
  }

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    // Basic email validation logic
    if (key === 'email') {
        const isValid = value.endsWith('.edu') || value.endsWith('.edu.tr') || value.includes('.ac.')
        if (!isValid && value.length > 10) {
            setError('Please use a valid university email address (.edu, .ac, etc)')
        } else {
            setError('')
        }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.university || !formData.email || !formData.major || !file) {
        setError('Please fill in all fields and upload your ID.')
        return
    }
    if (error) return

    // Mock API
    setStatus('pending')
  }

  // Developer Mock Toggle
  const toggleVerified = () => {
    setStatus(prev => prev === 'verified' ? 'none' : 'verified')
  }

  if (status === 'verified') {
     return (
        <div className="card-surface p-8 text-center space-y-4 border border-emerald-100 bg-emerald-50/10">
            <div className="inline-flex p-4 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                <CheckBadgeIcon className="w-16 h-16" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">You are a Verified Student!</h2>
            <p className="text-slate-600 max-w-md mx-auto">
                Your student status at <span className="font-semibold text-slate-900">{formData.university || 'Your University'}</span> has been confirmed. You can now list tours and accept bookings.
            </p>
            <div className="pt-4">
                 <Button variant="ghost" onClick={() => setStatus('none')} className="text-xs text-slate-400 hover:text-rose-500">
                    (Dev: Reset Status)
                 </Button>
            </div>
        </div>
     )
  }

  if (status === 'pending') {
      return (
        <div className="card-surface p-8 text-center space-y-4 border border-amber-100 bg-amber-50/30">
             <div className="inline-flex p-4 rounded-full bg-amber-100 text-amber-600 mb-2 animate-pulse">
                <ExclamationTriangleIcon className="w-16 h-16" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Verification Pending</h2>
            <p className="text-slate-600 max-w-md mx-auto">
                Our team is reviewing your documents. This usually takes about 24 hours. You will be notified via email at <span className="font-mono text-slate-800">{formData.email}</span>.
            </p>
            <button onClick={toggleVerified} className="opacity-0 w-4 h-4 cursor-default" aria-hidden="true" tabIndex={-1}>.</button>
        </div>
      )
  }

  return (
    <div className="card-surface p-6">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
            <AcademicCapIcon className="w-6 h-6" />
        </div>
        <div>
            <h3 className="font-bold text-lg text-slate-900">Student Verification</h3>
            <p className="text-xs text-slate-500">Unlock guide features by verifying your enrollment.</p>
        </div>
        {/* Secret Dev Toggle */}
        <button onClick={toggleVerified} className="ml-auto text-transparent text-xs hover:text-slate-200">DEV</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
             <div className="space-y-1">
                 <label className="text-sm font-semibold text-slate-700">University Name</label>
                 <select 
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                    value={formData.university}
                    onChange={(e) => handleInputChange('university', e.target.value)}
                 >
                    <option value="">Select University...</option>
                    {universities.map(u => <option key={u}>{u}</option>)}
                 </select>
             </div>
             <div className="space-y-1">
                 <label className="text-sm font-semibold text-slate-700">Student Email</label>
                 <input 
                    type="email" 
                    placeholder="you@university.edu"
                    className={`w-full rounded-xl border px-4 py-2.5 outline-none focus:ring-2 ${error ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-primary-500'}`}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                 />
                 {error && <p className="text-xs text-rose-500 pt-1">{error}</p>}
             </div>
             <div className="md:col-span-2 space-y-1">
                 <label className="text-sm font-semibold text-slate-700">Department / Major</label>
                 <input 
                    type="text" 
                    placeholder="e.g. Computer Science, Art History..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
                    value={formData.major}
                    onChange={(e) => handleInputChange('major', e.target.value)}
                 />
             </div>
          </div>

          <div className="space-y-2">
               <label className="text-sm font-semibold text-slate-700">Upload Student ID / Transcript</label>
               {file ? (
                   <div className="flex items-center justify-between p-4 border border-emerald-200 bg-emerald-50 rounded-xl">
                       <div className="flex items-center gap-3">
                           <DocumentIcon className="w-8 h-8 text-emerald-500" />
                           <div>
                               <p className="font-bold text-emerald-900 text-sm">{file.name}</p>
                               <p className="text-xs text-emerald-600">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to upload</p>
                           </div>
                       </div>
                       <button type="button" onClick={() => setFile(null)} className="text-slate-400 hover:text-rose-500">
                           <TrashIcon className="w-5 h-5" />
                       </button>
                   </div>
               ) : (
                <div 
                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-primary-400 transition-colors bg-slate-50"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <input 
                        id="file-upload" 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => e.target.files && setFile(e.target.files[0])}
                    />
                    <CloudArrowUpIcon className="w-12 h-12 text-slate-300 mb-2" />
                    <p className="text-slate-600 font-medium">Click to upload or drag & drop</p>
                    <p className="text-xs text-slate-400 mt-1">Details must be clearly visible. Max 5MB.</p>
                </div>
               )}
          </div>

          <div className="pt-2">
            <Button fullWidth disabled={!!error || !file}>Submit Verification</Button>
          </div>
      </form>
    </div>
  )
}
