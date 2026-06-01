import React, { useState } from 'react';
import { MedicalProvider, useMedical } from './context/MedicalContext';
import { Navbar } from './components/Navbar';
import { Homepage } from './components/Homepage';
import { MapSection } from './components/MapSection';
import { HospitalDetails } from './components/HospitalDetails';
import { AdminPanel } from './components/AdminPanel';
import { BookingList } from './components/BookingList';
import { PatientPortal } from './components/PatientPortal';
import { LoginGate } from './components/LoginGate';
import { MedicineReminderSystem } from './components/MedicineReminderSystem';
import { HeartPulse, Stethoscope, BedDouble, ShieldCheck, Sparkles, Navigation, CalendarRange, Clock, Target, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'home' | 'patient' | 'admin' | 'bookings' | 'portal' | 'reminders'>('home');
  const [preferredSpecialty, setPreferredSpecialty] = useState<string>('All');
  const { selectedHospitalId, setSelectedHospitalId, hospitals, appointments, currentUser, isAdmin } = useMedical();

  // Helper calculation for global system metrics
  const globalMetrics = React.useMemo(() => {
    let bedsAvailable = 0;
    let doctorsTotal = 0;
    if (Array.isArray(hospitals)) {
      hospitals.forEach(h => {
        if (h && Array.isArray(h.doctors)) {
          doctorsTotal += h.doctors.length;
        }
        if (h && Array.isArray(h.wards)) {
          h.wards.forEach(w => {
            if (w && Array.isArray(w.beds)) {
              bedsAvailable += w.beds.filter(b => b && b.status === 'available').length;
            }
          });
        }
      });
    }
    return { bedsAvailable, doctorsTotal, hospitalsTotal: Array.isArray(hospitals) ? hospitals.length : 0 };
  }, [hospitals]);

  // 1. Mandatory Login Gate (Facebook style)
  if (!currentUser && !isAdmin) {
    return <LoginGate />;
  }

  const handleExploreHospitals = (serviceFilter?: string) => {
    setSelectedHospitalId(null);
    if (serviceFilter) {
      if (serviceFilter === 'ICU' || serviceFilter === 'Lab') {
        setPreferredSpecialty('All'); // Direct clinical list
      } else {
        setPreferredSpecialty(serviceFilter);
      }
    } else {
      setPreferredSpecialty('All');
    }
    setActiveTab('patient');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans antialiased text-slate-800 selection:bg-red-50 selection:text-manipal-red">
      {/* Prime Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Hero Header Region - Animated and hidden when focused on hospital detail info */}
      <AnimatePresence>
        {activeTab === 'patient' && selectedHospitalId === null && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="border-b border-rose-50/55 bg-gradient-to-b from-rose-50/30 via-white to-transparent py-8.5 px-4 sm:px-6 lg:px-8"
          >
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-100 px-3 py-1 text-xs font-bold text-manipal-red">
                    <Sparkles className="h-3.5 w-3.5 text-manipal-red animate-spin" style={{ animationDuration: '6s' }} />
                    CareGrid Alliance Portal Active
                  </div>
                  <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-manipal-blue leading-tight">
                    CareGrid Metro Search Hub
                  </h1>
                  <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-relaxed font-semibold">
                    Locate dynamic medical centers, check real-time bed inventories, examine certified consultant schedules, and reserve diagnostics scan slots securely.
                  </p>
                </div>

                {/* Regional Live status cards */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4.5 shrink-0 select-none">
                  <div className="rounded-xl border border-slate-150 bg-white p-3.5 shadow-2xs text-center flex flex-col justify-center min-w-[90px] sm:min-w-[120px]">
                    <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Hubs</span>
                    <span className="mt-1 font-mono text-xl sm:text-2xl font-black text-manipal-blue">{globalMetrics.hospitalsTotal}</span>
                  </div>
                  <div className="rounded-xl border border-slate-150 bg-white p-3.5 shadow-2xs text-center flex flex-col justify-center min-w-[90px] sm:min-w-[120px]">
                    <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">Consultants</span>
                    <span className="mt-1 font-mono text-xl sm:text-2xl font-black text-manipal-red">{globalMetrics.doctorsTotal}</span>
                  </div>
                  <div className="rounded-xl border border-slate-150 bg-white p-3.5 shadow-2xs text-center flex flex-col justify-center min-w-[90px] sm:min-w-[120px] relative">
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-250 animate-pulse" />
                    <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">Beds Spare</span>
                    <span className="mt-1 font-mono text-xl sm:text-2xl font-black text-emerald-650">{globalMetrics.bedsAvailable}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Responsive Grid Layout Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {/* TAB 0: HOMEPAGE PORTAL */}
          {activeTab === 'home' && (
            <motion.div
              id="view-home-chapter"
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Homepage 
                onExploreHospitals={handleExploreHospitals}
                metrics={globalMetrics}
              />
            </motion.div>
          )}

          {/* TAB 1: HOSPITALS DISCOVERY ENGINE */}
          {activeTab === 'patient' && (
            <motion.div
              id="view-patient-chapter"
              key="patient"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {selectedHospitalId === null ? (
                <MapSection initialSpecialty={preferredSpecialty} />
              ) : (
                <HospitalDetails />
              )}
            </motion.div>
          )}

          {/* TAB 2: MY BOOKINGS LIST PORTFOLIO */}
          {activeTab === 'bookings' && (
            <motion.div
              id="view-bookings-chapter"
              key="bookings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <BookingList />
            </motion.div>
          )}

          {/* TAB 4: PATIENT MEDICAL PORTAL & REGISTER */}
          {activeTab === 'portal' && (
            <motion.div
              id="view-portal-chapter"
              key="portal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PatientPortal />
            </motion.div>
          )}

          {/* TAB 3: ADMIN INSTRUMENTS WORKSPACE */}
          {activeTab === 'admin' && (
            <motion.div
              id="view-admin-chapter"
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminPanel />
            </motion.div>
          )}

          {/* TAB 5: MEDICINE REMINDER REGIME */}
          {activeTab === 'reminders' && (
            <motion.div
              id="view-reminders-chapter"
              key="reminders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MedicineReminderSystem />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Branding with Mission & Vision */}
      <footer className="mt-24 border-t border-slate-205 bg-white/95 pt-14 pb-8 text-xs text-slate-500 backdrop-blur-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Mission & Vision split grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-slate-150">
            {/* Brand column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-manipal-blue text-white shadow-xs relative overflow-hidden">
                  <div className="absolute left-0 top-0 w-1 h-full bg-manipal-red" />
                  <HeartPulse className="h-5.5 w-5.5 animate-pulse text-white" />
                </div>
                <span className="font-sans text-lg font-black tracking-tight text-manipal-blue">
                  CareGrid
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-450 max-w-xs font-semibold">
                Surgically coordinating medical slots, bed availability, emergency ambulance vectors, and pristine practitioner schedules in one regional telemetry grid.
              </p>
            </div>

            {/* Mission column */}
            <div id="footer-mission" className="space-y-3">
              <div className="flex items-center gap-2 text-manipal-blue font-sans font-bold uppercase tracking-wider text-[11px]">
                <Target className="h-4.5 w-4.5 text-manipal-red" />
                Institutional Mission
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                To eliminate healthcare coordination friction by maintaining certified live grids of ICU resources, scanners, and doctors. We prioritize citizen access over administrative paperwork to optimize active critical responses.
              </p>
            </div>

            {/* Vision column */}
            <div id="footer-vision" className="space-y-3">
              <div className="flex items-center gap-2 text-manipal-blue font-sans font-bold uppercase tracking-wider text-[11px]">
                <Compass className="h-4.5 w-4.5 text-manipal-red" />
                Strategic Future Vision
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                To transform metropolitan patient flows into real-time synchronized assets. We aim for a secure digital medical ecosystem where no patient is ever turned away due to simple resource visibility failure.
              </p>
            </div>
          </div>

          {/* Bottom attribution */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-450 font-medium">
            <span className="font-sans text-xs">CareGrid Haldia Integrated Health Network — Associated with ICARE Institute of Medical Sciences</span>
            <p className="font-mono text-[9px] tracking-widest uppercase text-slate-400">
              © 2026 Dr. B.C. Roy Hospital (ICARE). All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <MedicalProvider>
      <AppContent />
    </MedicalProvider>
  );
}
export { App };
