import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Button from './Button'

interface BookingProposalModalProps {
  onClose: () => void
  onSend: (bookingData: any) => void
  isGuide?: boolean
}

export default function BookingProposalModal({ onClose, onSend, isGuide }: BookingProposalModalProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState<'HALF_DAY' | 'FULL_DAY'>('HALF_DAY')
  const [participants, setParticipants] = useState(1)
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!date || !time) {
      alert('Please fill all required fields')
      return
    }

    onSend({
      date,
      time,
      duration,
      participants,
      notes: notes.trim() || undefined,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {isGuide ? 'Send Booking Proposal' : 'Request Booking'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Time *
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Duration
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDuration('HALF_DAY')}
                className={`px-4 py-3 rounded-xl border-2 transition-all ${
                  duration === 'HALF_DAY'
                    ? 'border-orange-600 bg-orange-50 text-orange-900 font-semibold'
                    : 'border-slate-300 hover:border-orange-300'
                }`}
              >
                Half Day (4h)
              </button>
              <button
                type="button"
                onClick={() => setDuration('FULL_DAY')}
                className={`px-4 py-3 rounded-xl border-2 transition-all ${
                  duration === 'FULL_DAY'
                    ? 'border-orange-600 bg-orange-50 text-orange-900 font-semibold'
                    : 'border-slate-300 hover:border-orange-300'
                }`}
              >
                Full Day (8h)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Number of Participants
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setParticipants(Math.max(1, participants - 1))}
                className="w-10 h-10 rounded-full border-2 border-slate-300 hover:border-orange-500 hover:bg-orange-50 transition-all"
              >
                −
              </button>
              <input
                type="number"
                value={participants}
                onChange={(e) => setParticipants(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="w-20 text-center text-lg font-bold border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={() => setParticipants(participants + 1)}
                className="w-10 h-10 rounded-full border-2 border-slate-300 hover:border-orange-500 hover:bg-orange-50 transition-all"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any special requests or information..."
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Send Proposal
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
