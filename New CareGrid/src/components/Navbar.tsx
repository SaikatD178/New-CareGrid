import React, { useState } from 'react';
import { useMedical } from '../context/MedicalContext';
import { 
  Home, Activity, ShieldCheck, UserCheck, LogOut, CalendarRange, 
  HeartPulse, Stethoscope, ChevronDown, UserCircle, Settings, Pill
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { ProfileCompletionModal } from './ProfileCompletionModal';

interface NavbarProps {
  activeTab: 'home' | 'patient' | 'admin' | 'bookings' | 'portal' | 'reminders';
  setActiveTab: (tab: 'home' | 'patient' | 'admin' | 'bookings' | 'portal' | 'reminders') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { 
    isAdmin, 
    logoutAdmin, 
    setSelectedHospitalId, 
    appointments, 
    currentUser, 
    logoutUser 
  } = useMedical();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const activeAppointmentsCount = appointments.filter(a => 
    a && a.status !== 'cancelled' && (currentUser ? a.patientUserId === currentUser.id : true)
  ).length;

  return (
    <>
      {/* Super Top Utility Bar */}
      <div className="bg-manipal-dark text-slate-100 text-[11px] font-medium py-2 px-4 border-b border-manipal-blue/40">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-2">
          {/* Slogan & Hotline */}
          <div className="flex items-center gap-4.5">
            <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-manipal-red">
              <span className="inline-block h-2 w-2 rounded-full bg-manipal-red animate-ping" />
              Emergency 24x7 Hotline:
            </span>
            <a href="tel:18001025555" className="font-mono font-bold hover:underline tracking-wide text-white bg-manipal-red/80 px-2 py-0.5 rounded-md font-bold">
              1800-102-5555
            </a>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden md:inline text-slate-200">
              Slogan: <strong className="text-white">Lifeson's Partner • Life's On</strong>
            </span>
          </div>
          
          {/* Small Navigation Help and Admin Access info */}
          <div className="flex items-center gap-4 text-[10px] text-slate-300 font-mono">
            <span className="hover:text-white transition-colors cursor-default">
              Total Safe Beds Active: <strong className="text-emerald-400 font-bold">{activeAppointmentsCount + 82}</strong>
            </span>
            <span>•</span>
            <span className="text-amber-300 font-semibold">CareGrid Specialty Standards Certified 🛡️</span>
          </div>
        </div>
      </div>

      <header id="nav-header" className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo Brand Style */}
          <div 
            id="nav-logo"
            className="flex cursor-pointer items-center space-x-2.5"
            onClick={() => {
              setSelectedHospitalId(null);
              setActiveTab('home');
            }}
          >
            {/* Elegant Shield Blue & Red Logo Icon */}
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-manipal-blue text-white shadow-md relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-manipal-red" />
              <HeartPulse className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <span className="font-sans text-xl font-black tracking-tight text-manipal-blue block">
                CareGrid
              </span>
              <span className="block font-mono text-[9px] uppercase tracking-widest text-[#003087] font-bold">Partner in Health</span>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav id="nav-items" className="flex items-center space-x-1 sm:space-x-3">
            <button
              id="btn-nav-home"
              onClick={() => {
                setSelectedHospitalId(null);
                setActiveTab('home');
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-manipal-blue text-white shadow-xs'
                  : 'text-slate-650 hover:bg-slate-100 hover:text-manipal-blue'
              }`}
            >
              <Home className="h-4 w-4" />
              Home
            </button>

            <button
              id="btn-nav-hospitals"
              onClick={() => {
                setSelectedHospitalId(null);
                setActiveTab('patient');
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'patient'
                  ? 'bg-manipal-blue text-white shadow-xs'
                  : 'text-slate-650 hover:bg-slate-100 hover:text-manipal-blue'
              }`}
            >
              <Stethoscope className="h-4 w-4" />
              Find Hospitals
            </button>

            <button
              id="btn-nav-appointments"
              onClick={() => setActiveTab('bookings')}
              className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-manipal-blue text-white shadow-xs'
                  : 'text-slate-650 hover:bg-slate-100 hover:text-manipal-blue'
              }`}
            >
              <CalendarRange className="h-4 w-4" />
              My Bookings
              {activeAppointmentsCount > 0 && (
                <span className="absolute -top-1 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-manipal-red px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {activeAppointmentsCount}
                </span>
              )}
            </button>

            {currentUser && !isAdmin && (
              <button
                id="btn-nav-reminders"
                onClick={() => setActiveTab('reminders')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'reminders'
                    ? 'bg-manipal-blue text-white shadow-xs'
                    : 'text-slate-650 hover:bg-slate-100 hover:text-manipal-blue'
                }`}
              >
                <Pill className="h-4 w-4" />
                Pill Reminders
              </button>
            )}

            <div className="h-5 w-px bg-slate-200" />

            {/* Symmetrical Top-Right Sign-in Dropdown Section */}
            <div className="relative">
              {isAdmin ? (
                <div className="flex items-center gap-1">
                  <button
                    id="btn-nav-admin-dropdown"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 rounded-lg border border-teal-200 px-3.5 py-1.5 text-xs font-bold text-teal-700 bg-teal-50/60 hover:bg-teal-50 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0" />
                    <span className="truncate max-w-[140px]">Saikat Dhara (Admin)</span>
                    <ChevronDown className="h-3 w-3 text-teal-600" />
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                      <div className="absolute right-0 mt-8 w-48 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-55 text-slate-700">
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setActiveTab('admin');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Settings className="h-4 w-4 text-slate-500" />
                          Admin Console
                        </button>
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            logoutAdmin();
                            setActiveTab('home');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 text-xs font-bold text-red-600 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 text-red-600" />
                          Log Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : currentUser ? (
                <div className="flex items-center gap-1">
                  {/* The unified Sign In section that displays Name when logged in */}
                  <button
                    id="btn-nav-user-dropdown"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 rounded-lg border border-red-150 px-3.5 py-1.5 text-xs font-bold text-manipal-blue bg-rose-50/50 hover:bg-rose-50/80 transition-all cursor-pointer"
                  >
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="truncate max-w-[140px]">{currentUser.name}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                      <div className="absolute right-0 mt-8 w-48 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-55 text-slate-700">
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsProfileModalOpen(true);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <UserCheck className="h-4 w-4 text-slate-500" />
                          Complete Profile
                        </button>
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            logoutUser();
                            setActiveTab('home');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 text-xs font-bold text-red-600 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 text-red-600" />
                          Log Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Fallback Sign in button if no session is active */
                <button
                  id="btn-nav-sign-in"
                  onClick={() => alert('Access token required. Please reload or sign in through the initial gateway.')}
                  className="flex items-center gap-1.5 rounded-lg border border-indigo-200 px-4 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 transition-all cursor-pointer"
                >
                  <UserCircle className="h-4 w-4 text-indigo-600" />
                  Sign In
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* On-demand interactive Profile Completion modal */}
      <ProfileCompletionModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </>
  );
};
