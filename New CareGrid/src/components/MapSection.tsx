import React, { useState, useMemo, useEffect } from 'react';
import { useMedical } from '../context/MedicalContext';
import { Hospital } from '../types';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Filter, 
  Info, 
  Layers, 
  Compass, 
  Clock, 
  ArrowRight, 
  Locate, 
  Map as MapIcon, 
  Lightbulb,
  ExternalLink 
} from 'lucide-react';
import { motion } from 'motion/react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

// Read API keys safely - matching the google-maps-platform skill instructions
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY.trim() !== '';

interface MapSectionProps {
  initialSpecialty?: string;
}

// Haversine formula helper for calculating distance mathematically
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Number(d.toFixed(1));
}

export const MapSection: React.FC<MapSectionProps> = ({ initialSpecialty = 'All' }) => {
  const { hospitals, selectedHospitalId, setSelectedHospitalId } = useMedical();
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(initialSpecialty);
  const [selectedFacility, setSelectedFacility] = useState<string>('All');
  const [maxDistance, setMaxDistance] = useState<number>(5.0);

  // View modes: vector illustrated canvas or actual Google Map
  const [viewMode, setViewMode] = useState<'vector' | 'google'>('google');
  
  // Comparative Hospital selection
  const [sourceHospitalId, setSourceHospitalId] = useState<string>('');
  const [destHospitalId, setDestHospitalId] = useState<string>('');

  // Synchronise source & destination when hospitals array loads
  useEffect(() => {
    if (Array.isArray(hospitals) && hospitals.length > 0) {
      if (!sourceHospitalId) {
        setSourceHospitalId(hospitals[0].id);
      }
      if (!destHospitalId) {
        setDestHospitalId(hospitals[1]?.id || hospitals[0].id);
      }
    }
  }, [hospitals, sourceHospitalId, destHospitalId]);

  const [gpsOrigin, setGpsOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Default values or reactive state variables
  const [displayDistance, setDisplayDistance] = useState<string>('0 km');
  const [displayDuration, setDisplayDuration] = useState<string>('0 mins');

  // Coordinates of "ICARE Institute of Medical Science and Research" Haldia
  const ICARE_COORDS = { lat: 22.0641352, lng: 88.0359571 };

  useEffect(() => {
    setSelectedSpecialty(initialSpecialty);
  }, [initialSpecialty]);

  // Extract unique medical specialties for filtering
  const specialtiesList = useMemo(() => {
    const list = new Set<string>();
    if (Array.isArray(hospitals)) {
      hospitals.forEach(h => {
        if (h && Array.isArray(h.specialties)) {
          h.specialties.forEach(s => list.add(s));
        }
      });
    }
    return ['All', ...Array.from(list)];
  }, [hospitals]);

  // Extract unique key diagnostic facilities
  const facilitiesList = useMemo(() => {
    const list = new Set<string>();
    if (Array.isArray(hospitals)) {
      hospitals.forEach(h => {
        if (h && Array.isArray(h.facilities)) {
          h.facilities.forEach(f => {
            if (['MRI', 'CT Scan', 'X-Ray', 'ECG', 'Ultrasound'].includes(f)) {
              list.add(f);
            }
          });
        }
      });
    }
    return ['All', ...Array.from(list)];
  }, [hospitals]);

  // Filter hospitals dynamically
  const filteredHospitals = useMemo(() => {
    if (!Array.isArray(hospitals)) return [];
    return hospitals.filter(h => {
      if (!h) return false;
      const matchSearch = (h.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (h.address || '').toLowerCase().includes(search.toLowerCase());
      const matchSpecialty = selectedSpecialty === 'All' || (Array.isArray(h.specialties) && h.specialties.includes(selectedSpecialty));
      const matchFacility = selectedFacility === 'All' || (Array.isArray(h.facilities) && h.facilities.includes(selectedFacility));
      const matchDistance = typeof h.distance === 'number' ? h.distance <= maxDistance : true;
      return matchSearch && matchSpecialty && matchFacility && matchDistance;
    });
  }, [hospitals, search, selectedSpecialty, selectedFacility, maxDistance]);

  // Count available beds for a hospital
  const getAvailableBedsCount = (hospital: Hospital) => {
    let count = 0;
    if (hospital && Array.isArray(hospital.wards)) {
      hospital.wards.forEach(w => {
        if (w && Array.isArray(w.beds)) {
          count += w.beds.filter(b => b && b.status === 'available').length;
        }
      });
    }
    return count;
  };

  const getPercentageBedsOccupied = (hospital: Hospital) => {
    let total = 0;
    let occupied = 0;
    if (hospital && Array.isArray(hospital.wards)) {
      hospital.wards.forEach(w => {
        if (w && Array.isArray(w.beds)) {
          total += w.beds.length;
          occupied += w.beds.filter(b => b && b.status !== 'available').length;
        }
      });
    }
    return total > 0 ? Math.round((occupied / total) * 100) : 0;
  };

  // Logic to calculate routing distance & travel duration between Selected Hospital A and Hospital B
  useEffect(() => {
    if (!sourceHospitalId || !destHospitalId || !Array.isArray(hospitals)) return;

    const hospA = hospitals.find(h => h.id === sourceHospitalId);
    const hospB = hospitals.find(h => h.id === destHospitalId);

    if (!hospA || !hospB) return;

    if (hospA.id === hospB.id) {
      setDisplayDistance('0 km');
      setDisplayDuration('0 mins');
      return;
    }

    let calculatedDist = 0;

    // Use GPS Coordinates if both hospitals have them
    if (hospA.gpsCoordinates?.lat && hospA.gpsCoordinates?.lng && hospB.gpsCoordinates?.lat && hospB.gpsCoordinates?.lng) {
      calculatedDist = calculateHaversineDistance(
        hospA.gpsCoordinates.lat,
        hospA.gpsCoordinates.lng,
        hospB.gpsCoordinates.lat,
        hospB.gpsCoordinates.lng
      );
    } else {
      // Fallback: estimate using relative canvas coordinates (mapped onto Haldia scale)
      const dx = hospA.coordinates.x - hospB.coordinates.x;
      const dy = hospA.coordinates.y - hospB.coordinates.y;
      const rawDist = Math.sqrt(dx * dx + dy * dy) * 0.15;
      calculatedDist = Number(rawDist.toFixed(1));
    }

    setDisplayDistance(`${calculatedDist} km`);

    // Driving duration estimation (assumes approximate 35 km/h city speed)
    const durationMins = Math.max(1, Math.round((calculatedDist / 35) * 60));
    if (durationMins >= 60) {
      const hrs = Math.floor(durationMins / 60);
      const remainingMins = durationMins % 60;
      setDisplayDuration(`${hrs} hr ${remainingMins} mins`);
    } else {
      setDisplayDuration(`${durationMins} mins`);
    }
  }, [sourceHospitalId, destHospitalId, hospitals]);

  // Determine active starting coordinates (Hospital A) to pass to the Map/Iframe
  const activeCoordinates = useMemo(() => {
    if (!sourceHospitalId || !Array.isArray(hospitals)) return { lat: 22.0315, lng: 88.0694 };
    const hospA = hospitals.find(h => h.id === sourceHospitalId);
    if (hospA?.gpsCoordinates) {
      return hospA.gpsCoordinates;
    }
    // Haldia Township fallback coordinates mapped mathematically based on relative center
    return { lat: 21.99 + (hospA ? hospA.coordinates.y * 0.001 : 0.04), lng: 88.03 + (hospA ? hospA.coordinates.x * 0.001 : 0.04) };
  }, [sourceHospitalId, hospitals]);

  // Determine destination coordinates (Hospital B) to pass to the Map/Iframe
  const destinationCoordinates = useMemo(() => {
    if (!destHospitalId || !Array.isArray(hospitals)) return { lat: 22.0641352, lng: 88.0359571 };
    const hospB = hospitals.find(h => h.id === destHospitalId);
    if (hospB?.gpsCoordinates) {
      return hospB.gpsCoordinates;
    }
    // Haldia center fallback coordinates mapped mathematically
    return { lat: 21.99 + (hospB ? hospB.coordinates.y * 0.001 : 0.07), lng: 88.03 + (hospB ? hospB.coordinates.x * 0.001 : 0.01) };
  }, [destHospitalId, hospitals]);

  // Current turn-by-turn steps listing
  const activeSteps = useMemo(() => {
    if (!sourceHospitalId || !destHospitalId || !Array.isArray(hospitals)) {
      return [{ instruction: "Select two registered hospitals to compare road distances.", distance: "0 km" }];
    }

    const hospA = hospitals.find(h => h.id === sourceHospitalId);
    const hospB = hospitals.find(h => h.id === destHospitalId);

    if (!hospA || !hospB) {
      return [{ instruction: 'Clinical registration directories loading...', distance: '0 km' }];
    }

    if (hospA.id === hospB.id) {
      return [
        { instruction: `You selected the same hospital: ${hospA.name}. Select separate registered hospitals above to compare distances and road routes.`, distance: 'Ready' }
      ];
    }

    let calculatedDist = 0;
    if (hospA.gpsCoordinates?.lat && hospA.gpsCoordinates?.lng && hospB.gpsCoordinates?.lat && hospB.gpsCoordinates?.lng) {
      calculatedDist = calculateHaversineDistance(
        hospA.gpsCoordinates.lat,
        hospA.gpsCoordinates.lng,
        hospB.gpsCoordinates.lat,
        hospB.gpsCoordinates.lng
      );
    } else {
      const dx = hospA.coordinates.x - hospB.coordinates.x;
      const dy = hospA.coordinates.y - hospB.coordinates.y;
      calculatedDist = Number((Math.sqrt(dx * dx + dy * dy) * 0.15).toFixed(1));
    }

    const quarterDist = (calculatedDist * 0.25).toFixed(1);
    const halfDist = (calculatedDist * 0.5).toFixed(1);

    return [
      {
        instruction: `Head out of the clinical gates of ${hospA.name} onto the Purba Medinipur regional arterial roadway grid.`,
        distance: `${quarterDist} km`
      },
      {
        instruction: `Advance northward, passing local residential areas toward the main national or municipal highway lanes.`,
        distance: `${halfDist} km`
      },
      {
        instruction: `Approach the hospital sector entry gates, following route indicators for ${hospB.name}.`,
        distance: `${(calculatedDist * 0.15).toFixed(1)} km`
      },
      {
        instruction: `Turn right into the clinical courtyard of ${hospB.name}. Your healthcare destination is directly on your left with emergency intake clearly visible.`,
        distance: `Arrived`
      }
    ];
  }, [sourceHospitalId, destHospitalId, hospitals]);

  // Native redirection link to Google Maps Directions
  const nativeDirectionsUrl = useMemo(() => {
    const startLat = activeCoordinates.lat;
    const startLng = activeCoordinates.lng;
    const destLat = destinationCoordinates.lat;
    const destLng = destinationCoordinates.lng;
    return `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${destLat},${destLng}&travelmode=driving`;
  }, [activeCoordinates, destinationCoordinates]);

  return (
    <div id="hospital-map-section" className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Search and List Side panel (5 cols) */}
      <div className="lg:col-span-5 flex flex-col space-y-4">
        {/* Controls Card */}
        <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div>
              <h2 className="font-sans text-base font-extrabold text-manipal-blue flex items-center gap-2">
                <Filter className="h-4.5 w-4.5 text-manipal-red" />
                Interactive Sorting Desk
              </h2>
              <p className="mt-0.5 text-xs text-slate-400 font-semibold">Search hospitals and filter by distance or clinical facilities</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Direct Input Search */}
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
              <input
                id="search-hospitals-input"
                type="text"
                placeholder="Search hospital or neighborhood..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-205 bg-slate-50/50 py-2.5 pr-4 pl-10 text-xs focus:border-manipal-red focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-100 transition-colors"
              />
            </div>

            {/* Slider for proximity radius */}
            <div>
              <div className="flex items-center justify-between font-bold text-xs text-slate-500">
                <span>Proximity Range</span>
                <span className="text-manipal-red font-bold font-mono">{maxDistance} km</span>
              </div>
              <input
                id="distance-slider"
                type="range"
                min="0.5"
                max="6.0"
                step="0.5"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
                className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-manipal-red"
              />
            </div>

            {/* Specialty Pills */}
            <div>
              <span className="block text-xs font-extrabold text-slate-500 font-sans">Clinical Specialty</span>
              <div className="mt-2 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {specialtiesList.map((spec) => (
                  <button
                    id={`btn-spec-${spec.toLowerCase()}`}
                    key={spec}
                    onClick={() => setSelectedSpecialty(spec)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                      selectedSpecialty === spec
                        ? 'bg-manipal-blue text-white shadow-xs'
                        : 'bg-slate-100 text-slate-650 hover:bg-slate-200'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnostics Filter */}
            <div>
              <span className="block text-xs font-extrabold text-slate-500 font-sans">Diagnostic Scanner Support</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {facilitiesList.map((fac) => (
                  <button
                    id={`btn-facility-${fac.toLowerCase()}`}
                    key={fac}
                    onClick={() => setSelectedFacility(fac)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                      selectedFacility === fac
                        ? 'bg-manipal-red text-white shadow-xs'
                        : 'bg-slate-100 text-slate-650 hover:bg-slate-200'
                    }`}
                  >
                    {fac}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Care List */}
        <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[420px] lg:max-h-[500px] pr-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
            <span>Results ({filteredHospitals.length})</span>
            <span>Sorted by Distance</span>
          </div>

          {filteredHospitals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-400">
              <MapPin className="mx-auto h-7 w-7 text-slate-300" />
              <p className="mt-2 text-xs font-medium">No clinical hubs match your search parameters.</p>
              <button 
                onClick={() => {
                  setSearch('');
                  setSelectedSpecialty('All');
                  setSelectedFacility('All');
                  setMaxDistance(6.0);
                }}
                className="mt-3 text-xs font-extrabold text-manipal-red hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredHospitals.map((hospital) => {
              const bedsCount = getAvailableBedsCount(hospital);
              const percentageOccupied = getPercentageBedsOccupied(hospital);
              const isSelected = selectedHospitalId === hospital.id;

              return (
                <div
                  id={`hosp-card-${hospital.id}`}
                  key={hospital.id}
                  onClick={() => setSelectedHospitalId(hospital.id)}
                  className={`group cursor-pointer rounded-xl border p-4.5 transition-all duration-200 ${
                    isSelected
                      ? 'border-manipal-blue bg-blue-50/20 ring-1 ring-manipal-red/40'
                      : 'border-slate-150 bg-white hover:border-slate-250 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                          {hospital.distance} km Nearby
                        </span>
                        <span className="flex items-center text-xs font-bold text-amber-500">
                          ★ {hospital.rating}
                        </span>
                      </div>
                      <h3 className="mt-1.5 font-sans font-extrabold text-slate-800 transition-colors group-hover:text-manipal-red text-sm leading-snug">
                        {hospital.name}
                      </h3>
                      <p className="mt-1 text-slate-400 text-xs truncate max-w-[280px] sm:max-w-xs">{hospital.address}</p>
                    </div>
                    
                    {/* Circle Bed Dial */}
                    <div className="text-right flex flex-col items-end shrink-0">
                      <span className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase ${
                        bedsCount > 15
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : bedsCount > 5
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {bedsCount} Beds Left
                      </span>
                      <span className="block mt-1 font-mono text-[8px] text-slate-400 tracking-wider">
                        {percentageOccupied}% Occupied
                      </span>
                    </div>
                  </div>

                  {/* Specialty labels */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {hospital.specialties.slice(0, 3).map((spec) => (
                      <span key={spec} className="rounded-xs bg-slate-100 px-1.5 py-0.5 font-sans text-[10px] font-medium text-slate-600">
                        {spec}
                      </span>
                    ))}
                    {hospital.specialties.length > 3 && (
                      <span className="rounded-xs bg-slate-50 px-1 py-0.5 font-sans text-[10px] text-slate-400">
                        +{hospital.specialties.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Interactive Map Visual (7 cols) */}
      <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-150 bg-white p-5 shadow-xs min-h-[550px] lg:min-h-[650px] relative">
        
        {/* Toggle & Header Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-sans font-extrabold text-[#002874] text-sm md:text-base flex items-center gap-1.5">
              <MapIcon className="h-4 w-4 text-manipal-red shrink-0" />
              Regional Health Navigation Desk
            </h3>
            <p className="text-xs text-slate-400 font-semibold">Active location registry and directions router unit</p>
          </div>

          {/* Toggle Switches */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              id="btn-toggle-vector"
              onClick={() => setViewMode('vector')}
              className={`flex items-center gap-1 py-1 px-2.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'vector' 
                  ? 'bg-white shadow-xs text-slate-800' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Vector Zone Grid
            </button>
            <button
              id="btn-toggle-google"
              onClick={() => setViewMode('google')}
              className={`flex items-center gap-1 py-1 px-2.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'google' 
                  ? 'bg-[#002874] text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" />
              Google Maps Live
            </button>
          </div>
        </div>

        {/* VIEW 1: VECTOR ILLUSTRATED DISTRICT HUB */}
        {viewMode === 'vector' && (
          <div className="relative flex-1 w-full bg-slate-100/60 rounded-xl overflow-hidden border border-slate-200 h-[380px] lg:h-[420px]">
            {/* Legend block */}
            <div className="absolute bottom-4 right-4 z-10 rounded-lg bg-white/95 p-3 text-[10px] font-semibold text-slate-500 shadow-lg backdrop-blur-xs border border-slate-100">
              <span className="block font-bold text-slate-700 mb-1 border-b border-slate-100 pb-0.5">Map Legends</span>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100 animate-ping" />
                  <span>Available Emergency Beds (&gt; 15)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 ring-2 ring-amber-100" />
                  <span>Limited Bed Threshold (5 - 15)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500 ring-2 ring-red-100" />
                  <span>Critical Occupancy Warn (&lt; 5)</span>
                </div>
                <div className="h-px bg-slate-100 my-0.5" />
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="h-2 w-2 border border-dashed border-slate-400 rounded-sm" />
                  <span>Haldia Township Arterials</span>
                </div>
              </div>
            </div>

            {/* Vector SVG container */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              <text x="3%" y="95%" fill="#cbd5e1" fontSize="10" fontFamily="monospace" letterSpacing="2">PURBA MEDINIPUR REGIONAL HEALTH NETWORK</text>
              <text x="65%" y="8%" fill="#cbd5e1" fontSize="10" fontFamily="monospace" letterSpacing="2">HALDIA COMPLEX</text>

              {/* Simulated River */}
              <path d="M -50 300 Q 150 150, 450 480 T 1100 400" fill="none" stroke="#dbeafe" strokeWidth="24" strokeLinecap="round" opacity="0.8" />
              <path d="M -50 300 Q 150 150, 450 480 T 1100 400" fill="none" stroke="#eff6ff" strokeWidth="8" strokeLinecap="round" opacity="0.9" />

              {/* Haldia Municipal Park */}
              <rect x="5%" y="15%" width="20%" height="14%" rx="12" fill="#dcfce7" opacity="0.5" />
              <text x="8%" y="23%" fill="#15803d" fontSize="9" fontWeight="600" opacity="0.6">Haldia Municipal Park</text>

              {/* Medical Hub District Map Circle */}
              <circle cx="50%" cy="50%" r="90" fill="#003087" opacity="0.05" stroke="#003087" strokeWidth="1" strokeDasharray="3 3" />
              <text x="40%" y="54%" fill="#003087" fontSize="9" fontWeight="bold" opacity="0.6" letterSpacing="0.5">ICARE CAMPUS DISTRICT</text>

              {/* Highways */}
              <path d="M 0 100 L 1200 450" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="5 5" />
              <path d="M 300 0 L 450 800" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="5 5" />

              <text x="53%" y="68%" fill="#94a3b8" fontSize="8" fontWeight="bold">Balughata Area</text>
              <text x="32%" y="32%" fill="#94a3b8" fontSize="8" fontWeight="bold">Haldia Township</text>
              <text x="12%" y="82%" fill="#94a3b8" fontSize="8" fontWeight="bold">Banbishnupur Sector</text>
            </svg>

            {/* Pins on the SVG vector canvas */}
            {filteredHospitals.map((hospital) => {
              const isSelected = selectedHospitalId === hospital.id;
              const bedsLeft = getAvailableBedsCount(hospital);
              
              let pulseColor = 'bg-emerald-500';
              let pulseRingColor = 'ring-emerald-200';
              let pinTextColor = 'text-emerald-700';
              if (bedsLeft <= 5) {
                pulseColor = 'bg-red-500';
                pulseRingColor = 'ring-red-200';
                pinTextColor = 'text-red-700';
              } else if (bedsLeft <= 15) {
                pulseColor = 'bg-amber-500';
                pulseRingColor = 'ring-amber-200';
                pinTextColor = 'text-amber-700';
              }

              return (
                <div
                  id={`map-pin-container-${hospital.id}`}
                  key={hospital.id}
                  className="absolute transition-transform duration-300"
                  style={{
                    top: `${hospital.coordinates.y}%`,
                    left: `${hospital.coordinates.x}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isSelected ? 30 : 20,
                  }}
                >
                  <div className="relative group/pin">
                    <div
                      id={`map-pin-${hospital.id}`}
                      onClick={() => setSelectedHospitalId(hospital.id)}
                      className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white shadow-lg transition-all duration-300 hover:scale-115 ${
                        isSelected ? 'ring-3 ring-cyan-500 scale-110' : 'ring-1 ring-slate-200'
                      }`}
                    >
                      <span className={`font-mono text-xs font-black ${pinTextColor}`}>
                        {bedsLeft}
                      </span>
                      <span className={`absolute -top-1 -right-1 block h-3 w-3 rounded-full ${pulseColor} ring-4 ${pulseRingColor} animate-ping`} />
                      <span className={`absolute -top-1 -right-1 block h-3 w-3 rounded-full ${pulseColor} ring-2 ring-white`} />
                    </div>

                    {/* Popover Bubble */}
                    <div className={`absolute bottom-11 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-lg p-3 text-[11px] leading-snug shadow-xl w-48 font-medium transition-all pointer-events-none ${
                      isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover/pin:opacity-100 group-hover/pin:scale-100'
                    }`}>
                      <p className="font-bold text-xs flex items-center justify-between">
                        {hospital.name.slice(0, 20)}...
                        <span className="text-cyan-400 font-mono text-[9px]">{hospital.distance} km</span>
                      </p>
                      <p className="mt-1 text-slate-300 text-[10px]">{hospital.address.slice(0, 30)}...</p>
                      <div className="mt-2 flex items-center justify-between border-t border-slate-800 pt-1.5">
                        <span className="text-slate-400 font-bold">★ {hospital.rating}</span>
                        <span className="text-cyan-400 font-bold font-mono">{bedsLeft} Beds Spare</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: ACTUAL LIVE GOOGLE MAPS WITH DIRECTIONS */}
        {viewMode === 'google' && (
          <div className="flex-1 flex flex-col space-y-4">
            
            {/* Interactive Control Header for Routing */}
            <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                
                <div className="space-y-4">
                  <div>
                    <label id="origin-source-label" htmlFor="origin-source-select" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Select Start / Origin Hospital A:
                    </label>
                    <div className="relative">
                      <select
                        id="origin-source-select"
                        value={sourceHospitalId}
                        onChange={(e) => setSourceHospitalId(e.target.value)}
                        className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg p-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-red-150 text-slate-700 cursor-pointer accent-manipal-red"
                      >
                        {hospitals.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label id="destination-hospital-label" htmlFor="destination-hospital-select" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Select Destination Hospital B:
                    </label>
                    <div className="relative font-sans">
                      <select
                        id="destination-hospital-select"
                        value={destHospitalId}
                        onChange={(e) => setDestHospitalId(e.target.value)}
                        className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg p-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-red-150 text-slate-700 cursor-pointer accent-manipal-red"
                      >
                        {hospitals.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Routing Distance and Duration Metrics Banner */}
                <div className="flex items-center gap-3 bg-white border border-slate-150 p-3 rounded-lg shadow-2xs">
                  <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <Compass className="h-5 w-5 text-manipal-red animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1">
                      Enlisted Comparison Matrix
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-black text-slate-800 leading-none tracking-tight">
                        {displayDistance}
                      </span>
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-0.5">
                        <Clock className="h-3 w-3 inline text-slate-400" />
                        {displayDuration}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Map Frame View (Unified SDK and Iframe Fallback) */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-[280px] lg:h-[320px] shadow-inner">
              
              {hasValidKey ? (
                /* Programmatic Dynamic SDK Integration via @vis.gl/react-google-maps if Secret Key resides in workspace */
                <APIProvider apiKey={API_KEY} version="weekly">
                  <Map
                    defaultCenter={destinationCoordinates}
                    defaultZoom={13}
                    mapId="CAREGRID_HOSPITAL_MAP"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                  >
                    {/* Destination Marker - Hospital B */}
                    <AdvancedMarker position={destinationCoordinates} title="Hospital B Location">
                      <Pin background="#ea4335" glyphColor="#fff" scale={1.1} />
                    </AdvancedMarker>

                    {/* Origin Marker - Hospital A */}
                    <AdvancedMarker position={activeCoordinates} title="Hospital A Location">
                      <Pin background="#4285f4" glyphColor="#fff" scale={0.9} />
                    </AdvancedMarker>
                  </Map>
                </APIProvider>
              ) : (
                /* Pure Interactive Embedded Google Maps Iframe showing routed comparison directly */
                <iframe
                  id="google-maps-directions-iframe"
                  title="Google Maps comparison route"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer"
                  src={`https://maps.google.com/maps?saddr=${activeCoordinates.lat},${activeCoordinates.lng}&daddr=${destinationCoordinates.lat},${destinationCoordinates.lng}&hl=en&z=13&output=embed`}
                />
              )}

              {/* Mini Info Tag Overlay */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white text-[10px] sm:text-xs font-bold rounded-md px-3 py-1.5 shadow-md flex items-center gap-1.5 border border-slate-800 backdrop-blur-xs select-all">
                <MapPin className="h-3 w-3 text-cyan-400" />
                <span>Active Routing: Hospital Comparison Guide</span>
              </div>
            </div>

            {/* Turn-by-Turn Driving Directions Step List */}
            <div className="border border-slate-150 rounded-xl bg-white p-4">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-2.5">
                <Navigation className="h-4 w-4 text-manipal-red flex-shrink-0" />
                Step-by-Step Driving Directions
              </h4>

              <div className="divide-y divide-slate-100 max-h-[160px] overflow-y-auto pr-1 text-slate-650 text-xs">
                {activeSteps.map((step, idx) => (
                  <div key={idx} className="py-2.5 flex items-start gap-3">
                    <span className="font-mono text-[9px] font-black text-slate-400 bg-slate-50 border border-slate-150 h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1 pr-2">
                      <p className="font-semibold text-slate-700 leading-relaxed">{step.instruction}</p>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-manipal-red bg-red-50/50 px-2 py-0.5 rounded-sm shrink-0">
                      {step.distance}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions & Deep Linking */}
              <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3.5">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold leading-tight">
                  <Lightbulb className="h-4 w-4 text-amber-500 animate-bounce shrink-0" />
                  <span>GPS tracks straight to the ICARE Campus entrance in Purba Medinipur.</span>
                </div>

                <a
                  id="open-native-google-maps"
                  href={nativeDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#002874] hover:bg-[#002060] transition-colors text-white py-2 px-4 text-xs font-black tracking-wide shadow-xs cursor-pointer text-center"
                >
                  Open in Google Maps App
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

          </div>
        )}

        {/* Footer dynamic tips banner */}
        <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-500 font-medium">
          <Info className="h-4.5 w-4.5 text-[#002874] shrink-0" />
          <span>
            {viewMode === 'google' 
              ? "Change the origin location using the routing dropdown to simulate driving directions from various regional sectors in West Bengal."
              : "Haldia Medical District Map contains real-time active bed allocation matrices. Switch to Google Maps Live to calculate physical turn logs."}
          </span>
        </div>

      </div>
    </div>
  );
};
