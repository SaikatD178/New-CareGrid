import React, { useState } from 'react';
import { useMedical } from '../context/MedicalContext';
import { 
  User, Phone, Calendar, Heart, ShieldAlert, FileText, 
  Sparkles, CheckCircle2, HeartPulse, UserCircle, X 
} from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile } = useMedical();
  
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [dob, setDob] = useState(currentUser?.dob || '');
  const [bloodGroup, setBloodGroup] = useState(currentUser?.bloodGroup || 'O+');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(currentUser?.gender || 'Male');
  const [medicalHistory, setMedicalHistory] = useState(currentUser?.medicalHistory || '');
  const [emergencyContact, setEmergencyContact] = useState(currentUser?.emergencyContact || '');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!phone || !dob || !emergencyContact || !medicalHistory) {
      setErrorMsg('Please populate all missing patient details to update your secure health file.');
      return;
    }

    setIsLoading(true);
    try {
      await updateUserProfile({
        phone,
        dob,
        bloodGroup,
        gender,
        medicalHistory,
        emergencyContact,
        profileCompleted: true
      });
      setSuccessMsg('Your certified medical dossier is now successfully constructed!');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error synchronizing patient file.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[2.5px]">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl shadow-3xl border border-slate-200/80 w-full max-w-lg overflow-hidden flex flex-col"
      >
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <UserCircle className="h-5.5 w-5.5 text-indigo-600" />
            <h2 className="text-base font-black text-[#1e293b] tracking-tight">
              Complete Your Patient File
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-500 font-medium">
            CareGrid mandates a complete medical ledger before scheduling ICU beds or consult slots.
          </p>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-150 text-xs font-semibold text-center text-red-650 text-red-600">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-150 text-xs font-bold text-center text-emerald-800 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Contact Number <strong className="text-red-500">*</strong>
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Phone className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 99999 99999"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pr-4 pl-9 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Date of Birth <strong className="text-red-500">*</strong>
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pr-4 pl-9 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Biological Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full mt-1 rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs focus:border-indigo-500 focus:outline-none cursor-pointer bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full mt-1 rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs focus:border-indigo-500 focus:outline-none cursor-pointer bg-white"
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

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Emergency Contact Number <strong className="text-red-500">*</strong>
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Heart className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="+91 Emergency Line"
                className="w-full rounded-xl border border-slate-200 py-2.5 pr-4 pl-9 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Pre-existing Medical History <strong className="text-red-500">*</strong>
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FileText className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="e.g. Hypertension, Diabetes, None"
                className="w-full rounded-xl border border-slate-200 py-2.5 pr-4 pl-9 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
            >
              Close
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 text-white" />
              <span>{isLoading ? 'Saving...' : 'Lock-in Patient File'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
