import { useState, useMemo } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import type { Booking } from '../types';

type CancellationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onConfirm: () => void;
}

export default function CancellationModal({ isOpen, onClose, booking, onConfirm }: CancellationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock logic to determine refund amount based on date
  // In a real app, compare new Date() with booking.date
  // For demo: Randomly assign > 48h or < 48h scenario or just check booking date string if parsable
  const refundDetails = useMemo(() => {
    const today = new Date();
    const tourDate = new Date(booking.date);
    const diffTime = tourDate.getTime() - today.getTime();
    const diffHours = diffTime / (1000 * 3600);
    
    // For demo purposes, let's assume if the date is in the future > 2 days, it's full refund
    // If it's close, partial.
    // Since mock data dates might be old/static, let's force a scenario based on even/odd ID for variety if dates are invalid
    // But let's try date math first.
    
    const isFullRefund = diffHours > 48;
    
    return {
        isFullRefund,
        refundAmount: isFullRefund ? booking.price : booking.price * 0.5,
        fee: isFullRefund ? 0 : booking.price * 0.5,
        message: isFullRefund 
            ? "Your tour is more than 48 hours away." 
            : "Your tour is less than 48 hours away."
    };
  }, [booking]);

  const handleConfirm = () => {
      setIsProcessing(true);
      setTimeout(() => {
          setIsProcessing(false);
          onConfirm();
      }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
           <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-600">
                <ExclamationTriangleIcon className="w-6 h-6" />
           </div>
           <h2 className="text-xl font-bold text-slate-900">Cancel this booking?</h2>
           <p className="text-slate-500 text-sm mt-1">
             Are you sure you want to cancel your trip with <span className="font-semibold text-slate-700">{booking.guide.name}</span>?
           </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3">
            <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Refund Policy</span>
                <span className={`font-semibold ${refundDetails.isFullRefund ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {refundDetails.isFullRefund ? 'Full Refund' : 'Partial Refund'}
                </span>
            </div>
            <div className="h-px bg-slate-200" />
            <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Tour Price</span>
                <span className="font-medium">${booking.price.toFixed(2)}</span>
            </div>
            {!refundDetails.isFullRefund && (
                <div className="flex justify-between items-center text-sm text-red-600">
                    <span>Cancellation Fee (50%)</span>
                    <span>-${refundDetails.fee.toFixed(2)}</span>
                </div>
            )}
            <div className="h-px bg-slate-200" />
            <div className="flex justify-between items-center text-base font-bold text-slate-900">
                <span>Total Refund</span>
                <span>${refundDetails.refundAmount.toFixed(2)}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
                {refundDetails.message} Refund will be processed to your original payment method.
            </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
                Keep Trip
            </Button>
            <Button 
                variant="primary" 
                className="!bg-red-600 hover:!bg-red-700 border-red-600"
                onClick={handleConfirm}
                disabled={isProcessing}
            >
                {isProcessing ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
        </div>
      </div>
    </div>
  );
}
