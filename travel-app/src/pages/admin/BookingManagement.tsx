import { useState, useEffect } from 'react'
import { 
    MagnifyingGlassIcon, 
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline'
import { getAllBookings, updateBookingStatus } from '../../api/admin'

type Booking = {
    id: string
    bookingId: string
    traveler: string
    guide: string
    tourName: string
    date: string
    time: string
    duration: string
    amount: number
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    createdAt: string
}

const statusColors = {
    PENDING: 'bg-amber-100 text-amber-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
}

export default function BookingManagement() {
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | string>('all')
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null)

    useEffect(() => {
        const fetchBookings = async () => {
            const data = await getAllBookings()
            setBookings(data)
            setLoading(false)
        }
        fetchBookings()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            booking.traveler.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            booking.guide.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Booking Management</h1>
                <p className="text-slate-500 mt-1">View and manage all bookings</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <ClockIcon className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {mockBookings.filter(b => b.status === 'pending').length}
                            </p>
                            <p className="text-xs text-slate-500">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {mockBookings.filter(b => b.status === 'confirmed').length}
                            </p>
                            <p className="text-xs text-slate-500">Confirmed</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {mockBookings.filter(b => b.status === 'completed').length}
                            </p>
                            <p className="text-xs text-slate-500">Completed</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <XCircleIcon className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {mockBookings.filter(b => b.status === 'cancelled').length}
                            </p>
                            <p className="text-xs text-slate-500">Cancelled</p>
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
                            placeholder="Search by booking ID, traveler, or guide..."
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
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Booking ID</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Traveler</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Guide</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tour</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-slate-900">
                                        {booking.bookingId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {booking.traveler}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {booking.guide}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-900">
                                        <div>
                                            <p className="font-medium">{booking.tourName}</p>
                                            <p className="text-xs text-slate-500">{booking.duration}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <div>
                                            <p>{booking.date}</p>
                                            <p className="text-xs">{booking.time}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusColors[booking.status]}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                                        ${booking.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button 
                                            onClick={() => setSelectedBooking(booking)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <EyeIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Booking Detail Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedBooking(null)}>
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Booking Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Booking ID:</span>
                                <span className="font-mono font-medium">{selectedBooking.bookingId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Traveler:</span>
                                <span className="font-medium">{selectedBooking.traveler}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Guide:</span>
                                <span className="font-medium">{selectedBooking.guide}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Tour:</span>
                                <span className="font-medium">{selectedBooking.tourName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Date & Time:</span>
                                <span className="font-medium">{selectedBooking.date} at {selectedBooking.time}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Duration:</span>
                                <span className="font-medium">{selectedBooking.duration}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Status:</span>
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusColors[selectedBooking.status]}`}>
                                    {selectedBooking.status}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Amount:</span>
                                <span className="font-bold text-lg">${selectedBooking.amount}</span>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button 
                                onClick={() => setSelectedBooking(null)}
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
