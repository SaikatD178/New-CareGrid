import React, { useState } from 'react';
import { useMedical } from '../context/MedicalContext';
import { Hospital, Doctor, Ward, TestingFacility, Bed } from '../types';
import { 
  Building2, UserPlus, Trash2, Edit3, Settings, ShieldCheck, UserX, Plus,
  Sparkles, Save, HeartPulse, CheckCircle2, Layers, AlertTriangle, Users, Calendar, Activity, LogOut, RefreshCw,
  Clock, Bed as BedIcon, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminPanel: React.FC = () => {
  const { 
    hospitals, 
    addHospital, 
    updateHospital, 
    deleteHospital,
    addDoctor, 
    updateDoctor, 
    deleteDoctor,
    addTestingFacility,
    deleteTestingFacility,
    updateBedStatus,
    logoutAdmin,
    appointments,
    updateAppointmentStatus
  } = useMedical();

  // Selection states
  const [activeHospitalId, setActiveHospitalId] = useState<string>('');
  const [adminSection, setAdminSection] = useState<'profile' | 'doctors' | 'facilities' | 'beds' | 'bookings' | 'patients'>('profile');
  const [selectedWardId, setSelectedWardId] = useState<string>('');

  // Patient Directory state
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientDoctorFilter, setPatientDoctorFilter] = useState('All');
  const [patientTypeFilter, setPatientTypeFilter] = useState<'All' | 'Repeat' | 'New'>('All');

  // Group appointments by unique patients (Name + Phone)
  const patientsList = React.useMemo(() => {
    const map = new Map<string, {
      name: string;
      phone: string;
      gender: string;
      age: number;
      userId?: string;
      appointments: typeof appointments;
    }>();

    appointments.forEach((app) => {
      const key = `${app.patientName.toLowerCase().trim()}_${app.patientPhone.trim()}`;
      if (!map.has(key)) {
        map.set(key, {
          name: app.patientName,
          phone: app.patientPhone,
          gender: app.patientGender,
          age: app.patientAge,
          userId: app.patientUserId,
          appointments: []
        });
      }
      map.get(key)!.appointments.push(app);
    });

    return Array.from(map.values());
  }, [appointments]);

  // Extract all unique doctor names in the system for filtering
  const allDoctorNames = React.useMemo(() => {
    const names = new Set<string>();
    hospitals.forEach((h) => {
      h.doctors.forEach((d) => {
        names.add(d.name);
      });
    });
    return Array.from(names).sort();
  }, [hospitals]);

  // Process filters for Patient Directory
  const filteredPatients = React.useMemo(() => {
    return patientsList.filter((pat) => {
      // 1. Search filter (Name or Phone matching search keyword)
      if (patientSearchQuery.trim()) {
        const query = patientSearchQuery.toLowerCase();
        const matchesName = pat.name.toLowerCase().includes(query);
        const matchesPhone = pat.phone.toLowerCase().includes(query);
        if (!matchesName && !matchesPhone) return false;
      }

      // 2. Doctor booking history filter (Has booked selected doctor)
      if (patientDoctorFilter !== 'All') {
        const hasBookedDoc = pat.appointments.some(
          (app) => app.itemName.toLowerCase().includes(patientDoctorFilter.toLowerCase())
        );
        if (!hasBookedDoc) return false;
      }

      // 3. Status filter (Repeat vs New visitor)
      if (patientTypeFilter === 'Repeat') {
        if (pat.appointments.length <= 1) return false;
      } else if (patientTypeFilter === 'New') {
        if (pat.appointments.length !== 1) return false;
      }

      return true;
    });
  }, [patientsList, patientSearchQuery, patientDoctorFilter, patientTypeFilter]);

  // Active bed administration state
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [bedEditStatus, setBedEditStatus] = useState<'available' | 'occupied' | 'reserved'>('available');
  const [bedEditPatientName, setBedEditPatientName] = useState('');
  const [bedEditPatientAge, setBedEditPatientAge] = useState<number>(35);
  const [bedEditGender, setBedEditGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bedEditReason, setBedEditReason] = useState('');

  // Form: Ward (Add)
  const [newWardName, setNewWardName] = useState('');
  const [newWardPrice, setNewWardPrice] = useState<number>(100);
  const [newWardBeds, setNewWardBeds] = useState<number>(8);
  const [newWardColumns, setNewWardColumns] = useState<number>(4);
  const [showAddWard, setShowAddWard] = useState(false);

  // Form: Add New Hospital
  const [showAddHospital, setShowAddHospital] = useState(false);
  const [newHospName, setNewHospName] = useState('');
  const [newHospAddress, setNewHospAddress] = useState('');
  const [newHospPhone, setNewHospPhone] = useState('');
  const [newHospEmail, setNewHospEmail] = useState('');
  const [newHospAbout, setNewHospAbout] = useState('');
  const [newHospSpecialties, setNewHospSpecialties] = useState('');
  const [newHospImage, setNewHospImage] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Form: Doctor (Add / Edit)
  const [editDoctorId, setEditDoctorId] = useState<string | null>(null);
  const [docName, setDocName] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('');
  const [docExperience, setDocExperience] = useState('');
  const [docFee, setDocFee] = useState<number>(40);
  const [docBio, setDocBio] = useState('');
  const [docTimings, setDocTimings] = useState('09:00 AM, 11:30 AM, 02:00 PM, 04:30 PM');
  const [docPhoto, setDocPhoto] = useState('');

  // Form: Add Testing Facility
  const [facName, setFacName] = useState<'MRI' | 'CT Scan' | 'X-Ray' | 'ECG' | 'Ultrasound' | 'Blood Test'>('MRI');
  const [facPrice, setFacPrice] = useState<number>(150);
  const [facDuration, setFacDuration] = useState('25 mins');
  const [facDesc, setFacDesc] = useState('');
  const [facPrescription, setFacPrescription] = useState(false);

  // Default active hospital check
  if (!activeHospitalId && hospitals.length > 0) {
    setActiveHospitalId(hospitals[0].id);
  }

  const activeHospital = hospitals.find(h => h.id === activeHospitalId);

  // Default ward check inside bed admin
  if (activeHospital && !selectedWardId && activeHospital.wards.length > 0) {
    setSelectedWardId(activeHospital.wards[0].id);
  }

  const selectedWard = activeHospital?.wards.find(w => w.id === selectedWardId);

  // Handle Hospital Addition
  const handleAddHospitalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospName || !newHospAddress) return;

    addHospital({
      name: newHospName,
      address: newHospAddress,
      phone: newHospPhone || '+1 (555) 011-8899',
      email: newHospEmail || 'admin@caregrid-network.com',
      about: newHospAbout || 'A premier localized healthcare node in CareGrid district network.',
      specialties: newHospSpecialties ? newHospSpecialties.split(',').map(s => s.trim()) : ['General Medicine', 'Emergency triage'],
      image: newHospImage || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000',
      photos: [
        newHospImage || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000'
      ],
      coordinates: {
        x: Math.floor(Math.random() * 60) + 20,
        y: Math.floor(Math.random() * 60) + 20
      }
    });

    // Reset Form
    setNewHospName('');
    setNewHospAddress('');
    setNewHospPhone('');
    setNewHospEmail('');
    setNewHospAbout('');
    setNewHospSpecialties('');
    setNewHospImage('');
    setShowAddHospital(false);
    alert('Hospital successfully introduced into regional network registries.');
  };

  // Profile fields edits
  const handleProfileFieldSave = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement> | React.FormEvent, fieldName: keyof Hospital, val: any) => {
    if (e) e.preventDefault();
    if (activeHospital) {
      updateHospital(activeHospital.id, { [fieldName]: val });
    }
  };

  // Handle Add / Edit Doctor
  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !docSpecialty || !activeHospital) return;

    const timingsArray = docTimings.split(',').map(t => t.trim());

    if (editDoctorId) {
      // Edit
      updateDoctor(activeHospital.id, editDoctorId, {
        name: docName,
        specialty: docSpecialty,
        experience: docExperience,
        fee: docFee,
        bio: docBio,
        timings: timingsArray,
        photo: docPhoto || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200'
      });
      alert('Doctor credentials revised.');
      setEditDoctorId(null);
    } else {
      // Add
      addDoctor(activeHospital.id, {
        name: docName,
        specialty: docSpecialty,
        experience: docExperience || '5 years',
        photo: docPhoto || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
        timings: timingsArray,
        fee: docFee,
        bio: docBio || 'Consulting medical officer on emergency shift rosters.'
      });
      alert('New doctor successfully rostered.');
    }

    // Reset Form
    setDocName('');
    setDocSpecialty('');
    setDocExperience('');
    setDocFee(40);
    setDocBio('');
    setDocTimings('09:00 AM, 11:30 AM, 02:00 PM, 04:30 PM');
    setDocPhoto('');
  };

  // Load doctor details for editing
  const startEditDoctor = (doctor: Doctor) => {
    setEditDoctorId(doctor.id);
    setDocName(doctor.name);
    setDocSpecialty(doctor.specialty);
    setDocExperience(doctor.experience);
    setDocFee(doctor.fee);
    setDocBio(doctor.bio);
    setDocTimings(doctor.timings.join(', '));
    setDocPhoto(doctor.photo);
  };

  // Handle Add Diagnostic Scanner Facility
  const handleFacilitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facDesc || !activeHospital) return;

    addTestingFacility(activeHospital.id, {
      name: facName,
      price: facPrice,
      duration: facDuration,
      availability: 'Slots Open Daily',
      description: facDesc,
      requiresPrescription: facPrescription
    });

    alert(`Diagnostic Facility added: ${facName} scanning module active.`);

    setFacDesc('');
    setFacPrice(150);
    setFacDuration('25 mins');
    setFacPrescription(false);
  };

  return (
    <div id="admin-workbench" className="space-y-6">
      {/* Admin header */}
      <div className="rounded-2xl bg-manipal-blue text-white p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
            <ShieldCheck className="h-6 w-6 text-manipal-red" />
          </div>
          <div>
            <h2 className="font-sans text-xl font-black tracking-tight">CareGrid Interactive Admin Console</h2>
            <p className="text-xs text-rose-100 font-semibold">Authorized Hospital, ward telemetry, clinician roster & diagnostic updates desk</p>
          </div>
        </div>
        
        <button
          id="btn-admin-logout"
          onClick={logoutAdmin}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 hover:border-red-500 hover:bg-red-500/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-red-400 transition-all select-all"
        >
          <LogOut className="h-4 w-4" />
          Close Admin Mode
        </button>
      </div>

      {/* Hospital selector row & Creation dialog toggler */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Institution Registry:</label>
          <select
            id="admin-hospital-picker"
            value={activeHospitalId}
            onChange={(e) => {
              setActiveHospitalId(e.target.value);
              setEditDoctorId(null); // Clear doctor edits
            }}
            className="rounded-lg border border-slate-205 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-3xs focus:border-manipal-red focus:outline-hidden"
          >
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        <button
          id="btn-show-add-hospital"
          onClick={() => setShowAddHospital(!showAddHospital)}
          className="flex items-center gap-1.5 rounded-lg bg-manipal-blue hover:bg-manipal-hover-blue px-4 py-2 text-xs font-bold text-white shadow-md transition-colors"
        >
          <Plus className="h-4 w-4" />
          Introduce New Hospital
        </button>
      </div>

      {/* Form: Introduce Hospital Popup Drawer */}
      <AnimatePresence>
        {showAddHospital && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddHospitalSubmit} className="rounded-2xl border border-dashed border-red-200 bg-red-50/15 p-5 space-y-4">
              <h3 className="font-sans text-xs font-black text-manipal-red uppercase tracking-widest flex items-center gap-1.5 leading-none">
                <Building2 className="h-4 w-4 text-manipal-red" />
                Register New Medical Hub
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hospital Brand Name</label>
                  <input
                    type="text"
                    required
                    value={newHospName}
                    onChange={(e) => setNewHospName(e.target.value)}
                    placeholder="e.g. Apollo Wellness Core"
                    className="mt-1 w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Street Address Location</label>
                  <input
                    type="text"
                    required
                    value={newHospAddress}
                    onChange={(e) => setNewHospAddress(e.target.value)}
                    placeholder="Sector 3, City Boulevard"
                    className="mt-1 w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Help Desk Phone</label>
                  <input
                    type="text"
                    value={newHospPhone}
                    onChange={(e) => setNewHospPhone(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                    className="mt-1 w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hospital Overview & Bio</label>
                  <textarea
                    rows={2}
                    value={newHospAbout}
                    onChange={(e) => setNewHospAbout(e.target.value)}
                    placeholder="Provide patient counseling brief..."
                    className="mt-1 w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Core Specialties (Comma-separated)</label>
                  <input
                    type="text"
                    value={newHospSpecialties}
                    onChange={(e) => setNewHospSpecialties(e.target.value)}
                    placeholder="Cardiology, Pediatrics, Oncology"
                    className="mt-1 w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddHospital(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Close Form
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-600 hover:bg-cyan-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-100"
                >
                  Write & Deploy Hospital Entry
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main administration workspace split */}
      {activeHospital ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Sub panel choices (3 cols) */}
          <div className="lg:col-span-3 flex flex-col space-y-1.5 rounded-xl border border-slate-100 bg-white p-3 shadow-3xs">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">Console Chapters</span>
            <button
              id="admin-profile-btn"
              onClick={() => setAdminSection('profile')}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                adminSection === 'profile' ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Building2 className="h-4 w-4" />
              General profile Editor
            </button>
            <button
              id="admin-doctors-btn"
              onClick={() => setAdminSection('doctors')}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                adminSection === 'doctors' ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="h-4 w-4" />
              Rostered Specialists ({activeHospital.doctors.length})
            </button>
            <button
              id="admin-facilities-btn"
              onClick={() => setAdminSection('facilities')}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                adminSection === 'facilities' ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Activity className="h-4 w-4" />
              Diagnostic Scans ({activeHospital.testingFacilities.length})
            </button>
            <button
              id="admin-beds-btn"
              onClick={() => setAdminSection('beds')}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                adminSection === 'beds' ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Layers className="h-4 w-4" />
              Mutil-Ward Bed Dispatcher
            </button>
            
            <button
              id="admin-bookings-btn"
              onClick={() => setAdminSection('bookings')}
              className={`flex items-center justify-between gap-1 rounded-lg px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                adminSection === 'bookings' ? 'bg-cyan-50 text-cyan-700 font-extrabold' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2 text-left">
                <Calendar className="h-4 w-4" />
                Booking Requests Desk
              </span>
              {appointments.filter(a => a.status === 'pending').length > 0 && (
                <span className="rounded-full bg-amber-500 font-mono text-[9px] font-bold text-white px-2 py-0.5 leading-none animate-pulse">
                  {appointments.filter(a => a.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              id="admin-patients-btn"
              onClick={() => {
                setAdminSection('patients');
                setPatientSearchQuery('');
                setPatientDoctorFilter('All');
                setPatientTypeFilter('All');
              }}
              className={`flex items-center justify-between gap-1 rounded-lg px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                adminSection === 'patients' ? 'bg-cyan-50 text-cyan-700 font-extrabold' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2 text-left">
                <Users className="h-4 w-4" />
                Patient Directory Log
              </span>
            </button>

            <div className="border-t border-slate-100 my-2" />
            
            {/* Direct Registry Deletion */}
            <button
              id="btn-delete-hospital"
              onClick={() => {
                if (confirm(`CRITICAL WARNING:\nAre you absolutely sure you want to permanently delete "${activeHospital.name}" brand and all associated doctors and records?`)) {
                  deleteHospital(activeHospital.id);
                  alert('Hospital has been completely removed.');
                }
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-705 transition-colors cursor-pointer text-left"
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              Delete Institutional Entity
            </button>
          </div>

          {/* Active section workbench container (9 cols) */}
          <div className="lg:col-span-9 rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
            
            {/* SECTION A: PROFILE INFO EDITING */}
            {adminSection === 'profile' && (
              <div id="admin-profile-workspace" className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-sans text-sm font-bold text-slate-800">Hospital Institutional Registry</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Edit general profiles. Fields will save on blur or on pressing enter</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Hospital Name</label>
                    <input
                      type="text"
                      value={activeHospital.name}
                      onChange={(e) => updateHospital(activeHospital.id, { name: e.target.value })}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Location Street Address</label>
                    <input
                      type="text"
                      value={activeHospital.address}
                      onChange={(e) => updateHospital(activeHospital.id, { address: e.target.value })}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Primary Phone Line</label>
                    <input
                      type="text"
                      value={activeHospital.phone}
                      onChange={(e) => updateHospital(activeHospital.id, { phone: e.target.value })}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Administrative Email Contact</label>
                    <input
                      type="text"
                      value={activeHospital.email}
                      onChange={(e) => updateHospital(activeHospital.id, { email: e.target.value })}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Institutional Overview bio</label>
                  <textarea
                    rows={4}
                    value={activeHospital.about}
                    onChange={(e) => updateHospital(activeHospital.id, { about: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Cover Image banner URL</label>
                  <input
                    type="text"
                    value={activeHospital.image}
                    onChange={(e) => updateHospital(activeHospital.id, { image: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>

                {/* ADVANCED PHOTO GALLERY MANAGER */}
                <div className="border border-slate-205 rounded-xl p-4 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-750 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-cyan-600" />
                        Hospital Photo Gallery & Carousel Slides
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Manage landscape, reception, ICU, and clinic unit slider photos.</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste picture URL here (e.g. Unsplash URL)..."
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs bg-white focus:border-cyan-500 focus:outline-hidden font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newPhotoUrl.trim()) return;
                        const currentPhotos = activeHospital.photos || [activeHospital.image || ''];
                        const updatedPhotos = [...currentPhotos, newPhotoUrl.trim()];
                        updateHospital(activeHospital.id, { photos: updatedPhotos });
                        setNewPhotoUrl('');
                      }}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-3xs shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Photo
                    </button>
                  </div>

                  {/* Preset illustrative clinic photos for rapid loading */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Quick Add Clinic Theme Presets</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000', label: '🏥 Patient Ward Room' },
                        { url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=1000', label: '🔬 Advanced Diagnostic Lab' },
                        { url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1000', label: '🏢 Main Clinic Lobby' },
                        { url: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=1000', label: '⚕️ Consulting Cabin' }
                      ].map((preset) => {
                        const currentPhotos = activeHospital.photos || [activeHospital.image || ''];
                        const isAlreadyAdded = currentPhotos.includes(preset.url);
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            disabled={isAlreadyAdded}
                            onClick={() => {
                              const updatedPhotos = [...currentPhotos, preset.url];
                              updateHospital(activeHospital.id, { photos: updatedPhotos });
                            }}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                              isAlreadyAdded
                                ? 'bg-slate-200 border-slate-205 text-slate-400'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {preset.label} {isAlreadyAdded ? '(Added)' : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Grid layout of current photos with preview and deletion */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Current Slides ({ (activeHospital.photos || [activeHospital.image || '']).length })</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {(activeHospital.photos || [activeHospital.image || '']).map((pic, idx) => (
                        <div key={idx} className="group relative border border-slate-200 rounded-lg overflow-hidden bg-white shadow-3xs h-20 flex flex-col justify-between">
                          <img
                            src={pic}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                            alt={`Slide #${idx + 1}`}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=100';
                            }}
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 p-1 flex items-center justify-between">
                            <span className="font-mono text-white text-[8px] font-bold pl-1">
                              Slide {idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const currentPhotos = activeHospital.photos || [activeHospital.image || ''];
                                if (currentPhotos.length <= 1) {
                                  alert('A hospital must have at least 1 photo for our slider section.');
                                  return;
                                }
                                const updatedPhotos = currentPhotos.filter((p) => p !== pic);
                                updateHospital(activeHospital.id, { photos: updatedPhotos });
                              }}
                              className="bg-red-600 text-white hover:bg-red-700 h-5 w-5 rounded-md flex items-center justify-center transition-all cursor-pointer"
                              title="Delete Photo"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Clinical specialties (Comma-separated)</label>
                    <input
                      type="text"
                      value={activeHospital.specialties.join(', ')}
                      onChange={(e) => updateHospital(activeHospital.id, { specialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Public Facilities (Comma-separated)</label>
                    <input
                      type="text"
                      value={activeHospital.facilities ? activeHospital.facilities.join(', ') : ''}
                      onChange={(e) => updateHospital(activeHospital.id, { facilities: e.target.value.split(',').map(f => f.trim()).filter(Boolean) })}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">GPS Latitude Location</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={activeHospital.gpsCoordinates?.lat || ''}
                      onChange={(e) => updateHospital(activeHospital.id, { 
                        gpsCoordinates: { 
                          lat: parseFloat(e.target.value) || 0, 
                          lng: activeHospital.gpsCoordinates?.lng || 0 
                        } 
                      })}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">GPS Longitude Location</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={activeHospital.gpsCoordinates?.lng || ''}
                      onChange={(e) => updateHospital(activeHospital.id, { 
                        gpsCoordinates: { 
                          lat: activeHospital.gpsCoordinates?.lat || 0, 
                          lng: parseFloat(e.target.value) || 0 
                        } 
                      })}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Vector City Map X Anchor (0-100%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={activeHospital.coordinates.x}
                      onChange={(e) => updateHospital(activeHospital.id, { 
                        coordinates: { 
                          x: parseInt(e.target.value) || 0, 
                          y: activeHospital.coordinates.y 
                        } 
                      })}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Vector City Map Y Anchor (0-100%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={activeHospital.coordinates.y}
                      onChange={(e) => updateHospital(activeHospital.id, { 
                        coordinates: { 
                          x: activeHospital.coordinates.x, 
                          y: parseInt(e.target.value) || 0 
                        } 
                      })}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-teal-100 bg-teal-50 p-4 text-xs font-semibold text-teal-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-teal-600" />
                  <span>Administrative changes deployed onto state storage in real-time. Verify edits in Patient finding lists instantly!</span>
                </div>
              </div>
            )}

            {/* SECTION B: SPECIALIST STAFF ROSTERING */}
            {adminSection === 'doctors' && (
              <div id="admin-doctors-workspace" className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-sans text-sm font-bold text-slate-800">Clinical Consultant Rostering</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Configure specialists, clinical consulting fees, and roster timelines</p>
                </div>

                {/* Doctor Add / edit Form */}
                <form onSubmit={handleDoctorSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-4">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {editDoctorId ? '🧬 EDIT ROSTERED PRACTITIONER DETAILS' : '🧬 REGISTER NEW CONSULTING MEDICAL PRACTITIONER'}
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Legal Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Alok Sharma"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        className="mt-1 w-full rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Clinical Specialty Lane</label>
                      <input
                        type="text"
                        required
                        placeholder="Cardiology / Neurology"
                        value={docSpecialty}
                        onChange={(e) => setDocSpecialty(e.target.value)}
                        className="mt-1 w-full rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Consultation flat Fee (₹)</label>
                      <input
                        type="number"
                        required
                        value={docFee}
                        onChange={(e) => setDocFee(Number(e.target.value))}
                        className="mt-1 w-full rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-semibold text-slate-500">Rostered hours (Comma-separated timeline slots)</label>
                      <input
                        type="text"
                        required
                        value={docTimings}
                        onChange={(e) => setDocTimings(e.target.value)}
                        className="mt-1 w-full rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-mono text-[10px]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Practice Experience</label>
                      <input
                        type="text"
                        placeholder="e.g. 12 years"
                        value={docExperience}
                        onChange={(e) => setDocExperience(e.target.value)}
                        className="mt-1 w-full rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block">Personal Profile Brief</label>
                    <textarea
                      rows={2}
                      value={docBio}
                      onChange={(e) => setDocBio(e.target.value)}
                      placeholder="e.g. Senior Specialist MD trained at prestigious clinical schools..."
                      className="mt-1 w-full rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-500">Avatar Image Link</label>
                    <input
                      type="text"
                      value={docPhoto}
                      onChange={(e) => setDocPhoto(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="mt-1 w-full rounded-lg bg-white border border-slate-200 px-3 py-1 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2.5">
                    {editDoctorId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditDoctorId(null);
                          setDocName('');
                          setDocSpecialty('');
                          setDocExperience('');
                          setDocFee(40);
                          setDocBio('');
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-slate-400"
                      >
                        Abort Correction
                      </button>
                    )}
                    <button
                      type="submit"
                      className="rounded-lg bg-cyan-600 text-white font-bold px-4 py-2 text-xs"
                    >
                      {editDoctorId ? 'Rewrite credentials' : 'Register Staff Entry'}
                    </button>
                  </div>
                </form>

                {/* Rostered Staff list */}
                <div className="space-y-3">
                  <span className="block text-[10px] font-black tracking-wider text-slate-400 uppercase">Consulting Staff Directory</span>
                  <div className="divide-y divide-slate-100 max-h-[250px] overflow-y-auto pr-1">
                    {activeHospital.doctors.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center space-x-3">
                          <img src={doc.photo} alt={doc.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{doc.name}</p>
                            <p className="text-[10px] text-cyan-600/90 font-semibold">{doc.specialty} • ₹{doc.fee}</p>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditDoctor(doc)}
                            className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
                            title="Edit Doctor Details"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Do you want to write off ${doc.name} from rosters?`)) {
                                deleteDoctor(activeHospital.id, doc.id);
                                alert('Doctor dismissed.');
                              }
                            }}
                            className="rounded-md border border-red-100 p-1.5 text-red-500 hover:bg-red-50"
                            title="Remove Doctor"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION C: DIAGNOSTICS & TESTING SERVICES COFIG */}
            {adminSection === 'facilities' && (
              <div id="admin-facilities-workspace" className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-sans text-sm font-bold text-slate-800">Diagnostic Scanner Registry & Configurations</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Control pricing metrics, requisites, scanner logs</p>
                </div>

                {/* Facility Creation form */}
                <form onSubmit={handleFacilitySubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-4">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">🧪 INTRODUCE DIAGNOSTICS EQUIPMENT LINE</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Service Line Equipment</label>
                      <select
                        value={facName}
                        onChange={(e) => setFacName(e.target.value as any)}
                        className="mt-1 w-full rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs text-slate-600 focus:outline-hidden"
                      >
                        <option value="MRI">Magnetic Resonance Imaging (MRI)</option>
                        <option value="CT Scan">Computed Tomography (CT Scan)</option>
                        <option value="X-Ray">Radiology Digital (X-Ray)</option>
                        <option value="ECG">Electrocardiogram (ECG)</option>
                        <option value="Ultrasound">Ultrasonic waves scanner</option>
                        <option value="Blood Test">Pathological analysis lab</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Pricing Cost (₹)</label>
                      <input
                        type="number"
                        required
                        value={facPrice}
                        onChange={(e) => setFacPrice(Number(e.target.value))}
                        className="mt-1.5 w-full rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Standard scanning Duration</label>
                      <input
                        type="text"
                        required
                        value={facDuration}
                        onChange={(e) => setFacDuration(e.target.value)}
                        className="mt-1.5 w-full rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-500">Description details</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. captures detailed abdominal imagery with minimal discomfort..."
                      value={facDesc}
                      onChange={(e) => setFacDesc(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs"
                    />
                  </div>

                  <div className="flex items-center space-x-2 bg-white/70 p-2.5 rounded-lg border border-slate-200 w-fit">
                    <input
                      type="checkbox"
                      id="fac-prescription-needed"
                      checked={facPrescription}
                      onChange={(e) => setFacPrescription(e.target.checked)}
                      className="cursor-pointer"
                    />
                    <label htmlFor="fac-prescription-needed" className="text-xs text-slate-500 cursor-pointer">
                      Requires medical referral note to book
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="rounded-lg bg-teal-600 text-white font-bold px-4 py-2 text-xs">
                      Activate Facility Scanner
                    </button>
                  </div>
                </form>

                {/* Diagnostics list */}
                <div className="space-y-3">
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase">Operational Modules active</span>
                  {activeHospital.testingFacilities.length === 0 ? (
                    <p className="text-slate-400 italic text-xs">No active diagnostic scanner grids assigned.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeHospital.testingFacilities.map(f => (
                        <div key={f.id} className="rounded-lg bg-slate-50 p-3.5 border border-slate-150 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800">{f.name} Unit</span>
                            <p className="text-[10px] text-slate-400 font-medium">Fee: ₹{f.price} • Duration: {f.duration}</p>
                          </div>
                          
                          <button
                            onClick={() => {
                              if (confirm(`Disable diagnostic ${f.name} module?`)) {
                                deleteTestingFacility(activeHospital.id, f.id);
                                alert('Diagnostic service Line shutdown.');
                              }
                            }}
                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-md border border-transparent hover:border-red-100"
                            title="Shutdown module"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION D: CLINICAL WARD BED DISPATCHER (BOOKMYSHOW ADMIN STATS CONTROLS) */}
            {adminSection === 'beds' && (
              <div id="admin-beds-workspace" className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-sans text-sm font-bold text-slate-800">Visual Bed Dispatcher</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Discharge clinical ward occupants or modify ward allocation grids immediately</p>
                </div>

                {/* Select ward, Add ward, and Delete ward */}
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Ward & Multi-Ward Dispatcher:</span>
                    
                    {/* Delete Current Ward Button */}
                    {selectedWard && activeHospital.wards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`ADMIN CONFIRMATION:\nAre you absolutely sure you want to permanently delete "${selectedWard.name}" and ALL of its ${selectedWard.beds.length} beds from this hospital?`)) {
                            const updatedWards = activeHospital.wards.filter(w => w.id !== selectedWard.id);
                            updateHospital(activeHospital.id, { wards: updatedWards });
                            alert(`"${selectedWard.name}" removed successfully.`);
                            // Select first ward left
                            setSelectedWardId(updatedWards[0]?.id || '');
                          }
                        }}
                        className="rounded-lg border border-red-200 hover:bg-red-50 px-2.5 py-1 text-xs font-bold text-red-650 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete "{selectedWard.name}"
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {activeHospital.wards.map(ward => {
                      const occupiedCount = ward.beds.filter(b => b.status !== 'available').length;
                      const isSelected = selectedWardId === ward.id;
                      return (
                        <button
                          key={ward.id}
                          onClick={() => { setSelectedWardId(ward.id); setSelectedBedId(null); }}
                          className={`rounded-lg px-3 py-2 text-xs font-bold border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-600 border-cyan-800 text-white shadow-xs'
                              : 'bg-white border-slate-150 text-slate-600 hover:bg-slate-55'
                          }`}
                        >
                          {ward.name}
                          <span className={`inline-block ml-1.5 rounded-full px-1.5 py-0.2 font-mono text-[9px] font-bold ${
                            isSelected ? 'bg-cyan-800 text-white' : 'bg-slate-150 text-slate-500'
                          }`}>
                            {occupiedCount}/{ward.beds.length} occupied
                          </span>
                        </button>
                      );
                    })}

                    {/* Add Ward Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setShowAddWard(!showAddWard)}
                      className="rounded-lg border border-dashed border-cyan-300 hover:bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-600 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Ward
                    </button>
                  </div>

                  {/* Add Ward Form */}
                  {showAddWard && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-2 space-y-3.5"
                    >
                      <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                        🛡️ CONFIGURE NEW CLINICAL WARD
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-semibold text-slate-500">Ward Division Name</label>
                          <input
                            type="text"
                            placeholder="e.g., General Medicine Ward D"
                            value={newWardName}
                            onChange={(e) => setNewWardName(e.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs focus:outline-hidden focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500">Price/Day (₹)</label>
                          <input
                            type="number"
                            min="0"
                            value={newWardPrice}
                            onChange={(e) => setNewWardPrice(parseInt(e.target.value) || 0)}
                            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500">Bed Count</label>
                          <input
                            type="number"
                            min="1"
                            max="64"
                            value={newWardBeds}
                            onChange={(e) => setNewWardBeds(parseInt(e.target.value) || 1)}
                            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddWard(false);
                            setNewWardName('');
                          }}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-650"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newWardName) {
                              alert('Please enter a name for the ward.');
                              return;
                            }
                            
                            // Generate beds
                            const newBeds: Bed[] = Array.from({ length: newWardBeds }).map((_, i) => ({
                              id: `bed-${Date.now()}-${i}`,
                              number: `${newWardName.split(' ')[0] || 'WD'}-${i + 1}`,
                              status: 'available'
                            }));

                            const newWard: Ward = {
                              id: `ward-${Date.now()}`,
                              name: newWardName,
                              pricePerDay: newWardPrice,
                              totalBeds: newWardBeds,
                              columns: newWardColumns,
                              beds: newBeds
                            };

                            const updatedWards = [...activeHospital.wards, newWard];
                            updateHospital(activeHospital.id, { wards: updatedWards });
                            
                            setNewWardName('');
                            setShowAddWard(false);
                            setSelectedWardId(newWard.id);
                            alert(`Clinical division "${newWardName}" deployed successfully with ${newWardBeds} active bed nodes.`);
                          }}
                          className="rounded-md bg-cyan-600 hover:bg-cyan-700 px-4 py-1.5 text-xs font-bold text-white shadow-3xs"
                        >
                          Deploy Ward Division
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {selectedWard ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 bg-emerald-50 rounded-xl p-3 text-xs text-emerald-800 border border-emerald-100/50 leading-relaxed font-semibold">
                      <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                      <span>ADMIN COMMAND CENTRAL: Click any bed unit in the visual layout to inspect clinical notes, alter occupancy statuses, or live-update patient medical details on the fly.</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Bed grid on left */}
                      <div className="lg:col-span-7 rounded-2xl border border-slate-150 bg-white p-5 flex flex-col items-center">
                        <div className="w-full bg-slate-900 text-white text-center py-2.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest mb-6 select-none flex items-center justify-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                          🏥 WARD {selectedWard.name.toUpperCase()} ADMISSION GRID 🏥
                        </div>

                        <div 
                          className="grid gap-3.5 justify-center w-full"
                          style={{
                            gridTemplateColumns: `repeat(${selectedWard.columns || 4}, minmax(48px, 1fr))`
                          }}
                        >
                          {selectedWard.beds.map((bed) => {
                            const isSelected = selectedBedId === bed.id;
                            const isAvailable = bed.status === 'available';
                            const BedIconComponent = isAvailable ? BedIcon : Activity;

                            let bgClass = 'bg-white border-slate-200 hover:border-cyan-500 text-slate-700 hover:bg-slate-50';
                            let labelColor = 'text-slate-400 font-semibold';
                            let iconColor = 'text-slate-350';
                            let statusDotColor = 'bg-transparent';

                            if (bed.status === 'occupied') {
                              bgClass = 'bg-slate-100/80 border-slate-350 hover:bg-slate-100 text-slate-705';
                              labelColor = 'text-slate-700 font-bold';
                              iconColor = 'text-slate-500';
                              statusDotColor = 'bg-rose-500 animate-pulse';
                            } else if (bed.status === 'reserved') {
                              bgClass = 'bg-amber-55 border-amber-300 hover:bg-amber-100/60 text-amber-900';
                              labelColor = 'text-amber-800 font-bold';
                              iconColor = 'text-amber-600';
                              statusDotColor = 'bg-amber-500';
                            } else {
                              // Available/vacant bed
                              bgClass = 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50/40 hover:border-emerald-500 hover:shadow-xs hover:scale-102 transition-all duration-300';
                              labelColor = 'text-slate-500 group-hover:text-emerald-700 font-semibold transition-colors duration-300';
                              iconColor = 'text-slate-400 group-hover:text-emerald-550 group-hover:scale-110 group-hover:animate-pulse transition-all duration-300';
                              statusDotColor = 'bg-emerald-500';
                            }

                            if (isSelected) {
                              bgClass = 'bg-cyan-50 border-2 border-cyan-600 text-cyan-900 shadow-sm';
                              labelColor = 'text-cyan-850 font-extrabold';
                              iconColor = isAvailable ? 'text-emerald-600' : 'text-cyan-600';
                            }

                            return (
                              <button
                                type="button"
                                id={`admin-bed-node-${bed.id}`}
                                key={bed.id}
                                onClick={() => {
                                  setSelectedBedId(bed.id);
                                  setBedEditStatus(bed.status);
                                  setBedEditPatientName(bed.patientName || '');
                                  setBedEditPatientAge(bed.patientAge || 35);
                                  setBedEditGender(bed.gender || 'Male');
                                  setBedEditReason(bed.admissionReason || '');
                                }}
                                className={`group relative flex flex-col justify-center items-center h-14 rounded-xl border border-slate-300 cursor-pointer transition-all shadow-3xs ${bgClass}`}
                              >
                                <span className={`absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full border border-white shadow-3xs z-10 block ${statusDotColor}`} />
                                <BedIconComponent className={`h-4.5 w-4.5 shrink-0 transition-transform duration-300 ${iconColor}`} />
                                <span className={`font-mono text-[9px] uppercase tracking-wider mt-1 ${labelColor}`}>
                                  {bed.number.split('-')[1] || bed.number}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Control panel on right */}
                      <div className="lg:col-span-5 self-stretch space-y-4">
                        {(() => {
                          const activeBed = selectedWard.beds.find(b => b.id === selectedBedId);
                          if (!activeBed) {
                            return (
                              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50 h-full flex flex-col items-center justify-center min-h-[290px] w-full">
                                <div className="h-10 w-10 rounded-full border border-dashed border-slate-350 flex items-center justify-center text-slate-400 mb-3 animate-pulse">
                                  <Activity className="h-5 w-5" />
                                </div>
                                <h4 className="font-sans text-xs font-bold text-slate-600 uppercase tracking-wider">Select Bed Node</h4>
                                <p className="mt-1 text-[11px] text-slate-400 max-w-[180px] leading-relaxed mx-auto">
                                  Click any bed node on the left to activate the elevated console editor panel and modify occupancy data details.
                                </p>
                              </div>
                            );
                          }

                          return (
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 h-full flex flex-col justify-between">
                              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                                <div>
                                  <span className="bg-slate-900 text-white font-mono text-[9px] font-bold tracking-widest px-2 py-0.5 rounded uppercase">
                                    NODE {activeBed.number} EDITOR
                                  </span>
                                  <h4 className="font-sans text-xs font-black text-slate-800 mt-1 uppercase">
                                    Occupancy & Telemetry Configuration
                                  </h4>
                                </div>
                                <Activity className="h-5 w-5 text-cyan-600 animate-pulse" />
                              </div>

                              <div className="space-y-3.5">
                                {/* Segmented status picker */}
                                <div>
                                  <label className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-500 mb-1.5">
                                    Set Occupancy Status
                                  </label>
                                  <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
                                    {(['available', 'occupied', 'reserved'] as const).map(st => {
                                      const isAct = bedEditStatus === st;
                                      let activeStStyle = '';
                                      if (st === 'available') activeStStyle = 'bg-emerald-600 text-white hover:bg-emerald-700';
                                      else if (st === 'occupied') activeStStyle = 'bg-slate-700 text-white hover:bg-slate-800';
                                      else activeStStyle = 'bg-amber-500 text-white hover:bg-amber-600';

                                      return (
                                        <button
                                          key={st}
                                          type="button"
                                          onClick={() => setBedEditStatus(st)}
                                          className={`py-1.5 px-2 text-[10px] font-extrabold tracking-wider uppercase rounded-md text-center cursor-pointer transition-all ${
                                            isAct ? activeStStyle : 'text-slate-500 hover:text-slate-805 bg-white border border-transparent hover:border-slate-200 shadow-3xs'
                                          }`}
                                        >
                                          {st === 'available' ? 'Vacant' : st === 'occupied' ? 'Admitted' : 'Reserved'}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {bedEditStatus !== 'available' && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-3 pt-1"
                                  >
                                    <div>
                                      <label className="block text-[9px] font-extrabold uppercase tracking-wide text-slate-500 mb-0.5">Patient Legal Name</label>
                                      <input
                                        type="text"
                                        value={bedEditPatientName}
                                        onChange={(e) => setBedEditPatientName(e.target.value)}
                                        placeholder="e.g. Richard S. Croft"
                                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-cyan-500 font-medium"
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-[9px] font-extrabold uppercase tracking-wide text-slate-500 mb-0.5">Age</label>
                                        <input
                                          type="number"
                                          min="1"
                                          max="120"
                                          value={bedEditPatientAge}
                                          onChange={(e) => setBedEditPatientAge(parseInt(e.target.value) || 35)}
                                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-cyan-500 font-mono"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-extrabold uppercase tracking-wide text-slate-500 mb-0.5">Gender</label>
                                        <div className="grid grid-cols-3 gap-1 bg-slate-50 border border-slate-150 rounded-lg p-0.5">
                                          {(['Male', 'Female', 'Other'] as const).map(g => (
                                            <button
                                              key={g}
                                              type="button"
                                              onClick={() => setBedEditGender(g)}
                                              className={`py-1 text-[9px] font-bold rounded-md transition-all text-center ${
                                                bedEditGender === g 
                                                  ? 'bg-white text-slate-800 shadow-3xs font-extrabold border border-slate-200' 
                                                  : 'text-slate-400 hover:text-slate-600'
                                              }`}
                                            >
                                              {g[0]}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-extrabold uppercase tracking-wide text-slate-500 mb-0.5">Admission Diagnosis / Note</label>
                                      <input
                                        type="text"
                                        value={bedEditReason}
                                        onChange={(e) => setBedEditReason(e.target.value)}
                                        placeholder="e.g. Under medical observation"
                                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-cyan-500 font-medium"
                                      />
                                    </div>
                                  </motion.div>
                                )}
                              </div>

                              <div className="flex gap-2.5 pt-4 border-t border-slate-100 mt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`ADMIN CONFIRMATION:\nAre you sure you want to sanitize and release Bed ${activeBed.number} immediately?`)) {
                                      updateBedStatus(activeHospital.id, selectedWard.id, activeBed.id, 'available');
                                      setSelectedBedId(null);
                                      alert(`Bed ${activeBed.number} is now vacant and clean.`);
                                    }
                                  }}
                                  className="w-1/3 py-2 text-xs font-bold text-red-650 hover:text-red-700 bg-red-50 hover:bg-red-100 font-sans rounded-xl transition-all border border-red-100 cursor-pointer"
                                >
                                  Discharge
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (bedEditStatus !== 'available' && !bedEditPatientName.trim()) {
                                      alert('Please provide patient name for occupancy holds.');
                                      return;
                                    }
                                    updateBedStatus(activeHospital.id, selectedWard.id, activeBed.id, bedEditStatus, {
                                      patientName: bedEditStatus === 'available' ? '' : bedEditPatientName,
                                      patientAge: bedEditStatus === 'available' ? 35 : bedEditPatientAge,
                                      gender: bedEditStatus === 'available' ? 'Male' : bedEditGender,
                                      admissionReason: bedEditStatus === 'available' ? '' : (bedEditReason || 'Direct Clinical Check-In')
                                    });
                                    setSelectedBedId(null);
                                    alert(`Successfully committed updates for Clinical Unit Bed ${activeBed.number}.`);
                                  }}
                                  className="flex-1 py-2 px-4 rounded-xl bg-cyan-650 hover:bg-cyan-700 text-white text-xs font-bold transition-all shadow-3xs text-center flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  Apply Config Updates
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs text-center">Relaunch ward grids selection above.</p>
                )}
              </div>
            )}

            {/* SECTION E: BOOKING REQUESTS MANAGER */}
            {adminSection === 'bookings' && (
              <div id="admin-bookings-workspace" className="space-y-6">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <h3 className="font-sans text-sm font-bold text-slate-800">Booking Requests Desk</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Approve, decline and inspect user consultation schedules or clinical admissions</p>
                  </div>
                  
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-[10px] font-extrabold text-slate-550 border border-slate-200">
                    Total Bookings: {appointments.length}
                  </span>
                </div>

                {appointments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 bg-slate-50 max-w-md mx-auto">
                    <Calendar className="mx-auto h-10 w-10 text-slate-300" />
                    <h4 className="mt-4 font-sans text-xs font-bold text-slate-700">No Booking Entries Found</h4>
                    <p className="mt-1 text-[11px] text-slate-455 leading-relaxed">There are no diagnostic scans or specialist doctor slot requests scheduled in the metadata system yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Sort pending bookings first, then by createdAt desc */}
                    {[...appointments]
                      .sort((a, b) => {
                        if (a.status === 'pending' && b.status !== 'pending') return -1;
                        if (a.status !== 'pending' && b.status === 'pending') return 1;
                        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
                      })
                      .map((app) => {
                        const isPending = app.status === 'pending';
                        const isConfirmed = app.status === 'confirmed';
                        const isCancelled = app.status === 'cancelled';
                        const isCheckedIn = app.status === 'checked-in';
                        
                        return (
                          <div
                            id={`admin-booking-item-${app.id}`}
                            key={app.id} 
                            className={`rounded-xl border p-4.5 transition-all duration-200 bg-white ${
                              isPending
                                ? 'border-amber-300 ring-2 ring-amber-100 shadow-3xs'
                                : 'border-slate-150'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                              {/* Left column details */}
                              <div className="space-y-2 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="bg-slate-105 border border-slate-200 text-slate-550 font-mono text-[9px] font-extrabold rounded-md px-1.5 py-0.5 uppercase tracking-wide">
                                    Code: #{app.id.split('-')[1]}
                                  </span>
                                  <span className={`font-mono text-[9px] font-bold rounded-md px-1.5 py-0.5 uppercase ${
                                    app.type === 'doctor' 
                                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' 
                                      : 'bg-teal-50 text-teal-700 border border-teal-100'
                                  }`}>
                                    {app.type === 'doctor' ? 'Clinical Consult' : 'Lab Diagnostic'}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium">at</span>
                                  <span className="text-cyan-805 font-extrabold text-xs">{app.hospitalName}</span>
                                </div>

                                <div className="space-y-0.5">
                                  <h4 className="font-sans text-xs font-extrabold text-slate-850">
                                    {app.itemName}
                                    {app.itemDetail && (
                                      <span className="text-[10px] text-slate-450 font-mono ml-1.5">({app.itemDetail})</span>
                                    )}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-semibold">
                                    <span>Date: <strong className="text-slate-700">{app.date}</strong></span>
                                    <span>Time Slot: <strong className="text-slate-705 font-mono">{app.timeSlot}</strong></span>
                                    {app.bedId && (
                                      <span className="text-amber-600 font-extrabold flex items-center gap-1">
                                        <Layers className="h-3 w-3" />
                                        Bed Hold Allocated
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Patient details */}
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-slate-650 font-medium">
                                  <div>
                                    <span className="text-slate-400 mr-1.5 font-semibold">Patient:</span>
                                    <strong className="text-slate-700">{app.patientName}</strong>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 mr-1.5 font-semibold">Gender / Age:</span>
                                    <strong className="text-slate-700">{app.patientGender} • {app.patientAge} Yrs</strong>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 mr-1.5 font-semibold">Phone Contact:</span>
                                    <strong className="text-slate-705 font-mono select-all">{app.patientPhone}</strong>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 mr-1.5 font-semibold">Status Check:</span>
                                    <strong className="font-sans">
                                      {isPending && <span className="text-amber-600 animate-pulse font-extrabold">⚠️ Awaiting Approval</span>}
                                      {isConfirmed && <span className="text-emerald-600 font-extrabold">✓ Accepted & Confirmed</span>}
                                      {isCheckedIn && <span className="text-blue-650 font-extrabold">🛡️ Checked In Clinic</span>}
                                      {isCancelled && <span className="text-rose-600 font-extrabold">❌ Cancelled / Declined</span>}
                                    </strong>
                                  </div>
                                </div>

                                {app.reason && (
                                  <div className="bg-cyan-50/55 border border-cyan-150 rounded-lg p-2.5 mt-2 font-sans">
                                    <span className="text-cyan-800 font-bold block text-[8px] uppercase tracking-widest">Reason for Booking:</span>
                                    <p className="text-slate-705 italic text-xs mt-0.5">"{app.reason}"</p>
                                  </div>
                                )}
                              </div>

                              {/* Action controls */}
                              <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto shrink-0 justify-end sm:items-end self-stretch sm:justify-start">
                                {isPending ? (
                                  <>
                                    <button
                                      id={`btn-approve-app-${app.id}`}
                                      type="button"
                                      onClick={() => {
                                        updateAppointmentStatus(app.id, 'confirmed');
                                        alert(`Clinical Booking APPROVED: Confirmation deployed for Patient ${app.patientName}.`);
                                      }}
                                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3.5 py-2 text-xs shadow-3xs flex items-center justify-center gap-1 cursor-pointer flex-1 sm:flex-initial"
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                      Approve / Accept
                                    </button>
                                    <button
                                      id={`btn-decline-app-${app.id}`}
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`ADMIN INTERVENTION:\nDecline and cancel appointment request #${app.id.split('-')[1]} for Patient "${app.patientName}"? Admitted bed holds will be released.`)) {
                                          updateAppointmentStatus(app.id, 'cancelled');
                                          alert('Booking request declined.');
                                        }
                                      }}
                                      className="rounded-lg border border-red-200 hover:bg-red-50 text-red-650 font-bold px-3.5 py-2 text-xs flex items-center justify-center gap-1 cursor-pointer flex-1 sm:flex-initial"
                                    >
                                      <UserX className="h-4 w-4" />
                                      Decline / Decline Booking
                                    </button>
                                  </>
                                ) : isConfirmed ? (
                                  <div className="flex flex-wrap sm:flex-col gap-2 w-full">
                                    <button
                                      id={`btn-checkin-app-${app.id}`}
                                      type="button"
                                      onClick={() => {
                                        updateAppointmentStatus(app.id, 'checked-in');
                                        alert(`Notice: Patient ${app.patientName} marked as checked-in.`);
                                      }}
                                      className="rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold px-3.5 py-1.5 text-xs shrink-0 cursor-pointer w-full text-center"
                                    >
                                      Mark Checked-In
                                    </button>
                                    <button
                                      id={`btn-reverse-app-${app.id}`}
                                      type="button"
                                      onClick={() => {
                                        if (confirm('Decline and cancel this confirmed registration? Any bed reservations will be sanitly released.')) {
                                          updateAppointmentStatus(app.id, 'cancelled');
                                          alert('Booking record updated to Cancelled.');
                                        }
                                      }}
                                      className="rounded-lg border border-red-250 hover:bg-red-50 font-extrabold px-3 py-1.5 text-xs text-red-600 shrink-0 cursor-pointer w-full text-center"
                                    >
                                      Decline Booking
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase select-none border border-slate-200 bg-slate-50 px-2.5 py-1 rounded-md">
                                    {isCancelled ? '❌ Declined / Cancelled' : '✓ Clinical Checked-In'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* SECTION F: PATIENT DIRECTORY & REPEAT VISITORS */}
            {adminSection === 'patients' && (
              <div id="admin-patients-workspace" className="space-y-6">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <h3 className="font-sans text-sm font-bold text-slate-800">Patient Directory & Repeat Visitors Log</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Validate credentials, track historic consultations, and analyze patient retention metrics.</p>
                  </div>
                  
                  <span id="patient-count-badge" className="rounded-full bg-slate-100 px-3 py-1 font-mono text-[10px] font-extrabold text-slate-550 border border-slate-200">
                    Total Patients: {patientsList.length}
                  </span>
                </div>

                {/* SEARCH AND FILTERS */}
                <div id="patient-search-filters" className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 border border-slate-150 p-4 rounded-xl">
                  {/* Text search */}
                  <div className="relative">
                    <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">Search Patient Name/Phone</label>
                    <div className="relative">
                      <input
                        id="patient-search-input"
                        type="text"
                        value={patientSearchQuery}
                        onChange={(e) => setPatientSearchQuery(e.target.value)}
                        placeholder="Search name or phone contact..."
                        className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-750 focus:border-cyan-500 focus:outline-hidden"
                      />
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* Doctor filter dropdown */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">Filter by Doctor Booked</label>
                    <select
                      id="patient-doctor-select"
                      value={patientDoctorFilter}
                      onChange={(e) => setPatientDoctorFilter(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-650 focus:border-cyan-500 focus:outline-hidden"
                    >
                      <option value="All">All Doctors (Any Connection)</option>
                      {allDoctorNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Repeat visitor filter tabs */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">Retention Status</label>
                    <div className="grid grid-cols-3 bg-white border border-slate-200 rounded-lg p-0.5 text-[11px] font-semibold text-center">
                      <button
                        type="button"
                        onClick={() => setPatientTypeFilter('All')}
                        className={`py-1 rounded-md transition-colors cursor-pointer ${
                          patientTypeFilter === 'All'
                            ? 'bg-cyan-555 text-cyan-805 font-bold bg-cyan-50/70 border border-cyan-105'
                            : 'text-slate-500 hover:text-slate-850'
                        }`}
                      >
                        All ({patientsList.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPatientTypeFilter('Repeat')}
                        className={`py-1 rounded-md transition-colors cursor-pointer ${
                          patientTypeFilter === 'Repeat'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold'
                            : 'text-slate-500 hover:text-emerald-700'
                        }`}
                      >
                        Repeat ({patientsList.filter((p) => p.appointments.length > 1).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPatientTypeFilter('New')}
                        className={`py-1 rounded-md transition-colors cursor-pointer ${
                          patientTypeFilter === 'New'
                            ? 'bg-blue-50 text-blue-800 border border-blue-105 font-bold'
                            : 'text-slate-500 hover:text-blue-700'
                        }`}
                      >
                        Single ({patientsList.filter((p) => p.appointments.length === 1).length})
                      </button>
                    </div>
                  </div>
                </div>

                {/* PATIENTS LIST DISPLAY */}
                {filteredPatients.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 bg-slate-50 max-w-md mx-auto">
                    <Users className="mx-auto h-10 w-10 text-slate-300" />
                    <h4 className="mt-4 font-sans text-xs font-bold text-slate-700">No Match Found</h4>
                    <p className="mt-1 text-[11px] text-slate-455 leading-relaxed">No patients in the directory matched the search token, doctor filter, or visitor frequency criteria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredPatients.map((patient) => {
                      const totalBookings = patient.appointments.length;
                      const hasRepeatStatus = totalBookings > 1;

                      return (
                        <div
                          id={`patient-card-${patient.phone}`}
                          key={`${patient.name}-${patient.phone}`}
                          className="rounded-xl border border-slate-150 p-4.5 bg-white shadow-3xs flex flex-col gap-3.5 hover:shadow-2xs transition-all"
                        >
                          {/* Top row: Patient basic ID credentials */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-505 border border-slate-200">
                                <Users className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 id={`patient-name-${patient.phone}`} className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-tight">
                                  {patient.name}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-450 font-medium">
                                  <span>{patient.gender} • {patient.age} Yrs</span>
                                  <span>•</span>
                                  <span className="font-mono">{patient.phone}</span>
                                </div>
                              </div>
                            </div>

                            {/* Repeat/New visitor indicator badge */}
                            <div className="flex items-center gap-1.5">
                              {hasRepeatStatus ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-55 border border-emerald-100 text-emerald-700 rounded-full px-2.5 py-0.5 font-sans text-[10px] font-extrabold">
                                  <Sparkles className="h-3 w-3 animate-spin" style={{ animationDuration: '6s' }} />
                                  Repeat Visitor ({totalBookings} Books)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-705 border border-blue-100 rounded-full px-2.5 py-0.5 font-sans text-[10px] font-extrabold">
                                  Single Booking Patient
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Historical appointment cards for the patient */}
                          <div className="space-y-2">
                            <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Clinical Booking Timeline ({patient.appointments.length})</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {patient.appointments.map((app) => (
                                <div
                                  id={`history-app-${app.id}`}
                                  key={app.id}
                                  className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-50 transition-all flex flex-col justify-between"
                                >
                                  <div>
                                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-420 font-mono">
                                      <span>#{app.id.split('-')[1]}</span>
                                      <span className={`${
                                        app.status === 'confirmed' ? 'text-emerald-650 font-extrabold' :
                                        app.status === 'checked-in' ? 'text-blue-650 font-extrabold' :
                                        app.status === 'cancelled' ? 'text-red-650' : 'text-amber-650'
                                      } uppercase`}>
                                        {app.status}
                                      </span>
                                    </div>

                                    <h5 className="font-sans text-xs font-bold text-slate-800 mt-1">
                                      {app.itemName}
                                    </h5>
                                    <span className="text-[10px] text-slate-450 block font-semibold mt-0.5 leading-tight">
                                      at {app.hospitalName}
                                    </span>

                                    {app.reason && (
                                      <p className="text-[11px] text-slate-600 italic font-sans border-t border-slate-100/70 pt-1.5 mt-2">
                                        " {app.reason} "
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex justify-between text-[10px] text-slate-400 font-medium font-mono pt-2">
                                    <span>{app.date}</span>
                                    <span>{app.timeSlot}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center text-slate-600">
          <p className="text-sm font-semibold">Ready your institutional registry. Select or register a hospital to activate editing consoles.</p>
        </div>
      )}
    </div>
  );
};
