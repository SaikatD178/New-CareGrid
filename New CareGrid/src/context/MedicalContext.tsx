import React, { createContext, useContext, useState, useEffect } from "react";
import { Hospital, Doctor, Ward, Bed, Appointment, Review, TestingFacility, PatientUser, MedicineReminder } from "../types";
import { INITIAL_HOSPITALS } from "../data/initialData";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  where,
  addDoc 
} from "firebase/firestore";

interface MedicalContextType {
  hospitals: Hospital[];
  appointments: Appointment[];
  selectedHospitalId: string | null;
  setSelectedHospitalId: (id: string | null) => void;
  isAdmin: boolean;
  loginAsAdmin: (email: string, passwordString: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
  
  // Patient Auth & Profile
  currentUser: PatientUser | null;
  registerUser: (userData: Omit<PatientUser, 'id' | 'createdAt'>, passwordString: string) => Promise<{ success: boolean; error?: string }>;
  loginUser: (email: string, passwordString: string) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;
  updateUserProfile: (updatedUser: Partial<PatientUser>) => Promise<void>;
  
  // Hospital CRUD
  addHospital: (hospital: Omit<Hospital, 'id' | 'wards' | 'doctors' | 'testingFacilities' | 'distance' | 'rating' | 'reviewsCount'>) => void;
  updateHospital: (id: string, updatedData: Partial<Hospital>) => void;
  deleteHospital: (id: string) => void;
  
  // Doctor CRUD
  addDoctor: (hospitalId: string, doctor: Omit<Doctor, 'id' | 'reviews' | 'rating'>) => void;
  updateDoctor: (hospitalId: string, doctorId: string, updatedData: Partial<Doctor>) => void;
  deleteDoctor: (hospitalId: string, doctorId: string) => void;
  
  // Diagnostic Facility Config
  addTestingFacility: (hospitalId: string, facility: Omit<TestingFacility, 'id'>) => void;
  deleteTestingFacility: (hospitalId: string, facilityId: string) => void;

  // Bed Actions
  updateBedStatus: (
    hospitalId: string,
    wardId: string,
    bedId: string,
    status: 'available' | 'occupied' | 'reserved',
    details?: { patientName?: string; patientAge?: number; gender?: 'Male' | 'Female' | 'Other'; admissionReason?: string }
  ) => void;

  // Patient Bookings
  bookAppointment: (appointmentData: Omit<Appointment, 'id' | 'status' | 'createdAt'>) => Appointment;
  cancelAppointment: (id: string) => Promise<void>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  addReviewToDoctor: (hospitalId: string, doctorId: string, review: Omit<Review, 'id' | 'date'>) => void;

  // Medicine Reminders
  reminders: MedicineReminder[];
  addReminder: (reminderData: Omit<MedicineReminder, 'id' | 'userId' | 'createdAt' | 'isActive'>) => Promise<void>;
  updateReminder: (id: string, updatedData: Partial<MedicineReminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
}

const MedicalContext = createContext<MedicalContextType | undefined>(undefined);

export const MedicalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<PatientUser | null>(null);
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);

