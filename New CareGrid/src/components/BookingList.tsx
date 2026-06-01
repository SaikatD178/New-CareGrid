import React, { useState, useMemo } from 'react';
import { useMedical } from '../context/MedicalContext';
import { CalendarRange, XCircle, CheckCircle, Clock, FileText, AlertCircle, PhoneCall, Trash2, HeartPulse, User } from 'lucide-react';
import { motion } from 'motion/react';

export const BookingList: React.FC = () => {
  const { appointments, cancelAppointment, currentUser, isAdmin } = useMedical();
  const [filterUserOnly, setFilterUserOnly] = useState<boolean>(true);

  const handleCancel = (id: string, itemName: string) => {
    if (confirm(`PATIENT ACTION:\nAre you sure you want to cancel your scheduled appointment for "${itemName}"?`)) {
      cancelAppointment(id);
      alert('Appointment cancelled. If this is an emergency bed, the layout booking seat has been sanitly freed.');
    }
  };

  // Filter based on selected option and identity match
  const filteredAppointments = useMemo(() => {
    const isUserAdmin = isAdmin || currentUser?.email?.toLowerCase() === "saikatdhara91@gmail.com";

    if (isUserAdmin) {
      if (filterUserOnly && currentUser) {
        return appointments.filter(app => app.patientUserId === currentUser.id);
      }
      return appointments;
    }

    if (currentUser) {
      // Patients are strictly locked to their own patientUserId, ensuring 100% data separation
      return appointments.filter(app => app.patientUserId === currentUser.id);
    }

    return [];
  }, [appointments, currentUser, filterUserOnly, isAdmin]);

  return (
    <div id="booking-manifest" className="space-y-6">
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="font-sans text-xl font-bold tracking-tight text-slate-800">Your Appointment Dossier</h2>
          <p className="text-xs text-slate-400 mt-0.5">Observe current consultations, scanners queues, or direct emergency admissions.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {(isAdmin || currentUser?.email?.toLowerCase() === "saikatdhara91@gmail.com") && currentUser && (
            <div className="inline-flex rounded-lg border border-slate-205 p-0.5 bg-slate-100 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setFilterUserOnly(true)}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  filterUserOnly 
                    ? 'bg-manipal-blue text-white shadow-3xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                My Account
              </button>
              <button
                type="button"
                onClick={() => setFilterUserOnly(false)}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  !filterUserOnly 
                    ? 'bg-manipal-blue text-white shadow-3xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All bookings
              </button>
            </div>
          )}
          <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-bold text-slate-600 border border-slate-200">
            Total Displayed: {filteredAppointments.length}
          </span>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-slate-400 max-w-lg mx-auto mt-8">
          <CalendarRange className="mx-auto h-12 w-12 text-slate-350 animate-bounce" />
          <h3 className="mt-4 font-sans text-base font-bold text-slate-700">No appointments scheduled today</h3>
          <p className="mt-1 text-xs text-slate-400 leading-normal">
            No diagnostic sessions or doctor consulting schedules were found matching the selected view. Find closer hospitals on our map and register instantly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5">
          {filteredAppointments.map((app) => {
            const isCancelled = app.status === 'cancelled';
            const isBedBooking = app.itemName.toLowerCase().includes('bed');

            return (
              <div 
                id={`booking-card-${app.id}`}
                key={app.id} 
                className={`overflow-hidden rounded-2xl border bg-white shadow-2xs hover:shadow-xs transition-shadow duration-250 flex flex-col justify-between ${
                  isCancelled ? 'border-slate-150 bg-slate-50/55 opacity-70' : 'border-slate-100'
                }`}
              >
                {/* Visual Accent bar depending on booking type */}
                <div className={`h-1.5 w-full ${
                  isCancelled 
                    ? 'bg-slate-400' 
                    : isBedBooking 
                    ? 'bg-amber-500' 
                    : app.type === 'doctor' 
                    ? 'bg-cyan-600' 
                    : 'bg-teal-650'
                }`} />

                <div className="p-5.5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">Appointment Code: #{app.id.split('-')[1]}</span>
                      <h4 className="mt-1 font-sans text-sm font-extrabold text-slate-800 leading-snug">
                        {app.itemName}
                      </h4>
                      {app.itemDetail && (
                        <p className="text-[11px] text-slate-400 font-medium truncate max-w-[280px] mt-0.5">{app.itemDetail}</p>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-sans text-[10px] font-bold ${
                      app.status === 'cancelled'
                        ? 'bg-slate-100 text-slate-550 border border-slate-200'
                        : app.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                        : app.status === 'checked-in'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {app.status === 'cancelled' ? (
                        <>
                          <XCircle className="h-3 w-3 text-slate-500" />
                          Declined / Cancelled
                        </>
                      ) : app.status === 'pending' ? (
                        <>
                          <Clock className="h-3 w-3 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
                          Awaiting Approval
                        </>
                      ) : app.status === 'checked-in' ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-blue-600" />
                          Checked In
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 text-emerald-650" />
                          Confirmed
                        </>
                      )}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50/60 p-3.5 border border-slate-150 space-y-2 text-[11px] text-slate-600 font-medium">
                    <p className="font-sans text-xs font-bold text-slate-800 border-b border-slate-150 pb-1.5 flex items-center justify-between">
                      <span>Hospital Client Node:</span>
                      <span className="text-cyan-700 font-semibold">{app.hospitalName}</span>
                    </p>
                    <div className="flex justify-between">
                      <span>Scheduled Date:</span>
                      <span className="text-slate-800 font-bold">{app.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Timeline Hour Slot:</span>
                      <span className="text-slate-800 font-bold font-mono">{app.timeSlot}</span>
                    </div>
                  </div>

                  {/* Patient information details */}
                  <div className="space-y-1.5 text-[11px]">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-3">Admitted Patient</span>
                    <div className="grid grid-cols-2 gap-3 pb-1">
                      <div>
                        <span className="text-slate-400">Full Name</span>
                        <p className="font-bold text-slate-700">{app.patientName}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Contact Phone</span>
                        <p className="font-mono text-slate-700 select-all">{app.patientPhone}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <span className="text-slate-400">Gender / Age</span>
                        <p className="font-bold text-slate-700">{app.patientGender} • {app.patientAge} Yrs</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Category Service</span>
                        <span className="block font-bold text-cyan-600/95 capitalize">{app.type === 'doctor' ? 'Clinical Doctor Consult' : 'Imaging System / Lab'}</span>
                      </div>
                    </div>
                    {app.reason && (
                      <div className="bg-slate-50/80 border border-slate-150 rounded-lg p-2.5 mt-2.5 font-sans">
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Reason for Booking:</span>
                        <p className="text-slate-700 italic text-[11px] mt-0.5">"{app.reason}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cancel controls */}
                {!isCancelled && (
                  <div className="border-t border-slate-100 bg-slate-50/40 p-4 flex justify-between items-center text-xs">
                    <span className="text-slate-400 flex items-center gap-1 font-semibold text-[11px]">
                      <AlertCircle className="h-4 w-4 text-cyan-600 animate-pulse" />
                      Requires ID on check-in
                    </span>
                    <button
                      id={`btn-cancel-app-${app.id}`}
                      onClick={() => handleCancel(app.id, app.itemName)}
                      className="rounded-lg border border-red-200 hover:bg-red-50 px-3.5 py-1.5 font-semibold text-red-650 shadow-3xs transition-colors"
                    >
                      Cancel Registration
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
