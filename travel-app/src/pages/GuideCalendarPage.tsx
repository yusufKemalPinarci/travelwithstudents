import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, NoSymbolIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { getMyBookings } from '../api/bookings';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function GuideCalendarPage() {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // Real booking data from API
    const [bookingsData, setBookingsData] = useState<Array<{ date: string; time: string; status: string }>>([]); 
    const [unavailable, setUnavailable] = useState<number[]>([]); 

    // Fetch bookings from API
    useEffect(() => {
        const fetchBookings = async () => {
            if (!user?.id) return;
            
            setLoading(true);
            try {
                const bookings = await getMyBookings(user.id, 'STUDENT_GUIDE');
                
                // Filter bookings for current month and year
                const currentMonthBookings = bookings.filter(booking => {
                    const bookingDate = new Date(booking.date);
                    return bookingDate.getMonth() === currentDate.getMonth() && 
                           bookingDate.getFullYear() === currentDate.getFullYear();
                });
                
                setBookingsData(currentMonthBookings.map(b => ({
                    date: b.date,
                    time: b.time,
                    status: b.status
                })));
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchBookings();
    }, [user?.id, currentDate]);

    // Get booked days from real data
    const bookings = bookingsData
        .filter(b => b.status === 'confirmed' || b.status === 'pending')
        .map(b => new Date(b.date).getDate()); 

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDate(null);
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDate(null);
    };

    const toggleAvailability = (day: number) => {
        if (bookings.includes(day)) return; // Cannot change booked days
        
        if (unavailable.includes(day)) {
            setUnavailable(prev => prev.filter(d => d !== day));
        } else {
            setUnavailable(prev => [...prev, day]);
        }
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const emptyDays = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                     <h1 className="text-2xl font-bold text-slate-900">Availability Calendar</h1>
                     <p className="text-slate-500">Click on a date to block or unblock your availability.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-sm px-2">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-full text-slate-500 hover:text-slate-800">
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <span className="min-w-[140px] text-center font-bold text-slate-800">
                            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-full text-slate-500 hover:text-slate-800">
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-[600px]">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                            <p className="text-slate-500">Loading calendar...</p>
                        </div>
                    </div>
                ) : (
                    <>
                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                    {DAYS.map(day => (
                        <div key={day} className="py-3 text-center text-xs font-bold uppercase text-slate-400 tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 h-[600px]">
                    {emptyDays.map((_, i) => (
                        <div key={`empty-${i}`} className="border-b border-r border-slate-100 bg-slate-50/30"></div>
                    ))}
                    
                    {days.map(day => {
                        const isBooked = bookings.includes(day);
                        const isUnavailable = unavailable.includes(day);
                        const isSelected = selectedDate === day;

                        return (
                            <div 
                                key={day} 
                                onClick={() => setSelectedDate(day)}
                                className={`
                                    relative border-b border-r border-slate-100 p-2 cursor-pointer transition-colors group
                                    ${isSelected ? 'bg-primary-50 ring-2 ring-primary-500 inset-0 z-10' : 'hover:bg-slate-50'}
                                    ${isUnavailable ? 'bg-slate-100/50' : ''}
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`
                                        text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                        ${day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700'}
                                    `}>
                                        {day}
                                    </span>
                                    {/* Action Buttons for Selected Date */}
                                    {isSelected && !isBooked && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleAvailability(day);
                                            }}
                                            className={`
                                                p-1 rounded-full shadow-md transition-transform hover:scale-110
                                                ${isUnavailable 
                                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                                                    : 'bg-red-500 text-white hover:bg-red-600'}
                                            `}
                                            title={isUnavailable ? "Set as Available" : "Block Date"}
                                        >
                                            {isUnavailable ? <CheckCircleIcon className="w-4 h-4" /> : <NoSymbolIcon className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>

                                <div className="mt-2 space-y-1">
                                    {bookingsData
                                        .filter(b => new Date(b.date).getDate() === day)
                                        .map((booking, idx) => (
                                            <div key={idx} className="px-2 py-1 text-[10px] font-bold bg-primary-100 text-primary-700 rounded-md truncate shadow-sm border border-primary-200">
                                                {booking.time} - Tour
                                            </div>
                                        ))
                                    }
                                    {isUnavailable && (
                                        <div className="px-2 py-1 text-[10px] font-bold bg-slate-200 text-slate-500 rounded-md truncate flex items-center gap-1 justify-center">
                                            Unavailable
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>                    </>
                )}            </div>

            <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                    <span className="text-slate-600 font-medium">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white border border-slate-300"></div>
                    <span className="text-slate-600 font-medium">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <span className="text-slate-600 font-medium">Unavailable</span>
                </div>
            </div>
        </div>
    )
}
