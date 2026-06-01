import React, { useState } from 'react';
import { useMedical } from '../context/MedicalContext';
import { 
  ShieldCheck, Lock, Mail, Phone, Calendar, Heart, 
  Sparkles, KeyRound, ArrowRight, HeartPulse,
  Eye, EyeOff, ChevronRight, X, User, UserCheck, UserCog
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PatientUser } from '../types';

export const LoginGate: React.FC = () => {
  const { loginUser, registerUser, loginAsAdmin } = useMedical();

  // Portal selection state
  const [selectedPortal, setSelectedPortal] = useState<'student' | 'admin' | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Input Password Mask Toggler
  const [showPassword, setShowPassword] = useState(false);

  // Core messaging
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form Fields - Sign-in
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Form Fields - Patient Registration
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regBlood, setRegBlood] = useState('O+');
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [regEmergency, setRegEmergency] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const openPortalModal = (portal: 'student' | 'admin') => {
    setSelectedPortal(portal);
    setIsRegisterMode(false);
    setErrorMsg(null);
    setSuccessMsg(null);
    setEmail('');
    setPassword('');
    setShowPassword(false);
  };

  const closePortalModal = () => {
    setSelectedPortal(null);
    setIsRegisterMode(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (selectedPortal === 'admin') {
        const res = await loginAsAdmin(email, password);
        if (res.success) {
          setSuccessMsg('Administrator session approved! Entering console...');
          setTimeout(() => {
            closePortalModal();
          }, 800);
        } else {
          setErrorMsg(res.error || 'Clinical Administrator authentication failed.');
        }
      } else if (selectedPortal === 'student') {
        const res = await loginUser(email, password);
        if (res.success) {
          setSuccessMsg('Patient credentials authorized! Opening dashboard...');
          setTimeout(() => {
            closePortalModal();
          }, 800);
        } else {
          setErrorMsg(res.error || 'Credentials mismatch. Please verify registration files.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName || !regEmail || !regPhone || !regDob || !regPassword || !regEmergency) {
      setErrorMsg('Please populate all mandatory fields marked with an asterisk.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (regPassword.length < 5) {
      setErrorMsg('Password should be at least 5 characters for clinical security standards.');
      return;
    }

    setIsLoading(true);
    try {
      const userData: Omit<PatientUser, 'id' | 'createdAt'> & { profileCompleted: boolean } = {
        name: regName,
        email: regEmail,
        phone: regPhone,
        dob: regDob,
        bloodGroup: regBlood,
        gender: regGender,
        medicalHistory: 'Registered on CareGrid Gateway',
        emergencyContact: regEmergency,
        profileCompleted: true
      };

      const res = await registerUser(userData, regPassword);
      if (res.success) {
        setSuccessMsg('Authorized account constructed successfully!');
        setEmail(regEmail);
        setPassword(regPassword);
        setTimeout(() => {
          setIsRegisterMode(false);
          setSuccessMsg(null);
        }, 1200);
      } else {
        setErrorMsg(res.error || 'Account construction rejected.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative w-full flex flex-col justify-center items-center p-4 bg-gradient-to-tr from-slate-100 via-slate-50 to-rose-50/50 selection:bg-rose-100 selection:text-manipal-red">
      
      {/* Top Header Grid Title */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 max-w-7xl mx-auto w-full px-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px] tracking-widest text-manipal-blue/70 uppercase font-bold">
            Secure Gateway Active
          </span>
        </div>
        <div className="hidden sm:block">
          <span className="font-mono text-[10px] tracking-widest text-[#003087]/50 font-semibold">
            saikatdhara91@gmail.com
          </span>
        </div>
      </div>

      {/* Main Form Center Content */}
      <div className="w-full max-w-lg z-20 mx-auto">
        <AnimatePresence mode="wait">
          {!selectedPortal ? (
            /* ==================== SELECT PORTAL SCREEN ==================== */
            <motion.div
              key="gateway"
              initial={{ scale: 0.98, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] flex flex-col items-center"
            >
              <div className="relative flex items-center justify-center mb-6">
                <span className="absolute inline-flex h-16 w-16 rounded-full bg-manipal-red/5 animate-ping" />
                <div className="relative h-14 w-14 rounded-2xl bg-manipal-blue text-white shadow-md flex items-center justify-center overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-manipal-red" />
                  <HeartPulse className="h-7 w-7 text-white" />
                </div>
              </div>

              <div className="text-center mb-8">
                <h1 className="text-2xl font-black tracking-tight text-manipal-blue leading-tight">
                  CareGrid Portal
                </h1>
                <p className="text-[10px] font-mono font-bold tracking-widest text-manipal-red uppercase mt-1">
                  Alliance Regional Telemetry
                </p>
                <p className="text-xs text-slate-500 mt-3 font-medium max-w-xs leading-relaxed">
                  Clinically coordinating acute operations, active practitioner rosters, and real-time medical vectors.
                </p>
              </div>

              <div className="space-y-4 w-full">
                
                {/* Patient Portal */}
                <button
                  onClick={() => openPortalModal('student')}
                  className="w-full text-left bg-slate-50/55 hover:bg-slate-50 text-slate-800 p-4 rounded-xl flex items-center justify-between cursor-pointer border border-slate-200/60 hover:border-manipal-blue/30 shadow-none hover:shadow-xs transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-manipal-light-red transition-all">
                      <User className="h-5 w-5 text-manipal-blue group-hover:text-manipal-red group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-slate-800">Patient Portal</span>
                      <span className="text-[11px] text-slate-450 font-medium">Schedule check-ins & manage care</span>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-slate-100/50 flex items-center justify-center text-slate-400 group-hover:text-manipal-blue group-hover:translate-x-0.5 transition-all">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </button>

                {/* Admin Portal */}
                <button
                  onClick={() => openPortalModal('admin')}
                  className="w-full text-left bg-slate-50/55 hover:bg-slate-50 text-slate-800 p-4 rounded-xl flex items-center justify-between cursor-pointer border border-slate-200/60 hover:border-manipal-red/30 shadow-none hover:shadow-xs transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-red-50 transition-all">
                      <UserCog className="h-5 w-5 text-manipal-red group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-slate-800">Administrator Console</span>
                      <span className="text-[11px] text-slate-450 font-medium">Configure medical hubs & spared inventories</span>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-slate-100/50 flex items-center justify-center text-slate-400 group-hover:text-manipal-red group-hover:translate-x-0.5 transition-all">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </button>

              </div>
            </motion.div>
          ) : (
            /* ==================== LOGIN/REGISTRATION FORM SCREEN ==================== */
            <motion.div
              key="detail"
              initial={{ scale: 0.98, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-manipal-blue">
                    {isRegisterMode 
                      ? 'Patient Profile Dossier' 
                      : `Sign In - ${selectedPortal === 'student' ? 'Patient' : 'Admin'}`
                    }
                  </h2>
                  <p className="text-xs text-slate-450 mt-0.5 font-medium">
                    {isRegisterMode ? 'Build clinical citizen ledger' : 'Authorize secure session key'}
                  </p>
                </div>
                <button 
                  onClick={closePortalModal}
                  className="p-1.5 rounded-lg bg-slate-100/50 border border-slate-200/40 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Status Message feedback banner */}
              {(successMsg || errorMsg) && (
                <div className="mb-5">
                  {successMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
                      <span>{successMsg}</span>
                    </div>
                  )}
                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 text-center">
                      {errorMsg}
                    </div>
                  )}
                </div>
              )}

              {/* Login mode vs registration mode toggle */}
              {!isRegisterMode ? (
                /* ---------------- LOGIN SIGN IN FORM ---------------- */
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  
                  <div className="flex flex-col items-center text-center py-2">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-manipal-blue flex items-center justify-center shadow-inner mb-3">
                      <Lock className="h-5 w-5 stroke-[2.2]" />
                    </div>
                    <p className="text-xs font-semibold text-slate-455 max-w-xs">
                      Please enter your credentials to gain authorized access.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Unique Email input field */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                        Secure Email Address
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                          <Mail className="h-4 w-4" />
                        </span>
                        <input
                          type="email"
                          required
                          disabled={isLoading}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={
                            selectedPortal === 'admin' 
                              ? "saikatdhara91@gmail.com" 
                              : "patient@caregrid.org"
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-manipal-blue focus:ring-1 focus:ring-manipal-blue/30 focus:bg-slate-50/20 transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Masked Password entry */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                        Security Phrase / Password
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                          <KeyRound className="h-4 w-4" />
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          disabled={isLoading}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-manipal-blue focus:ring-1 focus:ring-manipal-blue/30 focus:bg-slate-50/20 transition-all font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Helpers & Registry Notes */}
                  {selectedPortal === 'admin' && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-[11px] text-amber-800 leading-relaxed font-semibold">
                      🛡️ Admin Note: System credentials for administrator account are configured in local medical roster parameters.
                    </div>
                  )}

                  {/* Patient registration toggle */}
                  {selectedPortal === 'student' && (
                    <div className="text-center py-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs text-slate-500 font-semibold">New patient checkout?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegisterMode(true);
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="ml-1.5 text-xs font-bold text-manipal-red hover:underline cursor-pointer transition-colors"
                      >
                        Form Patient Profile →
                      </button>
                    </div>
                  )}

                  {/* Symmetrical Actions Section */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                    <button
                      type="button"
                      onClick={closePortalModal}
                      className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-650 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl cursor-pointer transition-all"
                    >
                      Return
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-manipal-blue hover:bg-manipal-hover-blue rounded-xl shadow-xs cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5"
                    >
                      {isLoading ? 'Verifying...' : 'Sign in'}
                      {!isLoading && <ArrowRight className="h-4 w-4" />}
                    </button>
                  </div>

                </form>
              ) : (
                /* ---------------- USER REGISTRATION FORM ---------------- */
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  
                  <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                        Full Patient Name <span className="text-manipal-red">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Saikat Dhara"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-450 focus:outline-none focus:border-manipal-blue transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                        Email Address <span className="text-manipal-red">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. patient@caregrid.org"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-450 focus:outline-none focus:border-manipal-blue transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                        Contact Phone (+91) <span className="text-manipal-red">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-450 focus:outline-none focus:border-manipal-blue transition-all font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                          Date of Birth <span className="text-manipal-red">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={regDob}
                          onChange={(e) => setRegDob(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-manipal-blue transition-all font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">Blood Group</label>
                        <select
                          value={regBlood}
                          onChange={(e) => setRegBlood(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-manipal-blue cursor-pointer font-semibold"
                        >
                          <option>O+</option>
                          <option>O-</option>
                          <option>A+</option>
                          <option>A-</option>
                          <option>B+</option>
                          <option>B-</option>
                          <option>AB+</option>
                          <option>AB-</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">Gender</label>
                        <select
                          value={regGender}
                          onChange={(e) => setRegGender(e.target.value as any)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-manipal-blue cursor-pointer font-semibold"
                        >
                          <option value="Male font-semibold">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                          Emergency Contact <span className="text-manipal-red">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={regEmergency}
                          onChange={(e) => setRegEmergency(e.target.value)}
                          placeholder="+91 Emergency contact"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-450 focus:outline-none focus:border-manipal-blue transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                        Secure Password <span className="text-manipal-red">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min. 5 characters"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-450 focus:outline-none focus:border-manipal-blue transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                        Confirm Secure Password <span className="text-manipal-red">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Must match password"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-450 focus:outline-none focus:border-manipal-blue transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(false);
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="px-4 py-2.5 text-xs font-bold text-slate-650 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl cursor-pointer"
                    >
                      ← Gateway
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-manipal-red hover:bg-red-650 rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? 'Creating Ledger...' : 'Form Dossier'}
                    </button>
                  </div>

                </form>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer information */}
      <footer className="mt-12 py-3 text-center border-t border-slate-200/50 w-full max-w-2xl z-20">
        <p className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
          CareGrid Secure Access Socket • Associated with ICARE Institute of Medical Sciences
        </p>
      </footer>

    </div>
  );
};
