export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Bed {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'reserved';
  patientName?: string;
  patientAge?: number;
  gender?: 'Male' | 'Female' | 'Other';
  admissionReason?: string;
}

export interface Ward {
  id: string;
  name: string; // "ICU", "General Male", "General Female", "Deluxe Cardiac", "Emergency Triage"
  pricePerDay: number;
  totalBeds: number;
  columns: number; // For rendering layout like BookMyShow (e.g. 8 beds per row)
  beds: Bed[];
}

export interface TestingFacility {
  id: string;
  name: string;
  price: number;
  duration: string;
  availability: string;
  description: string;
  requiresPrescription: boolean;
  category?: string; // e.g. "Non-Invasive Diagnostic", "Radiology Diagnostics", etc.
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  photo: string;
  rating: number;
  reviews: Review[];
  timings: string[]; // e.g. ["09:00 AM", "10:30 AM", "01:00 PM", "03:30 PM"]
  fee: number;
  bio: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  distance: number; // in km
  rating: number;
  reviewsCount: number;
  specialties: string[];
  facilities: string[];
  image: string;
  about: string;
  coordinates: { x: number; y: number }; // Relative coordinates on city map canvas (0-100)
  gpsCoordinates?: { lat: number; lng: number };
  wards: Ward[];
  doctors: Doctor[];
  testingFacilities: TestingFacility[];
  photos?: string[];
}

export interface Appointment {
  id: string;
  patientUserId?: string; // Optional if booked by a logged-in patient
  hospitalId: string;
  hospitalName: string;
  type: 'doctor' | 'facility';
  itemId: string; // Doctor ID or TestingFacility ID
  itemName: string; // Doctor Name or TestingFacility Name
  itemDetail?: string; // Doctor specialty or description
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  date: string;
  timeSlot: string;
  bedId?: string; // Optional if assigned a bed during emergency booking
  wardId?: string; // Optional
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked-in';
  createdAt: string;
  reason?: string;
}

export interface PatientUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  bloodGroup: string;
  gender: 'Male' | 'Female' | 'Other';
  medicalHistory: string;
  emergencyContact: string;
  createdAt: string;
  profileCompleted?: boolean;
}

export interface MedicineReminder {
  id: string;
  userId: string;
  medicineName: string;
  dosage: string;    // e.g. "1 tablet" or "10ml"
  timing: string;    // e.g. "08:15 AM" or custom text like "Morning (After Food)"
  frequency: string; // e.g. "Daily", "Weekly", "Twice a day"
  isActive: boolean;
  createdAt: string;
}

