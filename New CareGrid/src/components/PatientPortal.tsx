import React, { useState } from 'react';
import { useMedical } from '../context/MedicalContext';
import { PatientUser } from '../types';
import { 
  User, Mail, Lock, Phone, Calendar, Heart, ShieldAlert, 
  FileText, LogOut, CheckCircle2, UserCircle, KeyRound, 
  Activity, HeartPulse, Clock, FileCheck 
} from 'lucide-react';
import { motion } from 'motion/react';

export const PatientPortal: React.FC = () => {
  const { 
    currentUser, 
    registerUser, 
    loginUser, 
    logoutUser, 
    updateUserProfile, 
    appointments, 
    cancelAppointment,
    loginAsAdmin,
    isAdmin
  } = useMedical();

  // Auth View Local States
  const [isRegister, setIsRegister] = useState(false);
  const [portalLoginTab, setPortalLoginTab] = useState<'user' | 'admin'>('user');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form Fields - Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regBlood, setRegBlood] = useState('O+');
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [regHistory, setRegHistory] = useState('');
  const [regEmergency, setRegEmergency] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Profile Edit Local States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [editBlood, setEditBlood] = useState('');
  const [editHistory, setEditHistory] = useState('');
  const [editEmergency, setEditEmergency] = useState('');

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginEmail || !loginPassword) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (portalLoginTab === 'admin') {
      const res = await loginAsAdmin(loginEmail, loginPassword);
      if (res.success) {
        setSuccessMsg('Logged in as administrator successfully!');
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setErrorMsg(res.error || 'Administrator authentication failed.');
      }
    } else {
      const res = await loginUser(loginEmail, loginPassword);
      if (res.success) {
        setSuccessMsg('Logged in successfully!');
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setErrorMsg(res.error || 'Authentication failed.');
      }
    }
  };

  // Handle Register submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName || !regEmail || !regPhone || !regDob || !regPassword || !regEmergency) {
      setErrorMsg('Please populate all mandatory fields highlighted in red.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (regPassword.length < 5) {
      setErrorMsg('Password should be at least 5 characters for medical records grade security.');
      return;
    }

    const userData: Omit<PatientUser, 'id' | 'createdAt'> = {
      name: regName,
      email: regEmail,
      phone: regPhone,
      dob: regDob,
      bloodGroup: regBlood,
      gender: regGender,
      medicalHistory: regHistory || 'No pre-existing conditions reported',
      emergencyContact: regEmergency,
    };

    const res = await registerUser(userData, regPassword);
    if (res.success) {
      setSuccessMsg('Account created successfully and session authorized!');
      // Reset form fields
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegDob('');
      setRegHistory('');
      setRegEmergency('');
      setRegPassword('');
      setRegConfirmPassword('');
    } else {
      setErrorMsg(res.error || 'Registration failed.');
    }
  };

  // Start editing active profile
  const handleStartEdit = () => {
    if (!currentUser) return;
    setEditPhone(currentUser.phone);
    setEditBlood(currentUser.bloodGroup);
    setEditHistory(currentUser.medicalHistory);
    setEditEmergency(currentUser.emergencyContact);
    setIsEditingProfile(true);
  };

  // Save profile edits
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      phone: editPhone,
      bloodGroup: editBlood,
      medicalHistory: editHistory,
      emergencyContact: editEmergency,
    });
    setIsEditingProfile(false);
    setSuccessMsg('Health profile synchronized successfully.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Filter appointments specifically belonging to logged-in user
  const userAppointments = appointments.filter(app => {
    if (!currentUser) return [];
    return app.patientUserId === currentUser.id;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8" id="patient-portal-workbench">
      
      {/* Alert Banner feedback */}
      {(errorMsg || successMsg) && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2.5 shadow-xs ${
            errorMsg ? 'bg-red-50 text-manipal-red border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {errorMsg ? <ShieldAlert className="h-4.5 w-4.5 shrink-0" /> : <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />}
          <span>{errorMsg || successMsg}</span>
        </motion.div>
      )}

      {!currentUser ? (
        /* ======================== REGISTER & LOGIN VIEWS ======================== */
        <div className="grid grid-cols-1 md:grid-cols-12 rounded-3xl border border-slate-150 bg-white overflow-hidden shadow-sm">
          
          {/* Brand promo sidebar on desktop */}
          <div className="md:col-span-5 bg-gradient-to-br from-manipal-blue to-manipal-dark p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <HeartPulse className="w-96 h-96" />
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-manipal-blue shadow-md relative overflow-hidden">
                  <div className="absolute left-0 top-0 w-1 h-full bg-manipal-red" />
                  <HeartPulse className="h-5.5 w-5.5 text-manipal-blue animate-pulse" />
                </div>
                <span className="font-sans text-lg font-black tracking-tight">
                  CareGrid
                </span>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-black leading-tight text-white">Your Personal Secure Medical Registry</h3>
                <p className="text-sm text-rose-100/90 leading-relaxed font-semibold">
                  Access live hospital beds, certified practitioner calendars, and scan facilities with secure stateful memory.
                </p>
              </div>

              <div className="space-y-3.5 pt-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-rose-300" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-white">Auto-filled Consultations</h5>
                    <p className="text-[11px] text-slate-300">Your profile details automatically fill appointment forms for secure booking.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-rose-300" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-white">Interactive Ward Placement</h5>
                    <p className="text-[11px] text-slate-300">Reserve matching telemetry ICU or specialty beds connected directly to your patient login.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-rose-300" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-white">Digital Diagnostic Clearances</h5>
                    <p className="text-[11px] text-slate-300">View live durations, pricing, and required prescriptions for clinical imaging slots.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 mt-8">
              <p className="text-[10px] text-slate-300 leading-snug font-mono">
                To test clinical access immediately, try the pre-seeded account:
                <br />
                <span className="text-white font-bold select-all">patient@caregrid.org</span> (Key: <span className="text-white font-bold select-all">patient123</span>)
              </p>
            </div>
          </div>

          {/* Authentication forms (7 cols) */}
          <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
            
            {/* Tab togglers */}
            <div className="flex border-b border-slate-150 mb-8 self-start">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMsg(null);
                }}
                className={`pb-3 text-sm font-bold border-b-2 px-4 transition-all uppercase tracking-wider text-xs ${
                  !isRegister 
                    ? 'border-manipal-red text-manipal-blue font-extrabold' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setErrorMsg(null);
                }}
                className={`pb-3 text-sm font-bold border-b-2 px-4 transition-all uppercase tracking-wider text-xs ${
                  isRegister 
                    ? 'border-manipal-red text-manipal-blue font-extrabold' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Register Medical ID
              </button>
            </div>

            {!isRegister ? (
              /* SIGN IN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xl font-black text-manipal-blue font-sans">
                    {portalLoginTab === 'admin' ? "Administrator portal login" : "Patient portal login"}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {portalLoginTab === 'admin' 
                      ? "Enter Administrator credentials authorized to govern health registries." 
                      : "Provide medical portal email and passphrase authenticated at time of registration."
                    }
                  </p>
                </div>

                {/* Sub-tab roles */}
                <div className="flex border border-slate-150 p-1 rounded-xl bg-slate-50/70 max-w-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setPortalLoginTab('user');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`flex-1 py-1.5 text-[10px] font-bold text-center rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                      portalLoginTab === 'user'
                        ? 'bg-white shadow-xs text-manipal-blue font-extrabold'
                        : 'text-slate-400 hover:text-slate-650'
                    }`}
                  >
                    1. Patient User
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPortalLoginTab('admin');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`flex-1 py-1.5 text-[10px] font-bold text-center rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                      portalLoginTab === 'admin'
                        ? 'bg-white shadow-xs text-manipal-blue font-extrabold'
                        : 'text-slate-400 hover:text-slate-650'
                    }`}
                  >
                    2. Admin Portal
                  </button>
                </div>

                <div className="space-y-3.5 pt-2">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      {portalLoginTab === 'admin' ? "Administrator Email" : "Email Address"}
                    </label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Mail className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder={portalLoginTab === 'admin' ? "saikatdhara91@gmail.com" : "patient@caregrid.org"}
                        className="w-full rounded-lg border border-slate-205 bg-slate-50/50 py-2.5 pr-4 pl-10 text-xs focus:border-manipal-red focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-105 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      {portalLoginTab === 'admin' ? "Security Passkey" : "Authorized Passkey"}
                    </label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <KeyRound className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-slate-205 bg-slate-50/50 py-2.5 pr-4 pl-10 text-xs focus:border-manipal-red focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-105 transition-colors"
                      />
                    </div>
                  </div>

                  {portalLoginTab === 'admin' && (
                    <div className="rounded-lg bg-cyan-50 border border-cyan-100 p-3 text-xs text-cyan-850 leading-normal font-sans font-medium">
                      🛡️ Only designated system administrator <strong>saikatdhara91@gmail.com</strong> with password <strong>Saikat@2003</strong> is authorized to access the clinical console.
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-manipal-blue hover:bg-manipal-hover-blue text-white py-3 text-xs font-extrabold uppercase tracking-wider shadow-md transition-colors mt-2 cursor-pointer"
                  >
                    {portalLoginTab === 'admin' ? 'Authorize Session as Administrator' : 'Authenticate Medical File'}
                  </button>
                </div>
              </form>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xl font-black text-manipal-blue">Register Patient Registry</h4>
                  <p className="text-xs text-slate-400">Initialize care tracking, persistent history catalogs, and automatic booking layouts.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Full Patient Name <strong className="text-manipal-red">*</strong></label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full rounded-lg border border-slate-205 bg-slate-50/50 py-2.5 pr-4 pl-10 text-xs focus:border-manipal-red focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-105 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Email Address <strong className="text-manipal-red">*</strong></label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Mail className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="jane.doe@example.com"
                        className="w-full rounded-lg border border-slate-205 bg-slate-50/50 py-2.5 pr-4 pl-10 text-xs focus:border-manipal-red focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-105 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Contact Number <strong className="text-manipal-red">*</strong></label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Phone className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 91234 56789"
                        className="w-full rounded-lg border border-slate-205 bg-slate-50/50 py-2.5 pr-4 pl-10 text-xs focus:border-manipal-red focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-105 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Date of Birth <strong className="text-manipal-red">*</strong></label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Calendar className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="date"
                        value={regDob}
                        onChange={(e) => setRegDob(e.target.value)}
                        className="w-full rounded-lg border border-slate-205 bg-slate-50/50 py-2.5 pr-4 pl-10 text-xs focus:border-manipal-red focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-105 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Blood Group</label>
                    <select
                      value={regBlood}
                      onChange={(e) => setRegBlood(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-205 bg-slate-50/50 p-2.5 text-xs focus:border-manipal-red focus:bg-white"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Gender</label>
                    <select
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value as any)}
                      className="mt-1 w-full rounded-lg border border-slate-205 bg-slate-50/50 p-2.5 text-xs focus:border-manipal-red focus:bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Emergency Contact No <strong className="text-manipal-red">*</strong></label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <ShieldAlert className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={regEmergency}
                        onChange={(e) => setRegEmergency(e.target.value)}
                        placeholder="Emergency phone no"
                        className="w-full rounded-lg border border-slate-205 bg-slate-50/50 py-2.5 pr-4 pl-10 text-xs focus:border-manipal-red focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-105 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Known Clinical History</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FileText className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={regHistory}
                        onChange={(e) => setRegHistory(e.target.value)}
                        placeholder="E.g., Hypertension, asthma, none"
                        className="w-full rounded-lg border border-slate-205 bg-slate-50/50 py-2.5 pr-4 pl-10 text-xs focus:border-manipal-red focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-105 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Choose password <strong className="text-manipal-red">*</strong></label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 5 characters"
                        className="w-full rounded-lg border border-slate-205 bg-slate-50/50 py-2.5 pr-4 pl-10 text-xs focus:border-manipal-red focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-105 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Confirm password <strong className="text-manipal-red">*</strong></label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-slate-205 bg-slate-50/50 py-2.5 pr-4 pl-10 text-xs focus:border-manipal-red focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-105 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-manipal-blue hover:bg-manipal-hover-blue text-white py-3 text-xs font-extrabold uppercase tracking-wider shadow-md transition-colors mt-4"
                >
                  Create Certified Medical profile
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* ======================== ACTIVE LOGGED IN PATIENT DASHBOARD ======================== */
        <div className="space-y-6">
          
          {/* Welcome User Header Card */}
          <div className="rounded-3xl bg-gradient-to-r from-manipal-blue via-[#002874] to-manipal-dark text-white p-6 md:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <UserCircle className="w-96 h-96" />
            </div>

            <div className="flex items-center gap-4.5 z-10">
              <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner relative overflow-hidden shrink-0">
                <div className="absolute left-0 top-0 w-2 h-full bg-manipal-red" />
                <User className="h-9 w-9 text-rose-100" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-thin border-rose-500/30 px-2.5 py-0.5 text-[10px] font-bold text-rose-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
                  Stateful Patient ID Active
                </div>
                <h2 className="font-sans text-2xl font-black tracking-tight leading-none mt-1">Hello, {currentUser.name}</h2>
                <p className="text-xs text-rose-100 font-semibold font-mono">Member ID: CG-PA-{currentUser.id.split('-')[1] || currentUser.id.slice(-6).toUpperCase()}</p>
              </div>
            </div>

            <button
              id="btn-patient-logout"
              onClick={logoutUser}
              className="flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/20 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-500 hover:border-red-650 hover:text-white transition-all shadow-xs z-10"
            >
              <LogOut className="h-4 w-4" />
              Terminate Session
            </button>
          </div>

          {/* Quick Simulation Telemetry Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-2xs flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 text-orange-600 shrink-0">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Heart Rate</span>
                <span className="text-base font-black text-slate-800">74 <span className="text-[10px] text-slate-400 font-medium">BPM</span></span>
              </div>
            </div>

            <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-2xs flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-600 shrink-0">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Blood Pressure</span>
                <span className="text-base font-black text-slate-800">118/76 <span className="text-[10px] text-slate-400 font-medium">mmHg</span></span>
              </div>
            </div>

            <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-2xs flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-50 flex items-center justify-center border border-cyan-100 text-cyan-600 shrink-0">
                <Heart className="h-5 w-5 fill-cyan-500" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Oxygen Saturation</span>
                <span className="text-base font-black text-slate-800">99% <span className="text-[10px] text-slate-400 font-medium">SpO2</span></span>
              </div>
            </div>

            <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-2xs flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100 text-manipal-red shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Telemetry Check</span>
                <span className="text-xs font-bold text-slate-650">Live Sync</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Health Profile Card (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-sans text-sm font-black text-manipal-blue uppercase tracking-widest flex items-center gap-2">
                    <User className="h-4.5 w-4.5 text-manipal-red" />
                    Clinical health dossier
                  </h3>
                  {!isEditingProfile && (
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="text-xs font-extrabold text-manipal-red hover:underline"
                    >
                      Edit Dossier
                    </button>
                  )}
                </div>

                {!isEditingProfile ? (
                  <div className="space-y-4 pt-4 text-xs">
                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date of Birth</span>
                        <span className="font-mono text-slate-700 font-bold">{currentUser.dob}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blood Group</span>
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-red-100 text-manipal-red font-black font-mono text-xs">{currentUser.bloodGroup}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Email</span>
                        <span className="text-slate-700 font-bold truncate block">{currentUser.email}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient Phone</span>
                        <span className="text-slate-700 font-bold font-mono">{currentUser.phone}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emergency Contact Person / No</span>
                      <span className="text-xs font-extrabold text-manipal-red font-mono block mt-1">{currentUser.emergencyContact}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Core Clinical History Records</span>
                      <p className="mt-1 text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 leading-relaxed font-semibold">
                        {currentUser.medicalHistory || 'No reported cardiac, respiratory, or diabetic histories.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-4 pt-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450">Contact Number</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-205 p-2 text-xs focus:border-manipal-red focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450">Blood Group</label>
                      <select
                        value={editBlood}
                        onChange={(e) => setEditBlood(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-205 p-2 text-xs focus:border-manipal-red focus:bg-white"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450">Emergency Contact</label>
                      <input
                        type="text"
                        value={editEmergency}
                        onChange={(e) => setEditEmergency(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-205 p-2 text-xs focus:border-manipal-red focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450">Known Clinic History</label>
                      <textarea
                        value={editHistory}
                        onChange={(e) => setEditHistory(e.target.value)}
                        rows={3}
                        className="mt-1 w-full rounded-lg border border-slate-205 p-2 text-xs focus:border-manipal-red focus:bg-white"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="w-1/2 rounded-lg bg-slate-100 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="w-1/2 rounded-lg bg-manipal-blue py-2 text-xs font-bold text-white hover:bg-manipal-hover-blue"
                      >
                        Sync Dossier
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Patient Specific Clinical Bookings List (8 cols) */}
            <div className="lg:col-span-8">
              <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs h-full flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-sans text-sm font-black text-manipal-blue uppercase tracking-widest flex items-center gap-2">
                    <FileCheck className="h-4.5 w-4.5 text-manipal-red" />
                    Authenticated Slot Reservations ({userAppointments.length})
                  </h3>
                </div>

                {userAppointments.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-105 mb-3 animate-pulse">
                      <Clock className="h-6 w-6" />
                    </div>
                    <h5 className="text-slate-700 font-bold text-sm">No synchronized bookings found</h5>
                    <p className="mt-1 text-slate-400 text-[11px] max-w-sm font-semibold">
                      Any new appointments or ICU/Ward beds you book in the "Find Hospitals" tab will be mapped securely to this dossier.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 overflow-y-auto max-h-[380px] pr-1 mt-3 space-y-3.5">
                    {userAppointments.map(app => (
                      <div key={app.id} className="pt-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-800">{app.itemName}</span>
                            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">({app.type === 'doctor' ? 'Clinical Consult' : 'Diagnostics Slot'})</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 font-medium">
                            <span className="font-semibold text-manipal-blue">{app.hospitalName}</span>
                            <span className="font-mono text-[10px]">🗓️ {app.date} | ⏰ {app.timeSlot}</span>
                            {app.bedId && (
                              <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">Bed reserved: {app.bedId.split('-').slice(-2).join('-').toUpperCase()}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            app.status === 'confirmed' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : app.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                              : app.status === 'checked-in'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-red-50 text-manipal-red border-red-100'
                          }`}>
                            {app.status === 'confirmed' 
                              ? 'Active / Synchronized' 
                              : app.status === 'pending'
                              ? 'Awaiting Approval'
                              : app.status === 'checked-in'
                              ? 'Checked In'
                              : 'Declined / Cancelled'}
                          </span>

                          {(app.status === 'confirmed' || app.status === 'pending') && (
                            <button
                              id={`btn-cancel-appt-${app.id}`}
                              onClick={() => {
                                if (confirm(`Are you sure you want to cancel booking for "${app.itemName}"?`)) {
                                  cancelAppointment(app.id);
                                }
                              }}
                              className="text-[10px] font-bold text-slate-400 hover:text-manipal-red transition-colors py-1 px-2 hover:bg-red-50 rounded-md cursor-pointer border border-transparent hover:border-red-100"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
