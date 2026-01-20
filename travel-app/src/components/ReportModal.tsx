import { useState } from 'react';
import { FlagIcon, XMarkIcon } from '@heroicons/react/24/solid';
import Button from './Button';

type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onSubmit: (reason: string) => void;
}

export default function ReportModal({ isOpen, onClose, userName, onSubmit }: ReportModalProps) {
  const [reason, setReason] = useState('inappropriate');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API
    setTimeout(() => {
        setIsSubmitting(false);
        onSubmit(reason);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <FlagIcon className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-900">Report {userName}</h2>
                <p className="text-slate-500 text-sm">Help us keep the community safe.</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-3">
               <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                   <input type="radio" name="reason" value="inappropriate" checked={reason === 'inappropriate'} onChange={(e) => setReason(e.target.value)} className="w-4 h-4 text-red-600 focus:ring-red-500" />
                   <span className="font-medium text-slate-700">Inappropriate Behavior</span>
               </label>
               <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                   <input type="radio" name="reason" value="scam" checked={reason === 'scam'} onChange={(e) => setReason(e.target.value)} className="w-4 h-4 text-red-600 focus:ring-red-500" />
                   <span className="font-medium text-slate-700">Scam or Fraud</span>
               </label>
               <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                   <input type="radio" name="reason" value="spam" checked={reason === 'spam'} onChange={(e) => setReason(e.target.value)} className="w-4 h-4 text-red-600 focus:ring-red-500" />
                   <span className="font-medium text-slate-700">Spam / Bot</span>
               </label>
           </div>

           <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Additional Details</label>
               <textarea
                 rows={3}
                 value={details}
                 onChange={(e) => setDetails(e.target.value)}
                 placeholder="Please provide more context..."
                 className="w-full rounded-xl border-slate-200 focus:border-red-500 focus:ring-red-500"
               />
           </div>

           <div className="flex gap-3">
               <Button variant="ghost" fullWidth onClick={onClose} type="button">Cancel</Button>
               <Button className="!bg-red-600 hover:!bg-red-700" fullWidth disabled={isSubmitting}>
                   {isSubmitting ? 'Reporting...' : 'Submit Report'}
               </Button>
           </div>
        </form>
      </div>
    </div>
  );
}
