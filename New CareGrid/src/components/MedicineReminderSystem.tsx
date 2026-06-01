import React, { useState, useEffect, useMemo } from 'react';
import { useMedical } from '../context/MedicalContext';
import { 
  Pill, Clock, Plus, Trash2, Edit3, CheckCircle, Bell, BellOff, 
  Search, Check, ShieldAlert, Sparkles, Calendar, ToggleLeft, ToggleRight,
  Info, RotateCcw, Volume2, VolumeX, AlertTriangle, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MedicineReminder } from '../types';

export const MedicineReminderSystem: React.FC = () => {
  const { reminders, addReminder, updateReminder, deleteReminder, currentUser, isAdmin } = useMedical();

  // Component UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('1 tablet');
  const [timing, setTiming] = useState('08:00');
  const [frequency, setFrequency] = useState('Daily');
  const [customDosage, setCustomDosage] = useState('');
  const [customFrequency, setCustomFrequency] = useState('');

  // Notifications State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeAlerts, setActiveAlerts] = useState<MedicineReminder[]>([]);
  const [notifiedKeys, setNotifiedKeys] = useState<{ [key: string]: boolean }>({});
  const [takenToday, setTakenToday] = useState<{ [key: string]: string }>({}); // reminderId -> ISO string timestamp

  // Presets
  const dosagePresets = ['1 tablet', '2 tablets', '1 capsule', '5 ml', '10 ml', '1 puff', '2 drops', 'Custom'];
  const frequencyPresets = ['Daily', 'Twice a day', 'Three times a day', 'Weekly', 'Every other day', 'Custom'];
  
  // Quick-tag suggest for medication category
  const suggestedMeds = [
    { name: 'Paracetamol', dosage: '1 tablet', freq: 'Daily (as needed)' },
    { name: 'Amoxicillin', dosage: '1 capsule', freq: 'Three times a day' },
    { name: 'Metformin', dosage: '1 tablet', freq: 'Twice a day' },
    { name: 'Atorvastatin', dosage: '1 tablet', freq: 'Daily' },
    { name: 'Cetirizine', dosage: '1 tablet', freq: 'Daily' },
    { name: 'Vitamin D3', dosage: '1 tablet', freq: 'Weekly' },
    { name: 'Albuterol Inhaler', dosage: '2 puffs', freq: 'Every other day' }
  ];

  // Helper time formatter (e.g. "08:30" -> "08:30 AM")
  const formatTime12h = (time24: string) => {
    if (!time24) return '';
    try {
      const [hourStr, minStr] = time24.split(':');
      let hour = parseInt(hourStr, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12;
      hour = hour ? hour : 12; // true 00 -> 12
      return `${hour.toString().padStart(2, '0')}:${minStr} ${ampm}`;
    } catch {
      return time24;
    }
  };

  // Sound Engine
  const playFriendlyBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitched friendly beep
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15); // play for 150ms
    } catch (e) {
      console.warn("Audio Context beep thwarted by browser interaction policy:", e);
    }
  };

  const playAlarmSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Sequence of double notes
      const notes = [660, 660, 880];
      const start = audioCtx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start + idx * 0.25);
        gain.gain.setValueAtTime(0.08, start + idx * 0.25);
        osc.start(start + idx * 0.25);
        osc.stop(start + idx * 0.25 + 0.15);
      });
    } catch (e) {
      // safe bypass browser audio blockages
    }
  };

  // Real-time local polling clock for trigger alarms
  useEffect(() => {
    const checkAlarms = () => {
      if (!currentUser) return;
      
      const now = new Date();
      const localHrs = now.getHours().toString().padStart(2, '0');
      const localMins = now.getMinutes().toString().padStart(2, '0');
      const timeStr24 = `${localHrs}:${localMins}`; // "08:30"
      const dateKey = now.toDateString(); // "Sun May 31 2026"

      reminders.forEach(rem => {
        if (!rem.isActive) return;

        // Check format matches "HH:MM". Handles exact minute match
        if (rem.timing === timeStr24) {
          const finishedAlertKey = `${rem.id}-${dateKey}-${timeStr24}`;

          // Only trigger if we have not notified the user for this exact minute of today
          if (!notifiedKeys[finishedAlertKey]) {
            setNotifiedKeys(prev => ({ ...prev, [finishedAlertKey]: true }));
            setActiveAlerts(prev => {
              // Avoid duplicate alerts in the queue
              if (prev.some(a => a.id === rem.id)) return prev;
              return [...prev, rem];
            });
            playAlarmSound();
          }
        }
      });
    };

    // Run immediately and every 10 seconds to check for exact transitions
    checkAlarms();
    const interval = setInterval(checkAlarms, 10000);
    return () => clearInterval(interval);
  }, [reminders, notifiedKeys, currentUser, soundEnabled]);

  // Handle preset selector or custom inputs
  const finalDosage = useMemo(() => {
    return dosage === 'Custom' ? customDosage : dosage;
  }, [dosage, customDosage]);

  const finalFrequency = useMemo(() => {
    return frequency === 'Custom' ? customFrequency : frequency;
  }, [frequency, customFrequency]);

  // Suggested item auto filler
  const applySuggested = (item: typeof suggestedMeds[0]) => {
    setMedName(item.name);
    setDosage(item.dosage.includes('tablet') || item.dosage.includes('capsule') || item.dosage.includes('ml') || item.dosage.includes('puff') ? item.dosage : 'Custom');
    if (!['1 tablet', '2 tablets', '1 capsule', '5 ml', '10 ml', '1 puff', '2 drops'].includes(item.dosage)) {
      setCustomDosage(item.dosage);
    }
    setFrequency(item.freq.includes('Daily') || item.freq.includes('pulse') ? 'Daily' : 'Custom');
    if (!['Daily', 'Twice a day', 'Three times a day', 'Weekly', 'Every other day'].includes(item.freq)) {
      setCustomFrequency(item.freq);
    }
    playFriendlyBeep();
  };

  // Submit form (Add or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;

    const medData = {
      medicineName: medName.trim(),
      dosage: finalDosage || '1 tablet',
      timing: timing,
      frequency: finalFrequency || 'Daily'
    };

    if (editingId) {
      await updateReminder(editingId, medData);
      setEditingId(null);
    } else {
      await addReminder(medData);
    }

    // Reset Form fields
    setMedName('');
    setDosage('1 tablet');
    setCustomDosage('');
    setFrequency('Daily');
    setCustomFrequency('');
    playFriendlyBeep();
  };

  const startEdit = (rem: MedicineReminder) => {
    setEditingId(rem.id);
    setMedName(rem.medicineName);
    
    if (dosagePresets.includes(rem.dosage)) {
      setDosage(rem.dosage);
      setCustomDosage('');
    } else {
      setDosage('Custom');
      setCustomDosage(rem.dosage);
    }

    setTiming(rem.timing);

    if (frequencyPresets.includes(rem.frequency)) {
      setFrequency(rem.frequency);
      setCustomFrequency('');
    } else {
      setFrequency('Custom');
      setCustomFrequency(rem.frequency);
    }
    playFriendlyBeep();
  };

  const toggleReminderStatus = async (rem: MedicineReminder) => {
    await updateReminder(rem.id, { isActive: !rem.isActive });
    playFriendlyBeep();
  };

  // Handle Mark as Consumed / Dismissed
  const handleMarkAsTaken = (reminderId: string) => {
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTakenToday(prev => ({
      ...prev,
      [reminderId]: timestampStr
    }));
    setActiveAlerts(prev => prev.filter(a => a.id !== reminderId));
    playFriendlyBeep();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this medicine reminder?')) {
      await deleteReminder(id);
      playFriendlyBeep();
    }
  };

  // Filtering reminders
  const filteredReminders = useMemo(() => {
    return reminders.filter(r => {
      const matchesSearch = r.medicineName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = 
        filterActive === 'all' ? true :
        filterActive === 'active' ? r.isActive : !r.isActive;
      return matchesSearch && matchesFilter;
    });
  }, [reminders, searchTerm, filterActive]);

  // Deny Administrative Logins
  if (isAdmin) {
    return (
      <div id="medicine-reminder-admin-locked" className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white border border-red-200 shadow-sm rounded-2xl p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-red-50 text-manipal-red rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-9 w-9" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-manipal-blue">Administrative Isolation</h2>
          <p className="text-xs font-semibold text-manipal-red font-mono uppercase tracking-widest mt-1">
            Access Restrained
          </p>
          <p className="text-sm text-slate-550 max-w-lg mt-4 leading-relaxed font-semibold">
            In compliance with patient confidentiality protocols, the unified Medicine Reminder telemetry dashboard is strictly isolated to authenticated patient users. Administrative login sessions are barred from configuring dose diaries.
          </p>
        </div>
      </div>
    );
  }

  // Fallback for non-authenticated profiles
  if (!currentUser) {
    return (
      <div id="medicine-reminder-auth-locked" className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-rose-50 text-manipal-red rounded-full flex items-center justify-center mb-4">
            <Clock className="h-9 w-9 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-manipal-blue">Credential Authentication Required</h2>
          <p className="text-sm text-slate-550 max-w-lg mt-3 leading-relaxed font-semibold">
            Please register a clinical file or authenticate through the initial security gateway to deploy dynamic local pill alarm grids.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="medicine-reminder-telemetry" className="space-y-6">
      
      {/* 1. ON-SCREEN ALARM POPUP TRIGGER SYSTEM */}
      <AnimatePresence>
        {activeAlerts.length > 0 && (
          <div className="fixed inset-x-4 bottom-6 z-50 max-w-md mx-auto">
            {activeAlerts.map(alertItem => (
              <motion.div
                key={alertItem.id}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                className="bg-white border-2 border-manipal-red text-slate-800 p-5 rounded-2xl shadow-2xl flex flex-col gap-4 relative overflow-hidden ring-4 ring-manipal-red/15"
              >
                {/* Visual red glowing accent */}
                <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-manipal-red animate-pulse" />

                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-full bg-red-50 text-manipal-red flex items-center justify-center shrink-0 animate-bounce">
                    <Pill className="h-6 w-6 stroke-[2.3]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-manipal-red uppercase bg-red-100 border border-red-200 px-2 py-0.5 rounded-md tracking-wider">
                        ⏰ Ingestion Alarm
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-semibold">
                        Due: {formatTime12h(alertItem.timing)}
                      </span>
                    </div>
                    <h4 className="mt-1.5 text-base font-black text-manipal-blue leading-tight truncate">
                      {alertItem.medicineName}
                    </h4>
                    <p className="text-xs text-slate-500 font-bold mt-1">
                      Dosage: <strong className="text-slate-800">{alertItem.dosage}</strong> • Frequency: {alertItem.frequency}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => handleMarkAsTaken(alertItem.id)}
                    className="w-full bg-manipal-red hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark Consumed
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* 2. MAIN HEADER SUMMARY PANELS */}
      <div className="bg-gradient-to-r from-manipal-blue to-manipal-dark text-white rounded-2xl px-6 py-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-manipal-red border border-red-400/20 px-3 py-1 text-[11px] font-mono tracking-widest uppercase font-bold text-white">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Patient Care Module Secure
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Clinical Dosage & Pill Diary
            </h2>
            <p className="text-xs text-rose-50/70 font-semibold max-w-xl">
              Chronologically coordinate your medical consumption slots. Set system reminders to trigger active visual alerts and auditory chime triggers.
            </p>
          </div>

          {/* Inline Quick Action Controls */}
          <div className="flex items-center gap-3">
            {/* Audio Toggle button */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playFriendlyBeep();
              }}
              className={`p-2.5 rounded-xl border font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                soundEnabled 
                  ? 'bg-white/10 border-white/20 text-white hover:bg-white/15' 
                  : 'bg-red-950/20 border-red-500/30 text-rose-300 hover:bg-red-950/40'
              }`}
              title={soundEnabled ? "Mute Alarms" : "Enable Alarms Audio"}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" />
                  <span className="hidden sm:inline">Chime On</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4 text-red-400" />
                  <span className="hidden sm:inline">Muted</span>
                </>
              )}
            </button>
            <div className="bg-white/10 rounded-xl px-4 py-2 border border-white/15">
              <span className="block text-[9px] font-bold font-mono uppercase text-rose-100 tracking-wider">Scheduler telemetry</span>
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Active Reminders: {reminders.filter(r => r.isActive).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CORE INTERACTIVE CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: MEDICATION LIST (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-2xl shadow-none p-5 space-y-4">
            
            {/* Search and Filters Strip */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              
              {/* Custom Search Box */}
              <div className="relative w-full sm:-max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search medication name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-manipal-blue transition-all font-semibold"
                />
              </div>

              {/* Toggle filters */}
              <div className="flex rounded-xl bg-slate-100/75 p-1 w-full sm:w-auto">
                {(['all', 'active', 'inactive'] as const).map(tabKey => (
                  <button
                    key={tabKey}
                    onClick={() => {
                      setFilterActive(tabKey);
                      playFriendlyBeep();
                    }}
                    className={`flex-1 sm:flex-none capitalize px-3.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      filterActive === tabKey
                        ? 'bg-white text-manipal-blue shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tabKey}
                  </button>
                ))}
              </div>
            </div>

            {/* List rendered with spring animations */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {filteredReminders.length > 0 ? (
                  filteredReminders.map(rem => {
                    const isTaken = !!takenToday[rem.id];
                    return (
                      <motion.div
                        id={`reminder-card-${rem.id}`}
                        key={rem.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.18 }}
                        className={`border rounded-xl p-4 transition-all hover:bg-slate-50/40 relative group ${
                          !rem.isActive 
                            ? 'bg-slate-50/50 border-slate-150 shadow-none opacity-65' 
                            : 'bg-white border-slate-200 shadow-2xs'
                        }`}
                      >
                        {/* Floating absolute active indicator indicator */}
                        {rem.isActive && (
                          <div className="absolute right-4 top-4 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </div>
                        )}

                        <div className="flex items-start gap-3.5">
                          {/* Left icon box */}
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
                            !rem.isActive 
                              ? 'bg-slate-100 border-slate-200 text-slate-400' 
                              : 'bg-rose-50/65 border-rose-100 text-manipal-red'
                          }`}>
                            <Pill className="h-5 w-5" />
                          </div>

                          {/* Center data info */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-black text-manipal-blue leading-tight truncate">
                                {rem.medicineName}
                              </h3>
                              {isTaken && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md">
                                  <Check className="h-2.5 w-2.5" />
                                  Taken ({takenToday[rem.id]})
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 font-semibold flex items-center gap-x-2.5 gap-y-1 flex-wrap">
                              <span className="inline-flex items-center gap-1">
                                <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                Dosage: <strong className="text-slate-800">{rem.dosage}</strong>
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="inline-flex items-center gap-1 font-mono text-manipal-blue bg-blue-50/50 border border-blue-100 px-1.5 py-0.3 rounded text-[10px]">
                                <Clock className="h-3 w-3 text-manipal-blue" />
                                {formatTime12h(rem.timing)}
                              </span>
                            </p>

                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-450 mt-1">
                              <span className="bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-md">
                                {rem.frequency}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-[10px] text-slate-400 font-mono font-medium">
                                Configured: {new Date(rem.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons strip with smooth hover transition */}
                        <div className="flex items-center justify-between border-t border-slate-100 mt-4.5 pt-3.5">
                          {/* Pill status trigger */}
                          <button
                            onClick={() => toggleReminderStatus(rem)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold font-mono tracking-wide hover:text-manipal-blue text-slate-500 cursor-pointer"
                          >
                            {rem.isActive ? (
                              <>
                                <ToggleRight className="h-5 w-5 text-emerald-500 shrink-0" />
                                <span className="text-emerald-600 font-semibold">Alarm Active</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="h-5 w-5 text-slate-400 shrink-0" />
                                <span className="text-slate-450 font-semibold font-bold">Alarm Paused</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-2">
                            {/* Mark taken action */}
                            {rem.isActive && !isTaken && (
                              <button
                                onClick={() => handleMarkAsTaken(rem.id)}
                                className="p-1 px-2 text-[10px] font-bold text-emerald-700 hover:text-white border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-600 rounded-lg cursor-pointer transition-all duration-150 flex items-center gap-1"
                                title="Quick mark taken for today"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Taken
                              </button>
                            )}

                            <button
                              onClick={() => startEdit(rem)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-650 hover:border-manipal-blue hover:text-manipal-blue transition-colors cursor-pointer"
                              title="Edit reminder schedule"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(rem.id)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-450 hover:border-red-400 hover:text-manipal-red transition-colors cursor-pointer"
                              title="Delete reminder schedule"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <BellOff className="h-6 w-6 text-slate-450" />
                    </div>
                    <span className="text-xs font-bold text-slate-600 block">No Medicine Reminders</span>
                    <span className="text-[11px] text-slate-400 max-w-xs block mt-1 leading-relaxed">
                      You haven't designed any medicine reminder timers yet. Configure your schedules on the right panel to test live alarms.
                    </span>
                  </div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* 4. CLINICAL SAFETY DISCLOSURE PANEL */}
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 flex gap-3.5">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-[11px] font-bold text-amber-805 uppercase tracking-wide">
                Patient Self-Management Statement
              </h5>
              <p className="text-[11px] text-amber-705 leading-relaxed font-semibold">
                CareGrid's integrated pill telemetry is an assistive advisory alarm grid only. Always consult with certified medical practitioners regarding precise pharmaceutical times, dosages, and interactions. Never base crucial medical procedures on computer telemetry only.
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: MEDICATION SCHEDULER FORM (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Quick suggestions panel */}
          {!editingId && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Sparkles className="h-4.5 w-4.5 text-manipal-red animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-manipal-blue">
                  Common Prescriptions Quick-Add
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[145px] overflow-y-auto pr-1">
                {suggestedMeds.map((med, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => applySuggested(med)}
                    className="text-left bg-slate-50 border border-slate-200 hover:border-rose-200 hover:bg-rose-50/30 p-2 rounded-xl transition-all duration-150 cursor-pointer text-slate-700 flex flex-col group min-w-0"
                  >
                    <span className="text-[11px] font-bold text-slate-800 line-clamp-1 group-hover:text-manipal-red">
                      {med.name}
                    </span>
                    <span className="text-[9px] font-medium text-slate-500 mt-0.5">
                      {med.dosage} • {med.freq.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Scheduler Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden">
            {editingId && (
              <div className="absolute right-4 top-4">
                <span className="text-[9px] font-bold font-mono text-purple-700 bg-purple-100 px-2.5 py-0.5 border border-purple-200 rounded-md uppercase animate-pulse">
                  Modifying Item
                </span>
              </div>
            )}

            <div className="border-b border-slate-100 pb-3 mb-5">
              <h3 className="text-sm font-black text-manipal-blue flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-manipal-red" />
                {editingId ? 'Modify Medication Schedule' : 'Schedule Medication Alarm'}
              </h3>
              <p className="text-[10px] text-slate-450 mt-0.5 font-medium">
                {editingId ? 'Update your current prescription parameters' : 'Enregister a new clinical tablet to secure alerts'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Medicine Name Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                  Medicine Name <span className="text-manipal-red">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Pill className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="e.g. Paracetamol 650mg"
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 font-semibold focus:outline-none focus:border-manipal-blue focus:ring-1 focus:ring-manipal-blue/20 transition-all"
                  />
                </div>
              </div>

              {/* Dosage Select and Custom Input Row */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                    Dosage Amount
                  </label>
                  <select
                    value={dosage}
                    onChange={(e) => {
                      setDosage(e.target.value);
                      playFriendlyBeep();
                    }}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white px-2.5 py-2.5 text-slate-800 font-bold focus:outline-none focus:border-manipal-blue cursor-pointer"
                  >
                    {dosagePresets.map(preset => (
                      <option key={preset} value={preset}>{preset}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 text-right flex flex-col justify-end">
                  {dosage === 'Custom' ? (
                    <input
                      type="text"
                      required
                      value={customDosage}
                      onChange={(e) => setCustomDosage(e.target.value)}
                      placeholder="e.g. 15 ml or 1/2 tab"
                      className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 font-bold focus:outline-none focus:border-manipal-blue"
                    />
                  ) : (
                    <div className="text-left bg-slate-55 border border-dashed border-slate-200 rounded-xl px-3 py-2 text-[10px] text-slate-455 font-mono font-semibold">
                      Selected: <strong>{dosage}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Timing input */}
              <div className="grid grid-cols-2 gap-3.5 items-end">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                    Consumption Time <span className="text-manipal-red">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Clock className="h-4 w-4" />
                    </span>
                    <input
                      type="time"
                      required
                      value={timing}
                      onChange={(e) => setTiming(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 bg-white pl-9 pr-2 py-2 text-slate-800 font-bold focus:outline-none focus:border-manipal-blue focus:ring-1 focus:ring-manipal-blue/20 transition-all shrink-0"
                    />
                  </div>
                </div>

                {/* Nice 12 hour AM/PM feedback preview bubble */}
                <div className="text-center font-mono font-bold bg-slate-100 border border-slate-200/50 text-[#003087] rounded-xl py-2 px-3 text-xs flex flex-col justify-center select-none shrink-0 border border-dashed border-[#003087]/29">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400">Preview Clock</span>
                  <span className="text-[12px] font-extrabold mt-0.5">{formatTime12h(timing)}</span>
                </div>
              </div>

              {/* Frequency Inputs */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => {
                      setFrequency(e.target.value);
                      playFriendlyBeep();
                    }}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white px-2.5 py-2.5 text-slate-800 font-bold focus:outline-none focus:border-manipal-blue cursor-pointer"
                  >
                    {frequencyPresets.map(preset => (
                      <option key={preset} value={preset}>{preset}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 text-right flex flex-col justify-end">
                  {frequency === 'Custom' ? (
                    <input
                      type="text"
                      required
                      value={customFrequency}
                      onChange={(e) => setCustomFrequency(e.target.value)}
                      placeholder="e.g. Every 12 Hours"
                      className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 font-bold focus:outline-none focus:border-manipal-blue"
                    />
                  ) : (
                    <div className="text-left bg-slate-55 border border-dashed border-slate-200 rounded-xl px-3 py-2 text-[10px] text-slate-455 font-mono font-semibold">
                      Frequency: <strong>{frequency}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Symmetrical actions strip */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-6">
                
                {/* Reset button if editing */}
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setMedName('');
                      setDosage('1 tablet');
                      setCustomDosage('');
                      setFrequency('Daily');
                      setCustomFrequency('');
                      playFriendlyBeep();
                    }}
                    className="px-4 py-2.5 text-xs font-bold uppercase hover:bg-slate-50 rounded-xl cursor-pointer border border-slate-250 flex items-center gap-1 text-slate-600 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-manipal-blue hover:bg-manipal-hover-blue rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  {editingId ? 'Modify Alarm' : 'Set Alarm'}
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
