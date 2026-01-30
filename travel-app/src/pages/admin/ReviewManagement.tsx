import { useState, useEffect } from 'react'
import { 
    MagnifyingGlassIcon, 
    StarIcon,
    FlagIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import { getAllReviews, deleteReview } from '../../api/admin'

type Review = {
    id: string
    bookingId: string
    traveler: string
    guide: string
    tourName: string
    rating: number
    comment: string
    reply?: string
    date: string
    status: 'approved' | 'pending' | 'flagged' | 'rejected'
    flagCount: number
}

const statusColors = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    flagged: 'bg-red-100 text-red-700',
    rejected: 'bg-slate-100 text-slate-700',
}

export default function ReviewManagement() {
    const [reviews, setReviews] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | string>('all')
    const [selectedReview, setSelectedReview] = useState<any | null>(null)

    useEffect(() => {
        const fetchReviews = async () => {
            const data = await getAllReviews()
            setReviews(data)
            setLoading(false)
        }
        fetchReviews()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    const filteredReviews = reviews.filter(review => {
        const matchesSearch = review.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            review.guide?.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || review.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const approveReview = async (reviewId: string) => {
        console.log('Approving review:', reviewId)
        // Implement approval logic with API
    }

    const rejectReview = async (reviewId: string) => {
        const success = await deleteReview(reviewId)
        if (success) {
            setReviews(prev => prev.filter(r => r.id !== reviewId))
        }
        // Implement rejection logic
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Review Management</h1>
                <p className="text-slate-500 mt-1">Moderate and manage user reviews</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {mockReviews.filter(r => r.status === 'approved').length}
                            </p>
                            <p className="text-xs text-slate-500">Approved</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <StarIcon className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {mockReviews.filter(r => r.status === 'pending').length}
                            </p>
                            <p className="text-xs text-slate-500">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <FlagIcon className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {mockReviews.filter(r => r.status === 'flagged').length}
                            </p>
                            <p className="text-xs text-slate-500">Flagged</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <StarIcon className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {(mockReviews.reduce((acc, r) => acc + r.rating, 0) / mockReviews.length).toFixed(1)}
                            </p>
                            <p className="text-xs text-slate-500">Avg Rating</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by traveler, guide, or tour..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="flagged">Flagged</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {filteredReviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1">
                                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-lg font-bold text-slate-600">
                                        {review.traveler.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-slate-900">{review.traveler}</h3>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <StarIcon
                                                    key={i}
                                                    className={`w-4 h-4 ${
                                                        i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusColors[review.status]}`}>
                                            {review.status}
                                        </span>
                                        {review.flagCount > 0 && (
                                            <span className="flex items-center gap-1 text-red-600 text-sm">
                                                <FlagIcon className="w-4 h-4" />
                                                {review.flagCount}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 mb-3">
                                        Tour: <span className="font-medium text-slate-700">{review.tourName}</span> with{' '}
                                        <span className="font-medium text-slate-700">{review.guide}</span> • {review.date}
                                    </p>
                                    <p className="text-slate-700 leading-relaxed">{review.comment}</p>
                                    {review.reply && (
                                        <div className="mt-3 pl-4 border-l-2 border-blue-200 bg-blue-50 p-3 rounded">
                                            <div className="flex items-center gap-2 mb-1">
                                                <ChatBubbleLeftIcon className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-bold text-blue-900">Guide's Reply</span>
                                            </div>
                                            <p className="text-sm text-slate-700">{review.reply}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-slate-100">
                            <button 
                                onClick={() => approveReview(review.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                            >
                                <CheckCircleIcon className="w-4 h-4" />
                                Approve
                            </button>
                            <button 
                                onClick={() => rejectReview(review.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                            >
                                <XCircleIcon className="w-4 h-4" />
                                Reject
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                                <FlagIcon className="w-4 h-4" />
                                Flag
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