  // Validate Firestore Connection on Startup
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error) {
        if (error instanceof Error && error.message.includes("offline")) {
          console.warn("Firestore offline: verifying connection credentials and endpoint connectivity.");
        }
      }
    }
    testConnection();
  }, []);

  // Initialize and load Hospitals and Admin session from LocalStorage
  useEffect(() => {
    const storedHospitals = localStorage.getItem("caregrid_hospitals");
    const adminSession = localStorage.getItem("caregrid_admin_active");

    if (
      storedHospitals && 
      storedHospitals.includes("hosp-bc-roy") && 
      storedHospitals.includes("f-lab-cbc") && 
      storedHospitals.includes("w-icu-picu-nicu") && 
      storedHospitals.includes("Dr. Soumya Sarathi Martin")
    ) {
      setHospitals(JSON.parse(storedHospitals));
    } else {
      setHospitals(INITIAL_HOSPITALS);
      localStorage.setItem("caregrid_hospitals", JSON.stringify(INITIAL_HOSPITALS));
    }

    if (adminSession === "true") {
      setIsAdmin(true);
    }
  }, []);

  // Initialize and load Appointments on startup
  useEffect(() => {
    const storedAppointments = localStorage.getItem("caregrid_appointments");
    if (storedAppointments) {
      try {
        setAppointments(JSON.parse(storedAppointments));
      } catch (e) {
        console.error("Error loading cached appointments:", e);
      }
    }
  }, []);

  // Sync appointments to localStorage on change
  useEffect(() => {
    if (appointments.length > 0) {
      localStorage.setItem("caregrid_appointments", JSON.stringify(appointments));
    }
  }, [appointments]);

  // Realtime synchronization of Auth User profile
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch Patient Profile from Firestore
        try {
          let userDoc;
          try {
            userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          } catch (getErr) {
            handleFirestoreError(getErr, OperationType.GET, `users/${firebaseUser.uid}`);
            throw getErr;
          }

          if (userDoc.exists()) {
            setCurrentUser(userDoc.data() as PatientUser);
          } else {
            // Profile fallback mapping
            const fallbackUser: PatientUser = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || "Anonymous Patient",
              email: firebaseUser.email || "",
              phone: firebaseUser.phoneNumber || "+91 99999 99999",
              dob: "1990-01-01",
              bloodGroup: "O+",
              gender: "Other",
              medicalHistory: "",
              emergencyContact: "",
              createdAt: new Date().toISOString()
            };
            try {
              await setDoc(doc(db, "users", firebaseUser.uid), fallbackUser);
            } catch (setErr) {
              handleFirestoreError(setErr, OperationType.WRITE, `users/${firebaseUser.uid}`);
              throw setErr;
            }
            setCurrentUser(fallbackUser);
          }
        } catch (error) {
          console.error("Error retrieving user profile from Firestore:", error);
          
          // Resilient Fallback - Create dynamic safe profile locally so the user is never locked out of the site layout
          const localFallback: PatientUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "Authenticated Citizen",
            email: firebaseUser.email || "",
            phone: firebaseUser.phoneNumber || "+91 99999 99999",
            dob: "1990-01-01",
            bloodGroup: "O+",
            gender: "Other",
            medicalHistory: "Offline/Fallback Dossier Active",
            emergencyContact: "+91 99999 99999",
            createdAt: new Date().toISOString()
          };
          setCurrentUser(localFallback);
        }
      } else {
        // Not authenticated
        setCurrentUser(null);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Realtime synchronization of All or Owner-specific Appointments
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const appointmentsRef = collection(db, "appointments");
    let q;

    // Determine query based on Admin status or current authenticated user
    if (isAdmin || currentUser?.email?.toLowerCase() === "saikatdhara91@gmail.com") {
      // Admins (or developer account) can read ALL appointments
      q = query(appointmentsRef);
    } else if (currentUser) {
      // Logged in patients only read their own appointments
      q = query(appointmentsRef, where("patientUserId", "==", currentUser.id));
    } else {
      // Unauthenticated / Anonymous visitors
      q = null;
    }

    if (q) {
      unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const list: Appointment[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Appointment);
          });
          list.sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
          setAppointments(list);
        },
        (error) => {
          console.warn("Firestore live appointments subscription delayed or offline style: ", error);
        }
      );
    } else {
      // If anonymous, load/cache details from localStorage so they are not wiped!
      const stored = localStorage.getItem("caregrid_appointments");
      if (stored) {
        try {
          setAppointments(JSON.parse(stored));
        } catch (e) {
          setAppointments([]);
        }
      } else {
        setAppointments([]);
      }
    }

    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, [isAdmin, currentUser]);

  // Realtime synchronization of Medicine Reminders
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    if (currentUser) {
      const remindersRef = collection(db, "reminders");
      const q = query(remindersRef, where("userId", "==", currentUser.id));

      unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const list: MedicineReminder[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as MedicineReminder);
          });
          list.sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
          setReminders(list);
        },
        (error) => {
          console.warn("Firestore live reminders subscription delayed: ", error);
        }
      );
    } else {
      setReminders([]);
    }

    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, [currentUser]);

  const saveHospitals = (updatedHospitals: Hospital[]) => {
    setHospitals(updatedHospitals);
    localStorage.setItem("caregrid_hospitals", JSON.stringify(updatedHospitals));
  };

  // Auth Admin
  const loginAsAdmin = async (
    email: string,
    passwordString: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (email.toLowerCase() === "saikatdhara91@gmail.com" && passwordString === "Saikat@2003") {
      try {
        // Authenticate with Firebase Auth so the user state is updated in Firebase as well
        try {
          await signInWithEmailAndPassword(auth, email, passwordString);
        } catch (signInErr: any) {
          // If the user does not exist in Firebase, auto register them
          if (
            signInErr.code === "auth/user-not-found" || 
            signInErr.code === "auth/invalid-credential" || 
            signInErr.message?.includes("user-not-found") ||
            signInErr.message?.includes("invalid-credential")
          ) {
            try {
              const cred = await createUserWithEmailAndPassword(auth, email, passwordString);
              const adminUid = cred.user.uid;
              // Also initialize their profile document
              const fallbackAdmin: PatientUser = {
                id: adminUid,
                name: "Saikat Dhara",
                email: email,
                phone: "+91 99999 99999",
                dob: "2003-01-01",
                bloodGroup: "O+",
                gender: "Male",
                medicalHistory: "Lead Administrator of CareGrid Systems.",
                emergencyContact: "+91 99999 99999",
                createdAt: new Date().toISOString()
              };
              try {
                await setDoc(doc(db, "users", adminUid), fallbackAdmin);
              } catch (dbErr) {
                handleFirestoreError(dbErr, OperationType.WRITE, `users/${adminUid}`);
                throw dbErr;
              }
            } catch (regErr) {
              console.error("Auto-registration of admin failed: ", regErr);
            }
          } else {
            console.warn("Sign-in with Firebase returned non-fatal error: ", signInErr);
          }
        }
        setIsAdmin(true);
        localStorage.setItem("caregrid_admin_active", "true");
        return { success: true };
      } catch (error: any) {
        console.error("Firebase Admin Login Error: ", error);
        // Fall back to local admin session so saikatdhara91@gmail.com / Saikat@2003 works robustly
        setIsAdmin(true);
        localStorage.setItem("caregrid_admin_active", "true");
        return { success: true };
      }
    }
    return { success: false, error: "Access denied. Only saikatdhara91@gmail.com with password Saikat@2003 can authorize as Administrator." };
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    localStorage.setItem("caregrid_admin_active", "false");
  };

  // Firebase Auth Patient Sign Up
  const registerUser = async (
    userData: Omit<PatientUser, "id" | "createdAt">,
    passwordString: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, userData.email, passwordString);
      const uid = cred.user.uid;

      const newUser: PatientUser = {
        ...userData,
        id: uid,
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, "users", uid), newUser);
      } catch (dbErr) {
        handleFirestoreError(dbErr, OperationType.WRITE, `users/${uid}`);
        throw dbErr;
      }
      setCurrentUser(newUser);
      return { success: true };
    } catch (error: any) {
      console.error("Firebase Registration Error: ", error);
      let errorMsg = "User creation has failed.";
      if (error && error.code) {
        if (error.code === "auth/email-already-in-use" || error.message?.includes("email-already-in-use")) {
          errorMsg = "This email is already in use by another medical profile. Please go to Sign In instead.";
        } else if (error.code === "auth/weak-password" || error.message?.includes("weak-password")) {
          errorMsg = "The password is too weak. Please use a password with at least 5 characters.";
        } else if (error.code === "auth/invalid-email" || error.message?.includes("invalid-email")) {
          errorMsg = "The email address layout is invalid.";
        } else {
          errorMsg = error.message || errorMsg;
        }
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      return { success: false, error: errorMsg };
    }
  };

  // Firebase Auth Patient Sign In
  const loginUser = async (
    email: string,
    passwordString: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, passwordString);
      return { success: true };
    } catch (error: any) {
      console.error("Firebase SignIn Error: ", error);
      // Auto-create developer or pre-seeded demo accounts on failure so users can log in instantly
      if (
        (email === "patient@caregrid.org" && passwordString === "patient123") ||
        (email === "saikatdhara91@gmail.com" && (passwordString === "patient123" || passwordString === "admin123"))
      ) {
        try {
          const isDevEmail = email === "saikatdhara91@gmail.com";
          const userData = {
            name: isDevEmail ? "Saikat Dhara" : "Demo Patient",
            email: email,
            phone: "+91 98765 43210",
            dob: "1990-01-01",
            bloodGroup: "O+",
            gender: "Male" as const,
            medicalHistory: isDevEmail ? "Lead Developer and Clinical Admin." : "No pre-existing conditions reported",
            emergencyContact: "+91 98765 55555"
          };
          const res = await registerUser(userData, passwordString);
          if (res.success) {
            return res;
          }
          if (res.error?.includes("already in use") || res.error?.includes("already-in-use")) {
            // Already created, but password entered didn't match auth record or sign-in rejected
            return { success: false, error: "Incorrect password for this medical profile. Please verify your credentials." };
          }
          return res;
        } catch (createErr) {
          console.error("Auto-provision demo patient account error:", createErr);
        }
      }

      let errorMsg = "Authentication has failed.";
      if (error && error.code) {
        if (
          error.code === "auth/user-not-found" || 
          error.code === "auth/wrong-password" || 
          error.message?.includes("wrong-password") || 
          error.message?.includes("user-not-found") ||
          error.code === "auth/invalid-credential" ||
          error.message?.includes("invalid-credential")
        ) {
          errorMsg = "Incorrect email address or password. Please verify your credentials and try again.";
        } else {
          errorMsg = error.message || errorMsg;
        }
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      return { success: false, error: errorMsg };
    }
  };

  // Firebase Auth Patient Sign Out
  const logoutUser = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setAppointments([]);
    } catch (error) {
      console.error("Firebase SignOut Error: ", error);
    }
  };

  // Update User Profile in Firestore
  const updateUserProfile = async (updatedUser: Partial<PatientUser>) => {
    if (!currentUser) return;
    const uid = currentUser.id;
    try {
      const mergedProfile = { ...currentUser, ...updatedUser };
      try {
        await updateDoc(doc(db, "users", uid), updatedUser);
      } catch (dbErr) {
        handleFirestoreError(dbErr, OperationType.UPDATE, `users/${uid}`);
        throw dbErr;
      }
      setCurrentUser(mergedProfile);
    } catch (error) {
      console.error("Firebase Update Profile Error: ", error);
    }
  };

  // Hospital Actions
  const addHospital = (hospitalData: Omit<Hospital, "id" | "wards" | "doctors" | "testingFacilities" | "distance" | "rating" | "reviewsCount">) => {
    const newHospital: Hospital = {
      ...hospitalData,
      id: `hosp-${Date.now()}`,
      distance: parseFloat((Math.random() * 5 + 0.5).toFixed(1)),
      rating: 5.0,
      reviewsCount: 0,
      doctors: [],
      testingFacilities: [],
      wards: [
        {
          id: "w-icu",
          name: "Intensive Care Unit (ICU)",
          pricePerDay: 750,
          totalBeds: 12,
          columns: 4,
          beds: Array.from({ length: 12 }, (_, i) => ({
            id: `bed-icu-${Date.now()}-${i}`,
            number: `ICU-${(i + 1).toString().padStart(2, "0")}`,
            status: "available",
          })),
        },
        {
          id: "w-general",
          name: "General Medical Ward",
          pricePerDay: 120,
          totalBeds: 24,
          columns: 6,
          beds: Array.from({ length: 24 }, (_, i) => ({
            id: `bed-gen-${Date.now()}-${i}`,
            number: `GEN-${(i + 1).toString().padStart(2, "0")}`,
            status: "available",
          })),
        },
      ],
    };
    saveHospitals([...hospitals, newHospital]);
  };

  const updateHospital = (id: string, updatedData: Partial<Hospital>) => {
    const updated = hospitals.map((h) => (h.id === id ? { ...h, ...updatedData } : h));
    saveHospitals(updated);
  };

  const deleteHospital = (id: string) => {
    const updated = hospitals.filter((h) => h.id !== id);
    saveHospitals(updated);
    if (selectedHospitalId === id) setSelectedHospitalId(null);
  };

  // Doctor Actions
  const addDoctor = (hospitalId: string, doctorData: Omit<Doctor, "id" | "reviews" | "rating">) => {
    const newDoctor: Doctor = {
      ...doctorData,
      id: `doc-${Date.now()}`,
      rating: 5.0,
      reviews: [],
    };
    
    const updated = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          doctors: [...h.doctors, newDoctor],
        };
      }
      return h;
    });
    saveHospitals(updated);
  };

  const updateDoctor = (hospitalId: string, doctorId: string, updatedData: Partial<Doctor>) => {
    const updated = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          doctors: h.doctors.map((d) => (d.id === doctorId ? { ...d, ...updatedData } : d)),
        };
      }
      return h;
    });
    saveHospitals(updated);
  };

  const deleteDoctor = (hospitalId: string, doctorId: string) => {
    const updated = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          doctors: h.doctors.filter((d) => d.id !== doctorId),
        };
      }
      return h;
    });
    saveHospitals(updated);
  };

  // Diagnostic Controls
  const addTestingFacility = (hospitalId: string, facility: Omit<TestingFacility, "id">) => {
    const newFacility: TestingFacility = {
      ...facility,
      id: `facility-${Date.now()}`,
    };
    const updated = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          testingFacilities: [...h.testingFacilities, newFacility],
        };
      }
      return h;
    });
    saveHospitals(updated);
  };

  const deleteTestingFacility = (hospitalId: string, facilityId: string) => {
    const updated = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          testingFacilities: h.testingFacilities.filter((f) => f.id !== facilityId),
        };
      }
      return h;
    });
    saveHospitals(updated);
  };

  // Bed status toggler
  const updateBedStatus = (
    hospitalId: string,
    wardId: string,
    bedId: string,
    status: "available" | "occupied" | "reserved",
    details?: { patientName?: string; patientAge?: number; gender?: "Male" | "Female" | "Other"; admissionReason?: string }
  ) => {
    const updated = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          wards: h.wards.map((w) => {
            if (w.id === wardId) {
              return {
                ...w,
                beds: w.beds.map((b) => {
                  if (b.id === bedId) {
                    return {
                      ...b,
                      status,
                      patientName: status !== "available" ? details?.patientName : undefined,
                      patientAge: status !== "available" ? details?.patientAge : undefined,
                      gender: status !== "available" ? details?.gender : undefined,
                      admissionReason: status !== "available" ? details?.admissionReason : undefined,
                    };
                  }
                  return b;
                }),
              };
            }
            return w;
          }),
        };
      }
      return h;
    });
    saveHospitals(updated);
  };

  // Synchronous representation with Background Server Sync for Bookings
  const bookAppointment = (appointmentData: Omit<Appointment, "id" | "status" | "createdAt">): Appointment => {
    const appointId = `app-${Date.now()}`;
    const newAppointment: Appointment = {
      ...appointmentData,
      patientUserId: currentUser?.id || auth.currentUser?.uid || "anonymous",
      id: appointId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    
    if (newAppointment.bedId && newAppointment.wardId) {
      updateBedStatus(
        newAppointment.hospitalId,
        newAppointment.wardId,
        newAppointment.bedId,
        "reserved",
        {
          patientName: newAppointment.patientName,
          patientAge: newAppointment.patientAge,
          gender: newAppointment.patientGender,
          admissionReason: `Pre-scheduled for ${newAppointment.itemName}`,
        }
      );
    }

    // Optimistically update local appointments state instantly
    setAppointments((prev) => {
      if (prev.some((a) => a.id === appointId)) return prev;
      return [newAppointment, ...prev];
    });

    // Write to Firestore asynchronously
    setDoc(doc(db, "appointments", appointId), newAppointment).catch((error) => {
      console.warn("Firestore save delayed or failed, cached locally: ", error);
      handleFirestoreError(error, OperationType.WRITE, `appointments/${appointId}`);
    });

    // Write to a dedicated booking logs collection asynchronously to track visitor logs
    const userName = newAppointment.patientName;
    const userEmail = newAppointment.patientEmail || `${userName.trim().toLowerCase().replace(/\s+/g, "")}.${newAppointment.patientPhone.replace(/\D/g, "") || Date.now()}@caregrid-patient.org`;

    // 1. Audit log using addDoc
    addDoc(collection(db, "booking_logs"), {
      name: userName,
      email: userEmail,
      phone: newAppointment.patientPhone,
      age: newAppointment.patientAge,
      gender: newAppointment.patientGender,
      medicalHistory: `Booked ${newAppointment.itemName} (${newAppointment.type === "doctor" ? "Doctor consult" : "Diagnostic scan"}). Reason: ${newAppointment.reason || "Routine visit"}.`,
      createdAt: new Date().toISOString(),
      lastBookedDoctorOrScan: newAppointment.itemName,
      lastBookingReason: newAppointment.reason || "Routine visit",
    }).catch((error) => {
      console.warn("Firestore save patient booking log failed: ", error);
    });

    // 2. Update user profile if logged in using updateDoc
    if (newAppointment.patientUserId && newAppointment.patientUserId !== "anonymous") {
      updateDoc(doc(db, "users", newAppointment.patientUserId), {
        lastBookedDoctorOrScan: newAppointment.itemName,
        lastBookingReason: newAppointment.reason || "Routine visit",
      }).catch((dbErr) => {
        console.warn("Firestore update patient user profile silent warning inside 'users' collection: ", dbErr);
      });
    }

    return newAppointment;
  };

  const cancelAppointment = async (id: string) => {
    const appToCancel = appointments.find((a) => a.id === id);
    if (appToCancel && appToCancel.bedId && appToCancel.wardId) {
      updateBedStatus(appToCancel.hospitalId, appToCancel.wardId, appToCancel.bedId, "available");
    }

    // Optimistic local state cancel status
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
    );

    try {
      await updateDoc(doc(db, "appointments", id), { status: "cancelled" });
    } catch (error) {
      console.warn("Firestore update delayed, cached locally: ", error);
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment["status"]) => {
    const appToUpdate = appointments.find((a) => a.id === id);
    if (appToUpdate && status === "cancelled" && appToUpdate.bedId && appToUpdate.wardId) {
      updateBedStatus(appToUpdate.hospitalId, appToUpdate.wardId, appToUpdate.bedId, "available");
    }

    // Optimistic local state status update
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );

    try {
      await updateDoc(doc(db, "appointments", id), { status });
    } catch (error) {
      console.warn("Firestore status update delayed, cached locally: ", error);
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  // Add Star Reviews
  const addReviewToDoctor = (hospitalId: string, doctorId: string, review: Omit<Review, "id" | "date">) => {
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    };

    const updated = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          doctors: h.doctors.map((d) => {
            if (d.id === doctorId) {
              const updatedReviews = [...d.reviews, newReview];
              const averageRating = parseFloat(
                (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
              );
              return {
                ...d,
                reviews: updatedReviews,
                rating: averageRating,
              };
            }
            return d;
          }),
        };
      }
      return h;
    });

    saveHospitals(updated);
  };

  const addReminder = async (reminderData: Omit<MedicineReminder, 'id' | 'userId' | 'createdAt' | 'isActive'>) => {
    if (!currentUser) return;
    const id = `rem-${Date.now()}`;
    const newReminder: MedicineReminder = {
      ...reminderData,
      id,
      userId: currentUser.id,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setReminders(prev => [newReminder, ...prev]);

    try {
      await setDoc(doc(db, "reminders", id), newReminder);
    } catch (error) {
      console.warn("Firestore save reminder failed: ", error);
      handleFirestoreError(error, OperationType.WRITE, `reminders/${id}`);
    }
  };

  const updateReminder = async (id: string, updatedData: Partial<MedicineReminder>) => {
    if (!currentUser) return;
    const existingReminder = reminders.find(r => r.id === id);
    if (!existingReminder) return;

    const mergedReminder = { ...existingReminder, ...updatedData };

    setReminders(prev => prev.map(r => r.id === id ? mergedReminder : r));

    try {
      await updateDoc(doc(db, "reminders", id), updatedData);
    } catch (error) {
      console.warn("Firestore update reminder failed: ", error);
      handleFirestoreError(error, OperationType.UPDATE, `reminders/${id}`);
    }
  };

  const deleteReminder = async (id: string) => {
    if (!currentUser) return;
    setReminders(prev => prev.filter(r => r.id !== id));

    try {
      await deleteDoc(doc(db, "reminders", id));
    } catch (error) {
      console.warn("Firestore delete reminder failed: ", error);
      handleFirestoreError(error, OperationType.DELETE, `reminders/${id}`);
    }
  };

  return (
    <MedicalContext.Provider
      value={{
        hospitals,
        appointments,
        selectedHospitalId,
        setSelectedHospitalId,
        isAdmin,
        loginAsAdmin,
        logoutAdmin,
        currentUser,
        registerUser,
        loginUser,
        logoutUser,
        updateUserProfile,
        addHospital,
        updateHospital,
        deleteHospital,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        addTestingFacility,
        deleteTestingFacility,
        updateBedStatus,
        bookAppointment,
        cancelAppointment,
        updateAppointmentStatus,
        addReviewToDoctor,
        reminders,
        addReminder,
        updateReminder,
        deleteReminder,
      }}
    >
      {children}
    </MedicalContext.Provider>
  );
};

export const useMedical = () => {
  const context = useContext(MedicalContext);
  if (context === undefined) {
    throw new Error("useMedical must be used within a MedicalProvider");
  }
  return context;
};
