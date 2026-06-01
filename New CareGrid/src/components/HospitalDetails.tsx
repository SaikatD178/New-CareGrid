import React, { useState } from 'react';
import { useMedical } from '../context/MedicalContext';
import { Hospital, Doctor, Ward, Bed, TestingFacility, Review } from '../types';
import { 
  X, Phone, Mail, MapPin, Award, CheckCircle2, FlaskConical, Stethoscope, BedDouble, 
  TrendingUp, Clock, Info, User, Star, Plus, ThumbsUp, Calendar, ArrowLeft, Eye, ShieldCheck, CreditCard, Layers, Navigation,
  HeartPulse, Search, Activity, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const HospitalDetails: React.FC = () => {
  const { 
    hospitals, 
    selectedHospitalId, 
    setSelectedHospitalId, 
    bookAppointment, 
    updateBedStatus, 
    addReviewToDoctor,
    isAdmin,
    currentUser,
    registerUser,
    loginUser
  } = useMedical();

  const hospital = hospitals.find(h => h.id === selectedHospitalId);

  // Active sub-tab inside the Hospital Panel
  const [activeTab, setActiveTab] = useState<'doctors' | 'facilities' | 'beds'>('doctors');
  const [selectedWardId, setSelectedWardId] = useState<string>('');
  const [selectedDiagnosticCategory, setSelectedDiagnosticCategory] = useState<string>('All');
  
  // Interactive Bed Layout Search, Filter and Selection States
  const [bedSearchQuery, setBedSearchQuery] = useState<string>('');
  const [bedStatusFilter, setBedStatusFilter] = useState<'All' | 'available' | 'occupied' | 'reserved'>('All');
  const [activeInteractBedId, setActiveInteractBedId] = useState<string | null>(null);
  
  // States for Booking Modals
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [bookingFacility, setBookingFacility] = useState<TestingFacility | null>(null);
  const [bookingBed, setBookingBed] = useState<{ ward: Ward; bed: Bed } | null>(null);

  // Appointment Form state
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientAge, setPatientAge] = useState<number>(35);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [estimateDays, setEstimateDays] = useState<number>(3);
  const [bookingDate, setBookingDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [appointmentReason, setAppointmentReason] = useState('');

  // Doctor Review Form
  const [reviewFormDoctorId, setReviewFormDoctorId] = useState<string | null>(null);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewStars, setReviewStars] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');

  // Help alert states
  const [bedSuccessMessage, setBedSuccessMessage] = useState<string | null>(null);

  // Carousel Slide State
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  // Modal Auth states
  const [modalAuthTab, setModalAuthTab] = useState<'signin' | 'signup'>('signin');
  const [modalEmail, setModalEmail] = useState('');
  const [modalPassword, setModalPassword] = useState('');
  const [modalName, setModalName] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalDob, setModalDob] = useState('');
  const [modalEmergency, setModalEmergency] = useState('');
  const [modalAuthError, setModalAuthError] = useState<string | null>(null);
  const [modalAuthSuccess, setModalAuthSuccess] = useState<string | null>(null);

  const handleModalAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalAuthError(null);
    setModalAuthSuccess(null);

    if (modalAuthTab === 'signin') {
      if (!modalEmail || !modalPassword) {
        setModalAuthError('Please fill out all fields.');
        return;
      }
      const res = await loginUser(modalEmail, modalPassword);
      if (res.success) {
        setModalAuthSuccess('Successfully logged in! Restoring form.');
        setModalEmail('');
        setModalPassword('');
      } else {
        setModalAuthError(res.error || 'Authentication failed.');
      }
    } else {
      if (!modalName || !modalEmail || !modalPhone || !modalDob || !modalPassword || !modalEmergency) {
        setModalAuthError('Please fill out all mandatory fields.');
        return;
      }
      if (modalPassword.length < 5) {
        setModalAuthError('Password must be at least 5 characters long.');
        return;
      }
      const userData = {
        name: modalName,
        email: modalEmail,
        phone: modalPhone,
        dob: modalDob,
        bloodGroup: 'O+',
        gender: 'Male' as const,
        medicalHistory: 'No conditions reported',
        emergencyContact: modalEmergency
      };
      const res = await registerUser(userData, modalPassword);
      if (res.success) {
        setModalAuthSuccess('Account authorized successfully!');
        setModalName('');
        setModalEmail('');
        setModalPhone('');
        setModalDob('');
        setModalEmergency('');
        setModalPassword('');
      } else {
        setModalAuthError(res.error || 'Failed to register.');
      }
    }
  };

  // Pre-fill Patient details if logged in
  React.useEffect(() => {
    if (currentUser) {
      setPatientName(currentUser.name);
      setPatientPhone(currentUser.phone);
      setPatientEmail(currentUser.email || '');
      if (currentUser.dob) {
        const birthYear = new Date(currentUser.dob).getFullYear();
        if (!isNaN(birthYear)) {
          setPatientAge(new Date().getFullYear() - birthYear);
        }
      }
      if (currentUser.gender) {
        setPatientGender(currentUser.gender);
      }
    } else {
      setPatientName('');
      setPatientPhone('');
      setPatientEmail('');
      setPatientAge(35);
      setPatientGender('Male');
    }
  }, [currentUser]);

  if (!hospital) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white p-12 text-center text-slate-500 shadow-md">
        <p className="text-sm font-semibold">Select an institution from the city registry to investigate details.</p>
      </div>
    );
  }

  // Set default ward if not selected yet
  if (!selectedWardId && hospital && Array.isArray(hospital.wards) && hospital.wards.length > 0) {
    setSelectedWardId(hospital.wards[0].id);
  }

  const selectedWard = hospital && Array.isArray(hospital.wards) ? hospital.wards.find(w => w && w.id === selectedWardId) : undefined;

  // Stats
  const getTotals = () => {
    let tot = 0;
    let occ = 0;
    if (hospital && Array.isArray(hospital.wards)) {
      hospital.wards.forEach(w => {
        if (w && Array.isArray(w.beds)) {
          tot += w.beds.length;
          occ += w.beds.filter(b => b && b.status !== 'available').length;
        }
      });
    }
    return { total: tot, occupied: occ, available: tot - occ };
  };

  const stats = getTotals();

  // Handle appointment submission (Doctor consult / diagnostics facility)
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientPhone || !bookingDate) {
      alert('Please fill out all patient information fields.');
      return;
    }

    if (bookingDoctor) {
      bookAppointment({
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        type: 'doctor',
        itemId: bookingDoctor.id,
        itemName: bookingDoctor.name,
        itemDetail: bookingDoctor.specialty,
        patientName,
        patientPhone,
        patientEmail,
        patientAge,
        patientGender,
        date: bookingDate,
        timeSlot: selectedSlot || bookingDoctor.timings[0],
        reason: appointmentReason || 'Routine consultation',
      });
      alert(`Successfully scheduled consultation with ${bookingDoctor.name} on ${bookingDate}!`);
      setBookingDoctor(null);
    } else if (bookingFacility) {
      bookAppointment({
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        type: 'facility',
        itemId: bookingFacility.id,
        itemName: `${bookingFacility.name} Diagnostic Scan`,
        itemDetail: bookingFacility.description,
        patientName,
        patientPhone,
        patientEmail,
        patientAge,
        patientGender,
        date: bookingDate,
        timeSlot: selectedSlot || '10:00 AM (Priority Scan)',
        reason: appointmentReason || 'Diagnostic clinical scan',
      });
      alert(`Diagnostics reservation logged for ${bookingFacility.name} on ${bookingDate}!`);
      setBookingFacility(null);
    }

    // Reset Form fields
    if (currentUser) {
      setPatientName(currentUser.name);
      setPatientPhone(currentUser.phone);
      setPatientEmail(currentUser.email || '');
      if (currentUser.dob) {
        const birthYear = new Date(currentUser.dob).getFullYear();
        if (!isNaN(birthYear)) setPatientAge(new Date().getFullYear() - birthYear);
      }
      setPatientGender(currentUser.gender);
    } else {
      setPatientName('');
      setPatientPhone('');
      setPatientEmail('');
      setPatientAge(35);
      setPatientGender('Male');
    }
    setBookingDate('');
    setSelectedSlot('');
    setAppointmentReason('');
  };

  // Bed check-in direct (BookMyShow Style click)
  const handleBedBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientPhone) {
      alert('Please enter patient identification.');
      return;
    }

    if (bookingBed) {
      updateBedStatus(
        hospital.id,
        bookingBed.ward.id,
        bookingBed.bed.id,
        'occupied',
        {
          patientName,
          patientAge,
          gender: patientGender,
          admissionReason: `Ward Check-In (Apollo Standard Emergency Room)`
        }
      );

      // Log a diagnostic or direct triage record
      bookAppointment({
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        type: 'facility',
        itemId: bookingBed.bed.id,
        itemName: `${bookingBed.ward.name} - Bed ${bookingBed.bed.number}`,
        itemDetail: 'Immediate Patient Admission & Bed Allocation',
        patientName,
        patientPhone,
        patientEmail,
        patientAge,
        patientGender,
        date: new Date().toISOString().split('T')[0],
        timeSlot: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bedId: bookingBed.bed.id,
        wardId: bookingBed.ward.id,
      });

      setBedSuccessMessage(`Successfully booked & assigned Bed ${bookingBed.bed.number} to ${patientName}!`);
      setTimeout(() => setBedSuccessMessage(null), 4000);
      setBookingBed(null);
    }

    if (currentUser) {
      setPatientName(currentUser.name);
      setPatientPhone(currentUser.phone);
      setPatientEmail(currentUser.email || '');
      if (currentUser.dob) {
        const birthYear = new Date(currentUser.dob).getFullYear();
        if (!isNaN(birthYear)) setPatientAge(new Date().getFullYear() - birthYear);
      }
      setPatientGender(currentUser.gender);
    } else {
      setPatientName('');
      setPatientPhone('');
      setPatientEmail('');
      setPatientAge(35);
      setPatientGender('Male');
    }
  };

  // Handle Review submission
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor || !reviewComment || !reviewFormDoctorId) return;

    addReviewToDoctor(hospital.id, reviewFormDoctorId, {
      author: reviewAuthor,
      rating: reviewStars,
      comment: reviewComment,
    });

    setReviewFormDoctorId(null);
    setReviewAuthor('');
    setReviewStars(5);
    setReviewComment('');
  };

  return (
    <div id="hospital-pane" className="flex flex-col space-y-6">
      {/* Header Profile Navigation back */}
      <button
        id="btn-back-to-registry"
        onClick={() => setSelectedHospitalId(null)}
        className="flex self-start items-center gap-1.5 rounded-lg border border-slate-150 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Regional Registry
      </button>

       {/* Main institutional layout summary card */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
        <div className="relative h-48 sm:h-64 md:h-72 w-full bg-slate-950 overflow-hidden group/carousel">
          {(() => {
            const slides = hospital.photos && hospital.photos.length > 0 
              ? hospital.photos 
              : [hospital.image];
            
            // Safety bound check
            const safeIdx = currentSlideIndex >= slides.length ? 0 : currentSlideIndex;
            const currentImg = slides[safeIdx];

            const nextSlide = () => {
              setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
            };

            const prevSlide = () => {
              setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
            };

            return (
              <>
                {/* Images slide panel */}
                <AnimatePresence mode="wait">
                  <motion.img
                    key={safeIdx}
                    src={currentImg}
                    alt={`${hospital.name} Slide #${safeIdx + 1}`}
                    initial={{ opacity: 0.85, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0.85, filter: 'blur(4px)' }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = hospital.image;
                    }}
                  />
                </AnimatePresence>

                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-black/25" />

                {/* Nav Arrows */}
                {slides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevSlide();
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 sm:p-2.5 rounded-full transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-105 cursor-pointer backdrop-blur-xs select-none flex items-center justify-center border border-white/10"
                      aria-label="Previous Slide"
                    >
                      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextSlide();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 sm:p-2.5 rounded-full transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-105 cursor-pointer backdrop-blur-xs select-none flex items-center justify-center border border-white/10"
                      aria-label="Next Slide"
                    >
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>

                    {/* Pagination indicators Dots */}
                    <div className="absolute bottom-6 right-6 z-10 hidden sm:flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full border border-white/10 text-[10px] font-mono text-white select-none">
                      {safeIdx + 1} / {slides.length}
                    </div>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
                      {slides.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          type="button"
                          onClick={() => setCurrentSlideIndex(dotIdx)}
                          className={`h-1.5 transition-all rounded-full cursor-pointer ${
                            dotIdx === safeIdx 
                              ? 'w-5 bg-cyan-400 shadow-cyan-300 shadow-xs' 
                              : 'w-1.5 bg-white/40 hover:bg-white/80'
                          }`}
                          title={`Go to Slide #${dotIdx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            );
          })()}
          
          <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-end text-white pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-cyan-600/95 px-3 py-1 font-sans text-[10px] font-bold tracking-wider uppercase pointer-events-auto">
                {hospital.distance} km Nearby
              </span>
              <span className="flex items-center text-xs font-bold text-amber-300 pointer-events-auto">
                ★ {hospital.rating} ({hospital.reviewsCount} verified patients)
              </span>
            </div>
            <h1 className="mt-2.5 font-sans text-2xl sm:text-3.5xl font-black tracking-tight text-white leading-tight pointer-events-auto">
              {hospital.name}
            </h1>
            <a 
              href={hospital.gpsCoordinates ? `https://www.google.com/maps/dir/?api=1&destination=${hospital.gpsCoordinates.lat},${hospital.gpsCoordinates.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ' ' + hospital.address)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center text-xs md:text-sm text-slate-205 gap-1.5 hover:text-white transition-colors cursor-pointer group pointer-events-auto"
              title="Click to view live directions in Google Maps"
            >
              <MapPin className="h-4 w-4 shrink-0 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="underline decoration-dotted decoration-cyan-400/40 group-hover:decoration-solid">{hospital.address}</span>
            </a>
          </div>
        </div>

        {/* Dynamic Occupancy Status Bar */}
        <div className="bg-slate-50 border-y border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-1.5">
              <BedDouble className="h-5 w-5 text-cyan-600" />
              <div className="leading-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Capacity</span>
                <span className="font-mono text-sm font-bold text-slate-700">{stats.total} Bed Units</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 ring-4 ring-red-100" />
              <div className="leading-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Occupied</span>
                <span className="font-mono text-sm font-bold text-red-600">{stats.occupied} Units ({Math.round(stats.occupied / stats.total * 100)}%)</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
              <div className="leading-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Patients Space Available</span>
                <span className="font-mono text-sm font-semibold text-emerald-600">{stats.available} Empty Beds</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <a href={`tel:${hospital.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all select-all">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              {hospital.phone}
            </a>
            <a href={`mailto:${hospital.email}`} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all select-all">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              Email Care
            </a>
            <a 
              href={hospital.gpsCoordinates ? `https://www.google.com/maps/dir/?api=1&destination=${hospital.gpsCoordinates.lat},${hospital.gpsCoordinates.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ' ' + hospital.address)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-50 px-3.5 py-1.5 text-xs font-bold text-manipal-red transition-all cursor-pointer"
            >
              <Navigation className="h-3.5 w-3.5 text-manipal-red" />
              Route Directions
            </a>
          </div>
        </div>

        {/* About details & specialties summary */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 space-y-4">
            <h3 className="font-sans text-sm font-bold text-slate-800">Operational Overview</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{hospital.about}</p>
          </div>
          
          <div className="md:col-span-4 rounded-xl bg-slate-50 px-4.5 py-4 border border-slate-100">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">Key Core Care Lanes</span>
            <div className="flex flex-wrap gap-1.5">
              {hospital.specialties.map(spec => (
                <span key={spec} className="rounded-md bg-white border border-slate-150 px-2.5 py-1 font-sans text-xs font-semibold text-cyan-800/90 shadow-2xs">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector for Doctors, Diagnostics and Bed maps */}
      <div className="border-b border-slate-200 flex space-x-6">
        <button
          id="tab-doctors-trigger"
          onClick={() => setActiveTab('doctors')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all relative cursor-pointer ${
            activeTab === 'doctors'
              ? 'border-manipal-red text-manipal-blue font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Stethoscope className="h-4.5 w-4.5 text-manipal-red" />
            Specialist Doctors ({hospital.doctors.length})
          </div>
        </button>

        <button
          id="tab-facilities-trigger"
          onClick={() => setActiveTab('facilities')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all relative cursor-pointer ${
            activeTab === 'facilities'
              ? 'border-manipal-red text-manipal-blue font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <FlaskConical className="h-4.5 w-4.5 text-manipal-red" />
            Diagnostics & Testing Facilities ({hospital.testingFacilities.length})
          </div>
        </button>

        <button
          id="tab-beds-trigger"
          onClick={() => setActiveTab('beds')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all relative cursor-pointer ${
            activeTab === 'beds'
              ? 'border-manipal-red text-manipal-blue font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {/* Pulsing indicator if plenty of space, red warning if close to empty */}
          <span className={`absolute -top-1.5 -right-3 h-2 w-2 rounded-full ${stats.available > 10 ? 'bg-emerald-500 ring-2 ring-emerald-250 animate-pulse' : 'bg-manipal-red animate-ping'}`} />
          <div className="flex items-center gap-1.5">
            <BedDouble className="h-4.5 w-4.5 text-manipal-red" />
            Interactive Ward Bed Layout (BookMyShow Style)
          </div>
        </button>
      </div>

      {/* RENDER ACTIVE TAB BODY */}
      <div id="tab-outlet">
        {/* TAB 1: DOCTOR ROSTERS */}
        {activeTab === 'doctors' && (
          <div id="doctor-roster-pane" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hospital.doctors.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-400">
                <Stethoscope className="mx-auto h-8 w-8 text-slate-350" />
                <p className="mt-2 text-xs font-semibold">No consulting doctors are registered currently. Use Admin Console to write details.</p>
              </div>
            ) : (
              hospital.doctors.map(doctor => (
                <div 
                  id={`doctor-card-${doctor.id}`}
                  key={doctor.id} 
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-2xs hover:border-slate-200 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start space-x-4">
                    <img 
                      src={doctor.photo} 
                      alt={doctor.name} 
                      className="h-16 w-16 rounded-xl object-cover border border-slate-100 shrink-0 shadow-2xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-cyan-50 px-2 py-0.5 font-sans text-[10px] font-bold text-cyan-700">
                          {doctor.specialty}
                        </span>
                        <span className="font-sans text-[11px] text-slate-400 font-medium">
                          {doctor.experience} Exp
                        </span>
                      </div>
                      <h4 className="mt-1 font-sans text-base font-bold text-slate-800">{doctor.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{doctor.bio}</p>
                      
                      <div className="mt-2 flex items-center gap-2">
                        <span className="flex items-center gap-0.5 font-sans text-xs font-bold text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-amber-500" />
                          {doctor.rating}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          Consult Fee: <span className="font-mono text-slate-800">₹{doctor.fee}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Schedulable timeslots */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Available Consulting Slots Today</span>
                    <div className="flex flex-wrap gap-1.5">
                      {doctor.timings.map(time => (
                        <span key={time} className="rounded-md bg-slate-50 font-mono text-[10px] font-medium text-slate-600 px-2 py-1 border border-slate-100">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      id={`btn-book-doctor-${doctor.id}`}
                      onClick={() => setBookingDoctor(doctor)}
                      className="flex-1 rounded-xl bg-cyan-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 transition-colors"
                    >
                      Book Consultation
                    </button>
                    <button
                      id={`btn-open-reviews-doctor-${doctor.id}`}
                      onClick={() => setReviewFormDoctorId(reviewFormDoctorId === doctor.id ? null : doctor.id)}
                      className="rounded-xl border border-slate-150 p-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                      title="Write Review"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Inline Reviews form and history */}
                  {reviewFormDoctorId === doctor.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-slate-100 space-y-4"
                    >
                      {/* Review writing block */}
                      <form onSubmit={handleReviewSubmit} className="bg-slate-50/50 p-3 rounded-xl border border-slate-150 space-y-2.5">
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Review Consultation Quality</span>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Your Name"
                            required
                            value={reviewAuthor}
                            onChange={(e) => setReviewAuthor(e.target.value)}
                            className="rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                          />
                          <select
                            value={reviewStars}
                            onChange={(e) => setReviewStars(Number(e.target.value))}
                            className="rounded-lg bg-white border border-slate-200 px-2 py-1.5 text-xs text-slate-600"
                          >
                            <option value="5">★ 5 Stars (Ideal)</option>
                            <option value="4">★ 4 Stars (Good)</option>
                            <option value="3">★ 3 Stars (Average)</option>
                            <option value="2">★ 2 Stars (Poor)</option>
                            <option value="1">★ 1 Star (Awful)</option>
                          </select>
                        </div>
                        
                        <input
                          type="text"
                          placeholder="Tell patients about your clinical consult experience..."
                          required
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-cyan-500"
                        />

                        <div className="flex justify-end gap-2 text-[10px]">
                          <button 
                            type="button" 
                            onClick={() => setReviewFormDoctorId(null)}
                            className="px-2.5 py-1 text-slate-400 font-semibold"
                          >
                            Close
                          </button>
                          <button 
                            type="submit" 
                            className="bg-cyan-600 text-white font-bold px-3 py-1 rounded-lg"
                          >
                            Submit Verify Review
                          </button>
                        </div>
                      </form>

                      {/* Review Feed */}
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Patient Testimonials ({doctor.reviews.length})</span>
                        <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
                          {doctor.reviews.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic">No feedback comments logged yet.</p>
                          ) : (
                            doctor.reviews.map(rev => (
                              <div key={rev.id} className="text-xs border-b border-slate-100 pb-2">
                                <div className="flex justify-between text-slate-500 font-semibold">
                                  <span>{rev.author}</span>
                                  <span className="text-amber-500 font-mono text-[10px]">★ {rev.rating}</span>
                                </div>
                                <p className="text-slate-600 mt-0.5 text-[11px]">{rev.comment}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: DIAGNOSTIC TESTING SERVICES */}
        {activeTab === 'facilities' && hospital && (
          <div className="space-y-6">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
              {[
                { label: 'All Services', value: 'All' },
                { label: 'Non-Invasive Diagnostic', value: 'Non-Invasive Diagnostic' },
                { label: 'Radiology Diagnostics', value: 'Radiology Diagnostics' },
                { label: 'Specialty Clinics', value: 'Clinic' },
                { label: 'Pathology & Microbiology', value: 'Pathology and Microbiology' }
              ].map(pill => {
                const count = pill.value === 'All' 
                  ? hospital.testingFacilities.length 
                  : hospital.testingFacilities.filter(f => f.category === pill.value).length;
                const isSelected = selectedDiagnosticCategory === pill.value;
                
                return (
                  <button
                    key={pill.value}
                    onClick={() => setSelectedDiagnosticCategory(pill.value)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
                        : 'bg-slate-55 border-slate-150 text-slate-600 hover:bg-slate-150'
                    }`}
                  >
                    <span>{pill.label}</span>
                    <span className={`inline-block text-[10px] rounded-full px-1.5 font-bold ${
                      isSelected ? 'bg-teal-800 text-teal-100' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Diagnostic list container */}
            <div id="diagnostic-tests-pane" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 animate-fadeIn">
              {hospital.testingFacilities
                .filter(facility => selectedDiagnosticCategory === 'All' || facility.category === selectedDiagnosticCategory)
                .map(facility => (
                  <div 
                    id={`facility-card-${facility.id}`}
                    key={facility.id} 
                    className="rounded-xl border border-slate-100 bg-white p-5 shadow-3xs flex flex-col justify-between hover:border-slate-200 transition-all hover:shadow-xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-md bg-teal-50 px-2 py-0.5 font-mono text-[10px] font-bold text-teal-700 leading-normal">
                          {facility.category || 'General Diagnostic'}
                        </span>
                        <span className="font-mono text-sm font-extrabold text-slate-800 shrink-0">₹{facility.price}</span>
                      </div>
                      
                      <h4 className="mt-3 font-sans font-bold text-sm text-slate-800 leading-snug">
                        {facility.name}
                      </h4>
                      <p className="mt-1.5 text-slate-500 text-xs leading-relaxed line-clamp-3" title={facility.description}>
                        {facility.description}
                      </p>
                      
                      <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-500 font-medium">
                        <div className="flex items-center justify-between">
                          <span>Standard duration:</span>
                          <span className="text-slate-800 font-bold font-mono">{facility.duration}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Clinical Schedule:</span>
                          <span className="text-teal-700 font-bold">{facility.availability}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Requires referral note:</span>
                          <span className={`font-bold ${facility.requiresPrescription ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {facility.requiresPrescription ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      id={`btn-book-facility-${facility.id}`}
                      onClick={() => setBookingFacility(facility)}
                      className="mt-4.5 w-full rounded-xl bg-teal-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition-colors"
                    >
                      Book Diagnostics Spot
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 3: VISUAL INTERACTIVE WARD MAP (THE BOOKMYSHOW SEAT MAP EQUIVALENT) */}
        {activeTab === 'beds' && (
          <div id="visual-bed-map-pane" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-6">
            
            {/* Inline CSS Keyframes for Telemetry & Bed selection */}
            <style>{`
              @keyframes blink-green {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 1; }
              }
              .animate-blink-green {
                animation: blink-green 2s infinite;
              }
              @keyframes pulse-ring {
                0% { transform: scale(0.95); opacity: 0.8; }
                50% { transform: scale(1.05); opacity: 0.4; }
                100% { transform: scale(0.95); opacity: 0.8; }
              }
              .animate-ring {
                animation: pulse-ring 2.5s infinite ease-in-out;
              }
              @keyframes waveMove {
                0% { stroke-dashoffset: 400; }
                100% { stroke-dashoffset: 0; }
              }
              .animate-wave {
                stroke-dasharray: 400;
                animation: waveMove 6s linear infinite;
              }
            `}</style>

            {/* Header Help Alert */}
            {bedSuccessMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-emerald-100 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800 text-center shadow-xs"
              >
                {bedSuccessMessage}
              </motion.div>
            )}

            {/* Ward selector and Statistics dashboard */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap gap-1.5">
                  {hospital.wards.map(ward => {
                    const availableCount = ward.beds.filter(b => b.status === 'available').length;
                    const isSelected = selectedWardId === ward.id;
                    
                    return (
                      <button
                        id={`btn-select-ward-${ward.id}`}
                        key={ward.id}
                        onClick={() => {
                          setSelectedWardId(ward.id);
                          setActiveInteractBedId(null); // reset focused bed
                        }}
                        className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-600 border-cyan-800 text-white shadow-xs'
                            : 'bg-white border-slate-150 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Layers className="h-3.5 w-3.5" />
                        {ward.name}
                        <span className={`inline-block ml-1 rounded-full px-1.5 py-0.2 font-mono text-[9px] font-bold ${
                          isSelected ? 'bg-cyan-800 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {availableCount} Vacant
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search & Status Filter Controls */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  <div className="relative flex-1 sm:max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search bed# or occupant Name..."
                      value={bedSearchQuery}
                      onChange={(e) => setBedSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:outline-hidden focus:border-cyan-500 font-medium"
                    />
                    {bedSearchQuery && (
                      <button
                        onClick={() => setBedSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-slate-100 hover:bg-slate-200 rounded px-1 text-slate-500 font-bold"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                    {(['All', 'available', 'occupied', 'reserved'] as const).map(filter => (
                      <button
                        key={filter}
                        onClick={() => setBedStatusFilter(filter)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md capitalize transition-all cursor-pointer ${
                          bedStatusFilter === filter
                            ? 'bg-white text-cyan-705 shadow-3xs border-slate-150 border'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {filter === 'available' ? 'Vacant' : filter === 'All' ? 'All' : filter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mini Ward Progress Stats bar */}
              {selectedWard && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs font-semibold">
                  {/* Total capacity status */}
                  <div className="flex items-center gap-3">
                    <div className="h-8.5 w-8.5 rounded-lg bg-cyan-100/80 flex items-center justify-center text-cyan-700">
                      <BedDouble className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">WARD CAPACITY STATUS</p>
                      <p className="text-slate-750 font-bold">
                        {selectedWard.beds.length} Total Registered Beds
                      </p>
                    </div>
                  </div>

                  {/* Occupancy percentage and active progress bar */}
                  <div className="md:col-span-2 space-y-1.5">
                    {(() => {
                      const total = selectedWard.beds.length;
                      const occupied = selectedWard.beds.filter(b => b.status === 'occupied').length;
                      const reserved = selectedWard.beds.filter(b => b.status === 'reserved').length;
                      const available = selectedWard.beds.filter(b => b.status === 'available').length;
                      const occPercent = Math.round((occupied / total) * 100) || 0;
                      const resPercent = Math.round((reserved / total) * 100) || 0;

                      return (
                        <>
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-slate-500 uppercase tracking-wide">LIVE OCCUPATION LOADING</span>
                            <span className="font-mono text-cyan-800 font-heavy">
                              {occPercent}% Occupied | {resPercent}% Reserved | {available} Free
                            </span>
                          </div>
                          {/* Segmented Progress tracker bar */}
                          <div className="h-2 w-full rounded-full bg-slate-205 overflow-hidden flex">
                            <div className="bg-slate-500 h-full transition-all duration-300" style={{ width: `${occPercent}%` }} title="Occupied Beds" />
                            <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${resPercent}%` }} title="Reserved Holds" />
                            <div className="bg-emerald-500 h-full transition-all duration-300 flex-1" title="Available Vacancies" />
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {selectedWard ? (
              <div id="ward-grid-visualizer" className="space-y-6">
                
                {/* Legends box */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 px-4 py-3 rounded-xl border border-slate-150">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5 text-cyan-600 animate-pulse" />
                    Interactive Grid Elevation
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 rounded bg-white border border-slate-300 shadow-3xs block" />
                      <span>Vacant (Selectable)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 rounded bg-slate-500 shadow-3xs block" />
                      <span>Occupied (Inspect patient)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 rounded bg-amber-500 shadow-3xs block" />
                      <span>Reserved</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left block: Ward Bed selection Map (BookMyShow styled) */}
                  <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center">
                    
                    {/* Central clinic monitoring desk screen visual placeholder */}
                    <div className="w-full bg-gradient-to-r from-cyan-700 via-cyan-800 to-cyan-900 text-white text-center py-2.5 rounded-lg shadow-sm text-[10px] font-extrabold uppercase tracking-widest mb-10 select-none flex items-center justify-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                      ⭐ CENTRAL CLINIC MONITORING DESK GRID (WARD ELEVATION) ⭐
                    </div>

                    {/* Ward Beds aligned elegantly as clickable, responsive micro-cards */}
                    <div 
                      className="grid gap-4 justify-center w-full"
                      style={{
                        gridTemplateColumns: `repeat(${selectedWard.columns || 4}, minmax(55px, 1fr))`
                      }}
                    >
                      {selectedWard.beds.map((bed) => {
                        const isSelected = activeInteractBedId === bed.id;
                        
                        // Evaluate filters
                        const matchesSearch = !bedSearchQuery.trim() || 
                          bed.number.toLowerCase().includes(bedSearchQuery.toLowerCase()) ||
                          (bed.patientName && bed.patientName.toLowerCase().includes(bedSearchQuery.toLowerCase())) ||
                          (bed.admissionReason && bed.admissionReason.toLowerCase().includes(bedSearchQuery.toLowerCase()));
                        
                        const matchesStatus = bedStatusFilter === 'All' || bed.status === bedStatusFilter;
                        const isFilteredOut = !(matchesSearch && matchesStatus);

                        let bgClass = 'bg-white border-slate-300 text-slate-705 text-cyan-600';
                        let labelColor = 'text-slate-500 font-bold';
                        let ringAccent = 'hover:border-cyan-500 hover:shadow-cyan-100 hover:shadow-sm';

                        if (bed.status === 'occupied') {
                          bgClass = 'bg-slate-100 border-slate-400 text-slate-600';
                          labelColor = 'text-slate-600 font-bold';
                          ringAccent = 'hover:shadow-slate-200 border-slate-300';
                        } else if (bed.status === 'reserved') {
                          bgClass = 'bg-amber-50 border-amber-300 text-amber-600';
                          labelColor = 'text-amber-805 font-bold';
                          ringAccent = 'hover:shadow-amber-100 border-amber-200';
                        }

                        // Overlay blue pulsing highlight for clicked chosen bed
                        if (isSelected) {
                          bgClass = bed.status === 'available' 
                            ? 'bg-cyan-50 border-2 border-cyan-500 ring-2 ring-cyan-200 text-cyan-700 shadow-sm'
                            : 'bg-cyan-50 border-2 border-cyan-400 ring-2 ring-cyan-200 text-cyan-800 shadow-sm';
                        }

                        return (
                          <motion.button
                            id={`bed-node-${bed.id}`}
                            key={bed.id}
                            type="button"
                            onClick={() => {
                              setActiveInteractBedId(bed.id);
                            }}
                            whileHover={isFilteredOut ? {} : { scale: 1.06, y: -2 }}
                            whileTap={isFilteredOut ? {} : { scale: 0.96 }}
                            className={`relative flex flex-col justify-center items-center h-16 rounded-xl border-1.5 transition-all outline-hidden cursor-pointer ${bgClass} ${ringAccent} ${
                              isFilteredOut ? 'opacity-15 pointer-events-none' : ''
                            }`}
                          >
                            {/* Inner Bed icon or patient silhouette status */}
                            {bed.status === 'occupied' ? (
                              <div className="relative">
                                <User className="h-5 w-5 shrink-0 text-slate-500" />
                                <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-blink-green" />
                              </div>
                            ) : bed.status === 'reserved' ? (
                              <Clock className="h-5 w-5 shrink-0 text-amber-500" />
                            ) : (
                              <BedDouble className={`h-5.5 w-5.5 shrink-0 transition-colors ${isSelected ? 'text-cyan-600 animate-bounce' : 'text-slate-400'}`} />
                            )}

                            <span className={`font-mono text-[9px] mt-1 tracking-wider ${labelColor}`}>
                              {bed.number.split('-')[1] || bed.number}
                            </span>

                            {/* Floating indicators */}
                            {isSelected && (
                              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-600 text-[8px] font-extrabold text-white animate-ring border border-white">
                                ✓
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    <p className="text-[10px] text-slate-400 font-semibold tracking-wide text-center mt-6">
                      💡 Scroll & hover for vital highlights. Click any unit to lock allocation or view bedside telemedicine charts.
                    </p>
                  </div>

                  {/* Right block: Actionable Context Deck / Telemetry health charts */}
                  <div className="lg:col-span-4 self-stretch">
                    <AnimatePresence mode="wait">
                      {(() => {
                        // Find matching bed metadata corresponding to selected index
                        const activeBed = selectedWard.beds.find(b => b.id === activeInteractBedId);
                        
                        if (!activeBed) {
                          return (
                            <motion.div
                              key="no-selection"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50 h-full flex flex-col items-center justify-center min-h-[300px]"
                            >
                              <div className="h-12 w-12 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 mb-4 animate-bounce">
                                <BedDouble className="h-6 w-6" />
                              </div>
                              <h4 className="font-sans text-xs font-bold text-slate-7002 uppercase tracking-widest text-slate-500">Select Hospital Bed</h4>
                              <p className="mt-2 text-[11px] text-slate-450 leading-relaxed max-w-[200px] mx-auto text-center">
                                Click any ward node on the left to inspect occupant clinical notes, review continuous vitals telemetry, or register a secure emergency admission hold.
                              </p>
                            </motion.div>
                          );
                        }

                        // Stable vitals calculator
                        const getStableVitals = (bedId: string) => {
                          let hash = 0;
                          for (let i = 0; i < bedId.length; i++) {
                            hash = bedId.charCodeAt(i) + ((hash << 5) - hash);
                          }
                          hash = Math.abs(hash);
                          const hr = 62 + (hash % 28);
                          const bpSys = 112 + (hash % 16);
                          const bpDia = 72 + (hash % 12);
                          const spo2 = 96 + (hash % 4);
                          const temp = (97.8 + (hash % 15) / 10).toFixed(1);
                          return { hr, bpSys, bpDia, spo2, temp };
                        };

                        const vitals = getStableVitals(activeBed.id);

                        // Layout A: VACANT BED -> DIRECT INLINE BOOKING
                        if (activeBed.status === 'available') {
                          return (
                            <motion.div
                              key={`booking-pane-${activeBed.id}`}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="rounded-2xl border border-cyan-200 bg-white shadow-md p-5 space-y-4 h-full"
                            >
                              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                  <span className="bg-cyan-100 text-cyan-800 text-[9px] font-sans font-bold tracking-widest uppercase rounded px-1.5 py-0.5">
                                    Direct Triage Unit
                                  </span>
                                  <h4 className="font-sans text-xs font-heavy text-slate-800 mt-1 uppercase">
                                    Unit {activeBed.number} Reservation
                                  </h4>
                                </div>
                                <span className="font-mono text-xs font-bold text-cyan-800">
                                  ₹{selectedWard.pricePerDay}/Day
                                </span>
                              </div>

                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  if (!patientName || !patientPhone) {
                                    alert('Please enter patient identification.');
                                    return;
                                  }

                                  updateBedStatus(
                                    hospital.id,
                                    selectedWard.id,
                                    activeBed.id,
                                    'occupied',
                                    {
                                      patientName,
                                      patientAge,
                                      gender: patientGender,
                                      admissionReason: `Ward Check-In (Direct Patient Portal)`
                                    }
                                  );

                                  bookAppointment({
                                    hospitalId: hospital.id,
                                    hospitalName: hospital.name,
                                    type: 'facility',
                                    itemId: activeBed.id,
                                    itemName: `${selectedWard.name} - Unit ${activeBed.number}`,
                                    itemDetail: 'Immediate Ward Slot Hold reservation',
                                    patientName,
                                    patientPhone,
                                    patientEmail,
                                    patientAge,
                                    patientGender,
                                    date: new Date().toISOString().split('T')[0],
                                    timeSlot: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                    bedId: activeBed.id,
                                    wardId: selectedWard.id,
                                  });

                                  setBedSuccessMessage(`Secured hold on Bed Unit ${activeBed.number} for Patient ${patientName}!`);
                                  setTimeout(() => setBedSuccessMessage(null), 4000);
                                  setActiveInteractBedId(null);
                                }}
                                className="space-y-3"
                              >
                                <div>
                                  <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">Patient full Name</label>
                                  <input
                                    type="text"
                                    required
                                    value={patientName}
                                    onChange={(e) => setPatientName(e.target.value)}
                                    placeholder="e.g., Jonathan Harker"
                                    className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-cyan-500"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                  <div>
                                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">Age</label>
                                    <input
                                      type="number"
                                      required
                                      min="1"
                                      max="120"
                                      value={patientAge}
                                      onChange={(e) => setPatientAge(parseInt(e.target.value) || 30)}
                                      className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-cyan-500 font-mono"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">Gender</label>
                                    <select
                                      value={patientGender}
                                      onChange={(e) => setPatientGender(e.target.value as any)}
                                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 pl-2 py-1.5 text-xs focus:outline-hidden text-slate-600"
                                    >
                                      <option value="Male">Male</option>
                                      <option value="Female">Female</option>
                                      <option value="Other">Other</option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">Contact Phone Contact</label>
                                      <input
                                        type="tel"
                                        required
                                        value={patientPhone}
                                        onChange={(e) => setPatientPhone(e.target.value)}
                                        placeholder="+91 XXXXX XXXXX"
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-cyan-500 font-mono"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">Contact Email</label>
                                      <input
                                        type="email"
                                        required
                                        value={patientEmail}
                                        onChange={(e) => setPatientEmail(e.target.value)}
                                        placeholder="robert@example.com"
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-cyan-500 font-mono"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Dynamic Estimate Admittance Slider Tracker */}
                                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 space-y-1.5 shadow-3xs">
                                  <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-550 uppercase tracking-wide">
                                    <span>PLANNED EST. ADMITTANCE</span>
                                    <span className="font-mono text-cyan-800 text-xs font-black">{estimateDays} Days</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    value={estimateDays}
                                    onChange={(e) => setEstimateDays(Number(e.target.value))}
                                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600 focus:outline-hidden"
                                  />
                                  <div className="flex justify-between items-center text-[8px] font-bold text-slate-400">
                                    <span>1 Day</span>
                                    <span>30 Days</span>
                                  </div>
                                  <div className="border-t border-slate-100 pt-2 flex justify-between items-center">
                                    <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Est. Coverage Cost:</span>
                                    <span className="font-mono text-xs text-cyan-800 font-black bg-cyan-100/50 px-2 py-0.5 rounded border border-cyan-100">
                                      ₹{selectedWard.pricePerDay * estimateDays}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-[10px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                                  ⚠️ <strong>Automatic holds:</strong> Securing bed occupancy initiates an immediate clinical pre-admission token verified by central nursing admin office.
                                </div>

                                <div className="flex gap-2.5 pt-2">
                                  <button
                                    type="button"
                                    onClick={() => setActiveInteractBedId(null)}
                                    className="rounded-lg border border-slate-200 text-slate-500 text-xs font-semibold px-3 py-2 hover:bg-slate-50 transition-colors w-1/3 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs px-3 py-2 transition-all shadow-3xs flex-1 text-center font-bold cursor-pointer"
                                  >
                                    Lock Unit Now
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          );
                        }

                        // Layout B: OCCUPIED OR RESERVED -> Sleek Clinical ICU Monitor Telemetry chart
                        return (
                          <motion.div
                            key={`vitals-pane-${activeBed.id}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="rounded-2xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden h-full flex flex-col"
                          >
                            {/* Device top monitor bezel */}
                            <div className="bg-slate-900 p-3.5 border-b border-slate-800 flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-[#00ffcc] animate-pulse">
                                <HeartPulse className="h-4 w-4 text-rose-500 fill-rose-500" />
                                LIFE_TRACE BEDSIDE TELEMETRY
                              </span>
                              <span className="rounded-md bg-rose-500/10 border border-rose-500/30 text-[9px] font-mono text-rose-400 px-2 py-0.5 uppercase">
                                Unit {activeBed.number}
                              </span>
                            </div>

                            {/* Electronic Screen */}
                            <div className="p-4 bg-black flex-1 space-y-4">
                              
                              {/* Glowing vital wave (simulated SVG ECG/EKG monitor) */}
                              <div className="bg-slate-950 h-24 rounded-lg relative overflow-hidden border border-slate-900 flex flex-col justify-between p-2">
                                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest select-none z-10">
                                  ECG Lead II (Continuous)
                                </span>
                                
                                {/* ECG graphic line path representation */}
                                <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 40" preserveAspectRatio="none">
                                  <path 
                                    d="M 0,20 L 15,20 L 22,20 L 26,5 L 30,35 L 34,20 L 38,20 L 50,20 L 58,20 L 61,12 L 64,28 L 67,20 L 72,20 L 85,20 L 91,20 L 95,20 L 100,20" 
                                    className="animate-wave"
                                    fill="none" 
                                    stroke="#00ffcc" 
                                    strokeWidth="1.2" 
                                  />
                                </svg>

                                <span className="self-end text-[9px] font-mono text-[#00ffcc] z-10 bg-slate-900/60 px-1 rounded">
                                  {vitals.hr} bpm
                                </span>
                              </div>

                              {/* Vitals reading items block */}
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800 text-left flex flex-col justify-between">
                                  <span className="text-[8px] font-mono text-rose-400 font-extrabold uppercase tracking-wider block">HEART RATE</span>
                                  <div className="flex items-baseline gap-1 mt-1 justify-between">
                                    <span className="font-mono text-base font-extrabold text-rose-500 animate-pulse">
                                      {vitals.hr}
                                    </span>
                                    <span className="text-[8.5px] font-mono text-slate-500 font-bold lowercase">bpm</span>
                                  </div>
                                </div>
                                <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800 text-left flex flex-col justify-between">
                                  <span className="text-[8px] font-mono text-cyan-400 font-extrabold uppercase tracking-wider block">BLOOD PRESSURE</span>
                                  <div className="flex items-baseline gap-1 mt-1 justify-between">
                                    <span className="font-mono text-sm font-extrabold text-cyan-400">
                                      {vitals.bpSys}/{vitals.bpDia}
                                    </span>
                                    <span className="text-[8.5px] font-mono text-slate-500 font-bold lowercase">mmHg</span>
                                  </div>
                                </div>
                                <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800 text-left flex flex-col justify-between">
                                  <span className="text-[8px] font-mono text-emerald-400 font-extrabold uppercase tracking-wider block">PULSE SpO2</span>
                                  <div className="flex items-baseline gap-1 mt-1 justify-between">
                                    <span className="font-mono text-base font-extrabold text-emerald-400">
                                      {vitals.spo2}%
                                    </span>
                                    <span className="text-[8.5px] font-mono text-slate-500 font-bold">Stable</span>
                                  </div>
                                </div>
                                <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800 text-left flex flex-col justify-between">
                                  <span className="text-[8px] font-mono text-amber-550 font-extrabold uppercase tracking-wider block">TEMPERATURE</span>
                                  <div className="flex items-baseline gap-1 mt-1 justify-between">
                                    <span className="font-mono text-base font-extrabold text-amber-500">
                                      {vitals.temp}°F
                                    </span>
                                    <span className="text-[8.5px] font-mono text-slate-500 font-bold">Normal</span>
                                  </div>
                                </div>
                              </div>

                              {/* Patient Clinical info */}
                              <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800">
                                <span className="text-[8px] font-mono text-neutral-400 font-bold uppercase tracking-wider block mb-1.5 pb-1 border-b border-slate-800">
                                  ACTIVE OCCUPANT METADATA
                                </span>
                                <div className="space-y-1 text-[11px] font-mono text-slate-350">
                                  <p className="truncate"><span className="text-neutral-500">Name:</span> <strong className="text-white font-sans">{activeBed.patientName || 'Clinical Emergency Hold'}</strong></p>
                                  <p><span className="text-neutral-500">Sex/Age:</span> {activeBed.gender || 'M'} / {activeBed.patientAge || '41'} Yrs</p>
                                  <p className="line-clamp-2 leading-relaxed"><span className="text-neutral-500">Note:</span> <span className="font-sans text-slate-400">{activeBed.admissionReason || 'Admitted under emergency department protocol'}</span></p>
                                </div>
                              </div>

                              {/* Interactive Nurse Check Chronological Timeline */}
                              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-3 space-y-2 text-left">
                                <span className="text-[8.5px] font-mono text-[#00ffcc] font-extrabold uppercase tracking-widest block pb-1 border-b border-slate-800">
                                  Recent Nurse Check Timeline
                                </span>
                                <div className="space-y-2 font-sans text-[10.5px] text-slate-400">
                                  <div className="flex gap-2.5 items-start">
                                    <span className="text-[8.5px] font-mono text-[#00ffcc] shrink-0 mt-0.5">14:15 - Check</span>
                                    <p className="leading-tight text-slate-350">All telemetry leads validated. Bedside vitals checked and stable.</p>
                                  </div>
                                  <div className="flex gap-2.5 items-start">
                                    <span className="text-[8.5px] font-mono text-slate-500 shrink-0 mt-0.5 font-bold">09:30 - Diagnostic</span>
                                    <p className="leading-tight text-slate-450 text-slate-400 font-sans">Attending clinical practitioner rounds complete. Heart rate range and blood pressure levels are normal.</p>
                                  </div>
                                  <div className="flex gap-2.5 items-start">
                                    <span className="text-[8.5px] font-mono text-slate-500 shrink-0 mt-0.5 font-bold">Daily - Sanitized</span>
                                    <p className="leading-tight text-slate-450 text-slate-400">Sanitary compliance protocols executed. Patient environment status cleared.</p>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setActiveInteractBedId(null)}
                                className="w-full rounded-lg bg-zinc-900 hover:bg-zinc-800 text-slate-350 font-bold text-xs py-2 border border-slate-800 transition-colors text-center cursor-pointer font-sans"
                              >
                                Deselect Bed
                              </button>

                            </div>
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>
                  </div>

                </div>

                <div className="flex gap-2.5 rounded-lg bg-cyan-50/50 p-4 border border-cyan-100 text-xs">
                  <Info className="h-4.5 w-4.5 text-cyan-705 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <p className="font-bold text-cyan-850 leading-none mb-1">Direct Bed-Allotment & Bedside Vitals Telemetry</p>
                    <p className="text-slate-600">
                      Now supports real-time search, vacant bed filtration, clinical selection, direct pre-booking hold registers, and active bedside EKG/Vital signs telemetry simulated directly for registered ward patients!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-xs text-center font-semibold pb-8">Please establish or select a ward configuration above.</p>
            )}
          </div>
        )}
      </div>

      {/* RENDER MODAL LAYOUT FOR PATIENT CLINICAL BOOKING APPOINTMENTS */}
      <AnimatePresence>
        {(bookingDoctor || bookingFacility) && (
          <div id="booking-form-modal" className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-teal-500 text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-sans text-base font-bold">Secure Clinical Registration Form</h3>
                  <span className="block font-sans text-xs text-slate-100 mt-1 truncate max-w-[320px]">
                    To: {hospital.name}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setBookingDoctor(null);
                    setBookingFacility(null);
                  }}
                  className="rounded-full bg-black/15 p-1.5 hover:bg-black/25 transition-colors cursor-pointer text-white"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {!currentUser ? (
                <form onSubmit={handleModalAuthSubmit} className="p-6 space-y-4">
                  <div className="text-center pb-2">
                    <p className="text-xs text-slate-500 font-medium">Please sign in or create a medical profile to confirm booking slots securely.</p>
                  </div>
                  
                  {/* Tab selectors */}
                  <div className="flex border-b border-slate-100 mb-2">
                    <button
                      type="button"
                      onClick={() => { setModalAuthTab('signin'); setModalAuthError(null); }}
                      className={`flex-1 pb-2.5 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${modalAuthTab === 'signin' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-slate-400'}`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setModalAuthTab('signup'); setModalAuthError(null); }}
                      className={`flex-1 pb-2.5 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${modalAuthTab === 'signup' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-slate-400'}`}
                    >
                      Create Profile
                    </button>
                  </div>

                  {modalAuthError && (
                    <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 border border-red-100 font-semibold text-center">
                      {modalAuthError}
                    </div>
                  )}

                  {modalAuthSuccess && (
                    <div className="rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-600 border border-emerald-100 font-semibold text-center animate-pulse">
                      {modalAuthSuccess}
                    </div>
                  )}

                  {modalAuthTab === 'signin' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                        <input
                          type="email"
                          required
                          value={modalEmail}
                          onChange={(e) => setModalEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                        <input
                          type="password"
                          required
                          value={modalPassword}
                          onChange={(e) => setModalPassword(e.target.value)}
                          placeholder="Your profile password"
                          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Legal Name</label>
                        <input
                          type="text"
                          required
                          value={modalName}
                          onChange={(e) => setModalName(e.target.value)}
                          placeholder="e.g. Jane Doe"
                          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                        <input
                          type="email"
                          required
                          value={modalEmail}
                          onChange={(e) => setModalEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                          <input
                            type="tel"
                            required
                            value={modalPhone}
                            onChange={(e) => setModalPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date of Birth</label>
                          <input
                            type="date"
                            required
                            value={modalDob}
                            onChange={(e) => setModalDob(e.target.value)}
                            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 focus:border-cyan-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emergency Contact Phone</label>
                        <input
                          type="tel"
                          required
                          value={modalEmergency}
                          onChange={(e) => setModalEmergency(e.target.value)}
                          placeholder="+91 98765 55555"
                          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password (min 5 chars)</label>
                        <input
                          type="password"
                          required
                          value={modalPassword}
                          onChange={(e) => setModalPassword(e.target.value)}
                          placeholder="Choose password"
                          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-end space-x-3.5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setBookingDoctor(null);
                        setBookingFacility(null);
                      }}
                      className="rounded-lg px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      Close Form
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-gradient-to-r from-cyan-600 to-teal-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-100 hover:from-cyan-700 transition-colors cursor-pointer"
                    >
                      {modalAuthTab === 'signin' ? 'Sign In & Book' : 'Authenticate & Book'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-start gap-3">
                    {bookingDoctor ? (
                      <>
                        <Stethoscope className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider block">Specialist Consultant Consultation</span>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{bookingDoctor.name}</p>
                          <p className="text-slate-400 text-xs">{bookingDoctor.specialty} • Fee: ₹{bookingDoctor.fee}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <FlaskConical className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">Diagnostic Testing Scanning Facility</span>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">Clinical {bookingFacility?.name} scan</p>
                          <p className="text-slate-400 text-xs">{bookingFacility?.description} • Price: ₹{bookingFacility?.price}</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Name</label>
                      <input
                        type="text"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="e.g. Robert Downy"
                        className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Phone</label>
                      <input
                        type="tel"
                        required
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Email</label>
                      <input
                        type="email"
                        required
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="e.g. robert@example.com"
                        className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Age</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="120"
                        value={patientAge}
                        onChange={(e) => setPatientAge(Number(e.target.value))}
                        className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender</label>
                      <select
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value as any)}
                        className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 focus:border-cyan-500 focus:outline-hidden"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Service Date</label>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason for Appointment / Symptoms</label>
                    <textarea
                      required
                      rows={2}
                      value={appointmentReason}
                      onChange={(e) => setAppointmentReason(e.target.value)}
                      placeholder="Describe symptoms, medical query, or reasons for this booking..."
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden focus:ring-1 focus:ring-cyan-500 resize-none font-sans"
                    />
                  </div>

                  {bookingDoctor && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Preferred Time Slot</label>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {bookingDoctor.timings.map(slot => (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`rounded-md px-3 py-1.5 font-mono text-xs transition-colors cursor-pointer ${
                              selectedSlot === slot 
                                ? 'bg-cyan-600 text-white font-bold text-[11px]' 
                                : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-end space-x-3.5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setBookingDoctor(null);
                        setBookingFacility(null);
                      }}
                      className="rounded-lg px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      Cancel Form
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-gradient-to-r from-cyan-600 to-teal-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-100 hover:from-cyan-700 transition-colors"
                    >
                      Confirm Registration Slot
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RENDER MODAL LAYOUT FOR PATIENT BED ALLOCATION HOLDERS */}
      <AnimatePresence>
        {bookingBed && (
          <div id="bed-booking-modal" className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-800 text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-sans text-base font-bold">Immediate Bed Triage Hold</h3>
                  <span className="block font-sans text-xs text-slate-100 mt-1">
                    Institution: {hospital.name}
                  </span>
                </div>
                <button
                  onClick={() => setBookingBed(null)}
                  className="rounded-full bg-black/15 p-1.5 hover:bg-black/25 transition-colors cursor-pointer text-white"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {!currentUser ? (
                <form onSubmit={handleModalAuthSubmit} className="p-6 space-y-4">
                  <div className="text-center pb-2">
                    <p className="text-xs text-slate-500 font-medium">Please sign in or create a medical profile to confirm bed allocations securely.</p>
                  </div>
                  
                  {/* Tab selectors */}
                  <div className="flex border-b border-slate-100 mb-2">
                    <button
                      type="button"
                      onClick={() => { setModalAuthTab('signin'); setModalAuthError(null); }}
                      className={`flex-1 pb-2.5 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${modalAuthTab === 'signin' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-slate-400'}`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setModalAuthTab('signup'); setModalAuthError(null); }}
                      className={`flex-1 pb-2.5 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${modalAuthTab === 'signup' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-slate-400'}`}
                    >
                      Create Profile
                    </button>
                  </div>

                  {modalAuthError && (
                    <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 border border-red-100 font-semibold text-center">
                      {modalAuthError}
                    </div>
                  )}

                  {modalAuthSuccess && (
                    <div className="rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-600 border border-emerald-100 font-semibold text-center animate-pulse">
                      {modalAuthSuccess}
                    </div>
                  )}

                  {modalAuthTab === 'signin' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                        <input
                          type="email"
                          required
                          value={modalEmail}
                          onChange={(e) => setModalEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                        <input
                          type="password"
                          required
                          value={modalPassword}
                          onChange={(e) => setModalPassword(e.target.value)}
                          placeholder="Your profile password"
                          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Legal Name</label>
                        <input
                          type="text"
                          required
                          value={modalName}
                          onChange={(e) => setModalName(e.target.value)}
                          placeholder="e.g. Jane Doe"
                          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                        <input
                          type="email"
                          required
                          value={modalEmail}
                          onChange={(e) => setModalEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                          <input
                            type="tel"
                            required
                            value={modalPhone}
                            onChange={(e) => setModalPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date of Birth</label>
                          <input
                            type="date"
                            required
                            value={modalDob}
                            onChange={(e) => setModalDob(e.target.value)}
                            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 focus:border-cyan-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emergency Contact Phone</label>
                        <input
                          type="tel"
                          required
                          value={modalEmergency}
                          onChange={(e) => setModalEmergency(e.target.value)}
                          placeholder="+91 98765 55555"
                          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password (min 5 chars)</label>
                        <input
                          type="password"
                          required
                          value={modalPassword}
                          onChange={(e) => setModalPassword(e.target.value)}
                          placeholder="Choose password"
                          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-end space-x-3.5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setBookingBed(null)}
                      className="rounded-lg px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors pointer-events-auto"
                    >
                      Close Form
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-gradient-to-r from-cyan-600 to-teal-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-100 hover:from-cyan-700 transition-colors cursor-pointer"
                    >
                      {modalAuthTab === 'signin' ? 'Sign In & Hold' : 'Authenticate & Hold'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleBedBookingSubmit} className="p-6 space-y-4">
                  <div className="rounded-xl border border-dashed border-cyan-200 bg-cyan-50/50 p-4 text-xs space-y-1">
                    <p className="font-bold text-cyan-800">Bed Identification Reservation:</p>
                    <p className="text-slate-600"><strong>Ward Section:</strong> {bookingBed.ward.name}</p>
                    <p className="text-slate-600"><strong>Space Unit:</strong> Bed {bookingBed.bed.number}</p>
                    <p className="text-slate-600"><strong>Allotment charge:</strong> <span className="font-bold font-mono text-cyan-800">₹{bookingBed.ward.pricePerDay}/day</span></p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Admitted Patient Legal Name</label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. John Doe Jr."
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Age</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={patientAge}
                        onChange={(e) => setPatientAge(Number(e.target.value))}
                        className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Gender</label>
                      <select
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value as any)}
                        className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 focus:border-cyan-500 focus:outline-hidden"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Email</label>
                      <input
                        type="email"
                        required
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="e.g. robert@example.com"
                        className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 rounded-lg bg-orange-50 p-3 text-[10px] text-orange-850 border border-orange-100">
                    <CreditCard className="h-4 w-4 text-orange-700 shrink-0 mt-0.5" />
                    <span>By submitting, you instantly lock this bed. Standard clinical insurance claims check-in will run over clinical entry at Apollo.</span>
                  </div>

                  <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setBookingBed(null)}
                      className="rounded-lg px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      Cancel Hold
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-cyan-700 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-cyan-800 transition-colors"
                    >
                      Confirm Bed Allocation Check-In
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
