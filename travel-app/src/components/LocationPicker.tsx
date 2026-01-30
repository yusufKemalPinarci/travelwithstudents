// src/components/LocationPicker.tsx
import { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import Button from './Button';
import axios from 'axios';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

type LocationPickerProps = {
    initialLocation?: { lat: number; lng: number; address: string } | null;
    onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
    onClose?: () => void;
};

export default function LocationPicker({ initialLocation, onLocationSelect, onClose }: LocationPickerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    const [loading, setLoading] = useState(false);
    const [selectedPos, setSelectedPos] = useState<{lat: number, lng: number} | null>(
        initialLocation ? { lat: initialLocation.lat, lng: initialLocation.lng } : null
    );

    // Initial load
    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return; // Initialize only once

        // Default center: Use initialLocation or Istanbul
        const defaultCenter = initialLocation 
            ? { lat: initialLocation.lat, lng: initialLocation.lng }
            : { lat: 41.0082, lng: 28.9784 };
        
        const map = L.map(mapContainerRef.current).setView([defaultCenter.lat, defaultCenter.lng], 10);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add initial marker if location exists
        if (initialLocation) {
            markerRef.current = L.marker([initialLocation.lat, initialLocation.lng]).addTo(map);
        }

        // Click handler
        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            setSelectedPos({ lat, lng });

            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else {
                markerRef.current = L.marker([lat, lng]).addTo(map);
            }

            map.flyTo([lat, lng], map.getZoom());
        });

        // Cleanup
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    const confirmLocation = async () => {
        if (!selectedPos) return;
        setLoading(true);
        try {
            // Reverse geocoding using Nominatim (OpenStreetMap)
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${selectedPos.lat}&lon=${selectedPos.lng}`, {
                headers: {
                    'User-Agent': 'TravelStudentApp/1.0' // Good practice for OSM
                }
            });
            
            if (response.data && response.data.address) {
                const city = response.data.address.city || response.data.address.town || response.data.address.village || response.data.address.county || response.data.address.state;
                const country = response.data.address.country;
                
                let locationStr = '';
                if (city && country) locationStr = `${city}, ${country}`;
                else if (country) locationStr = country;
                else locationStr = `${selectedPos.lat.toFixed(2)}, ${selectedPos.lng.toFixed(2)}`;
                
                onLocationSelect({
                    lat: selectedPos.lat,
                    lng: selectedPos.lng,
                    address: locationStr
                });
                if (onClose) onClose();
            } else {
                 onLocationSelect({
                    lat: selectedPos.lat,
                    lng: selectedPos.lng,
                    address: `${selectedPos.lat.toFixed(4)}, ${selectedPos.lng.toFixed(4)}`
                 });
                 if (onClose) onClose();
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            // Fallback to coordinates
            onLocationSelect({
                lat: selectedPos.lat,
                lng: selectedPos.lng,
                address: `${selectedPos.lat.toFixed(4)}, ${selectedPos.lng.toFixed(4)}`
            });
            if (onClose) onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">Select Location</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl leading-none">&times;</button>
                </div>
                
                <div className="flex-1 min-h-[400px] relative">
                    <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '400px' }} />
                    
                    {/* Help text overlay */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full shadow-lg text-sm font-medium z-[1000] pointer-events-none">
                        Click on the map to place a pin
                    </div>
                </div>

                <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={confirmLocation} disabled={!selectedPos || loading}>
                        {loading ? 'Confirming...' : 'Set Location'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
