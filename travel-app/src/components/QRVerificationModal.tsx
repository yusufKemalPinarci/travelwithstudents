import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { verifyMeetingQR, signalGuideArrival } from '../api/bookings';
import Button from './Button';

interface QRVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  role: 'STUDENT_GUIDE' | 'TRAVELER';
  onSuccess: () => void;
}

const QRVerificationModal: React.FC<QRVerificationModalProps> = ({ 
  isOpen, onClose, bookingId, role, onSuccess 
}) => {
  const [step, setStep] = useState<'INIT' | 'LOCATING' | 'READY_TO_SCAN' | 'SCANNING' | 'VERIFYING' | 'SUCCESS' | 'ERROR'>('INIT');
  const [errorMsg, setErrorMsg] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [qrData, setQrData] = useState<string>('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Keep location in ref for scanner callback access
  const locationRef = useRef<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('INIT');
      setErrorMsg('');
      setLocation(null);
      setQrData('');
      locationRef.current = null;
    } else {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
        }
    }
  }, [isOpen]);

  const startProcess = () => {
    setStep('LOCATING');
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser');
      setStep('ERROR');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(coords);
        locationRef.current = coords;
        
        if (role === 'STUDENT_GUIDE') {
          // Generate QR Payload
          const payload = JSON.stringify({
            bookingId,
            lat: coords.lat,
            lng: coords.lng,
            timestamp: Date.now(),
            role: 'GUIDE'
          });
          setQrData(payload);
          
          // SIGNAL ARRIVAL TO BACKEND
          signalGuideArrival(bookingId, { lat: coords.lat, lng: coords.lng });

          setStep('READY_TO_SCAN'); // Show QR
        } else {
          // Traveler - Start Scanner
          setStep('SCANNING');
        }
      },
      (err) => {
        setErrorMsg('Unable to retrieve your location. Please allow location access.');
        setStep('ERROR');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleScan = async (decodedText: string) => {
     // Stop scanning immediately
     if (scannerRef.current) {
         try { await scannerRef.current.clear(); } catch(e) {}
         // Don't set ref to null here immediately to avoid issues
     }

     setStep('VERIFYING');
     
     const loc = locationRef.current;
     if (!loc) {
        setErrorMsg("Location data lost. Please try again.");
        setStep('ERROR');
        return;
     }

     try {
         await verifyMeetingQR(bookingId, {
             qrData: decodedText,
             scannerLat: loc.lat,
             scannerLng: loc.lng,
             scannerRole: 'TRAVELER'
         });
         setStep('SUCCESS');
         setTimeout(() => {
             onSuccess();
             onClose();
         }, 2000);
     } catch (err: any) {
         console.error(err);
         setErrorMsg(err.response?.data?.message || 'Verification Failed');
         setStep('ERROR');
     } 
  };

  // Scanning Logic
  useEffect(() => {
    if (step === 'SCANNING' && isOpen) {
        // Delay to ensure DOM is ready
        const timer = setTimeout(() => {
            if (!document.getElementById("reader")) return;
            
            // Clean up existing if any
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear().catch(() => {});
                } catch(e) {}
            }

            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );
            scannerRef.current = scanner;
            
            scanner.render(
                (decodedText) => {
                    handleScan(decodedText);
                }, 
                (err) => { /* ignore scan errors */ }
            );
        }, 300);

        return () => clearTimeout(timer);
    }
    
    return () => {
        if (scannerRef.current) {
            try { 
                scannerRef.current.clear(); 
            } catch(e) {}
            scannerRef.current = null;
        }
    };
  }, [step, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
        <h2 className="text-xl font-bold mb-4">
            {role === 'STUDENT_GUIDE' ? 'Generate Meeting QR' : 'Scan Meeting QR'}
        </h2>

        {step === 'INIT' && (
             <div className="space-y-4">
                 <p className="text-gray-600">
                    {role === 'STUDENT_GUIDE' 
                      ? 'Click to generate a secure QR code. This will record your location.'
                      : 'Scan the QR code on the Guide\'s phone to verify attendance.'}
                 </p>
                 <Button onClick={startProcess} variant="primary">
                    {role === 'STUDENT_GUIDE' ? 'Generate Code' : 'Start Scanning'}
                 </Button>
             </div>
        )}

        {step === 'LOCATING' && (
            <div className="py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p>Getting your location...</p>
            </div>
        )}

        {step === 'READY_TO_SCAN' && role === 'STUDENT_GUIDE' && qrData && (
             <div className="flex flex-col items-center space-y-4">
                 <div className="p-4 border-2 border-dashed border-gray-300 rounded">
                    <QRCodeCanvas value={qrData} size={250} level="H" />
                 </div>
                 <p className="text-sm text-gray-500">Show this code to the traveler.</p>
                 
                 <div className="text-xs text-left bg-gray-50 p-2 rounded w-full">
                    <p><strong>Lat:</strong> {location?.lat.toFixed(6)}</p>
                    <p><strong>Lng:</strong> {location?.lng.toFixed(6)}</p>
                 </div>
                 
                 <p className="text-xs text-red-500">Code returns to invalid state in 5 minutes</p>
             </div>
        )}

        {step === 'SCANNING' && (
            <div className="w-full flex flex-col items-center">
                <div id="reader" className="w-full max-w-[300px]"></div>
                <p className="text-xs text-gray-400 mt-2">Position the QR code within the frame</p>
                <Button onClick={() => setStep('INIT')} className="mt-4" variant="outline">Cancel Scan</Button>
            </div>
        )}

        {step === 'VERIFYING' && (
             <div className="py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p>Verifying Location & Code...</p>
             </div>
        )}

        {step === 'SUCCESS' && (
             <div className="py-8 text-green-600">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="font-bold">Verification Successful!</p>
                <p className="text-sm">Attendance Confirmed.</p>
            </div>
        )}

        {step === 'ERROR' && (
             <div className="py-4">
                 <p className="text-red-500 font-bold mb-4">Verification Error</p>
                 <p className="text-gray-600 mb-4">{errorMsg}</p>
                 <Button onClick={() => setStep('INIT')} variant="outline">Try Again</Button>
            </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100">
            <Button onClick={onClose} variant="ghost">Close</Button>
        </div>
      </div>
    </div>
  );
};

export default QRVerificationModal;
