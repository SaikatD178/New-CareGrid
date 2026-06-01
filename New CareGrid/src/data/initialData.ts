import { Hospital, Doctor, Ward, TestingFacility } from '../types';

export const INITIAL_TESTING_FACILITIES: TestingFacility[] = [
  // 1) Non-Invasive Diagnostic
  {
    id: 'f-ecg',
    name: 'ECG (Electrocardiogram)',
    price: 150,
    duration: '5-10 mins',
    availability: 'Immediate / Walk-ins Welcome',
    description: 'Electrocardiogram measuring chemical-electrical pathways of the cardiac systems. Critical for rapid emergency diagnostics.',
    requiresPrescription: false,
    category: 'Non-Invasive Diagnostic',
  },
  {
    id: 'f-echo',
    name: 'Echo Cardiography',
    price: 1200,
    duration: '25 mins',
    availability: 'Booking Required Daily',
    description: 'Detailed structural ultrasound of the heart to map chamber volume, ejection fractions, and valve operations.',
    requiresPrescription: true,
    category: 'Non-Invasive Diagnostic',
  },
  {
    id: 'f-echo-doppler',
    name: 'Echo with Colour Doppler',
    price: 1800,
    duration: '30 mins',
    availability: 'Prior Booking Mandatory',
    description: 'Advanced echocardiogram with premium color flow Doppler formatting to chart velocities of internal blood flow.',
    requiresPrescription: true,
    category: 'Non-Invasive Diagnostic',
  },
  {
    id: 'f-pedia-doppler',
    name: 'Paediatric Colour Doppler',
    price: 2000,
    duration: '35 mins',
    availability: 'Specialized Paediatric Session',
    description: 'Ultra-gentle pediatric color Doppler for baby congenital structural cardiovascular safety screening.',
    requiresPrescription: true,
    category: 'Non-Invasive Diagnostic',
  },
  {
    id: 'f-holter',
    name: 'Holter Monitoring (24-48h)',
    price: 2500,
    duration: '24-48 hours walk-test',
    availability: 'Device allocation required',
    description: 'Wearable ambulatory monitor tracking active 24/48 cardiac rhythms to detect elusive transient arrhythmia episodes under daily loads.',
    requiresPrescription: true,
    category: 'Non-Invasive Diagnostic',
  },
  {
    id: 'f-pft',
    name: 'Pulmonary Function Test (PFT)',
    price: 800,
    duration: '20 mins',
    availability: 'Daily 10:00 AM - 04:00 PM',
    description: 'Spirometry and respiratory measurements charting active lung volumes, inspiration flow rate, and lung health profiles.',
    requiresPrescription: true,
    category: 'Non-Invasive Diagnostic',
  },
  {
    id: 'f-tmt',
    name: 'TMT (Treadmill Test)',
    price: 1000,
    duration: '30 mins',
    availability: 'Prior Cardiology Consult Required',
    description: 'Cardiac treadmill stress testing under high monitored physical exertion to analyze coronary responses and ischemia signals.',
    requiresPrescription: true,
    category: 'Non-Invasive Diagnostic',
  },
  {
    id: 'f-endoscopy',
    name: 'Endoscopy (Upper GI)',
    price: 2200,
    duration: '35 mins',
    availability: 'Morning Fasting Sessions Slot',
    description: 'Advanced mucosal video endoscopy to examine stomach, esophagus, and upper bowel lining.',
    requiresPrescription: true,
    category: 'Non-Invasive Diagnostic',
  },
  {
    id: 'f-usg',
    name: 'Ultra-Sonography (USG)',
    price: 750,
    duration: '20 mins',
    availability: 'Daily Specialist Shift',
    description: 'Accurate ultrasound scans for fetal, pelvic, renal, or localized vascular tissue evaluation.',
    requiresPrescription: false,
    category: 'Non-Invasive Diagnostic',
  },

  // 2) Radiology Diagnostics
  {
    id: 'f-xray-chest',
    name: 'CHEST X- RAY',
    price: 250,
    duration: '10 mins',
    availability: 'Walk-ins Welcome 24/7',
    description: 'Standard chest radiograph detecting pulmonary abnormalities, cardiomegaly, fractures, and acute infections.',
    requiresPrescription: false,
    category: 'Radiology Diagnostics',
  },
  {
    id: 'f-xray-portable',
    name: 'PORTABLE CHEST X-RAY',
    price: 2000,
    duration: '15 mins',
    availability: 'Emergency ICU / Ward Bedside',
    description: 'Mobile bedside chest X-ray system engineered for non-ambulatory emergency or high-dependency patients.',
    requiresPrescription: true,
    category: 'Radiology Diagnostics',
  },
  {
    id: 'f-xray-total',
    name: 'TOTAL X- RAY (Full Body Package)',
    price: 5000,
    duration: '60 mins',
    availability: 'Booking Required',
    description: 'Full skeletal system or combined targeted area radiological imaging suite diagnostics for comprehensive assessment.',
    requiresPrescription: true,
    category: 'Radiology Diagnostics',
  },
  {
    id: 'f-ct-body',
    name: 'Body Part CT Scan',
    price: 2500,
    duration: '20 mins',
    availability: '24x7 Support',
    description: 'Advanced multislice computerised tomography of specific bones, complex joints, or localized body parts.',
    requiresPrescription: true,
    category: 'Radiology Diagnostics',
  },
  {
    id: 'f-ct-brain',
    name: 'Brain CT Scan',
    price: 3000,
    duration: '15 mins',
    availability: '24x7 Emergency Priority',
    description: 'High-speed computerized head scan for trauma triage, hemorrhage mapping, stroke evaluation, and neuro symptoms.',
    requiresPrescription: true,
    category: 'Radiology Diagnostics',
  },
  {
    id: 'f-ct-abdomen',
    name: 'Abdomen CT Scan',
    price: 4000,
    duration: '25 mins',
    availability: 'Fasting Preparation Required',
    description: 'Contrast and plain cross-sectional imaging mapping major abdominal visceral components, liver, kidneys and pancreas.',
    requiresPrescription: true,
    category: 'Radiology Diagnostics',
  },
  {
    id: 'f-ct-thor',
    name: 'Abdomen Thorax CT',
    price: 5500,
    duration: '35 mins',
    availability: '24/7 Priority Emergency Line',
    description: 'Combined thoracic-abdominal contrast chest CT for intensive deep tissue analysis and comprehensive pathology examinations.',
    requiresPrescription: true,
    category: 'Radiology Diagnostics',
  },
  {
    id: 'f-ct-spine',
    name: 'CT Spine',
    price: 3500,
    duration: '20 mins',
    availability: 'By Prior Appointment',
    description: '3D Computerized Tomography mapping of cervical, thoracic, or lumbar spine structures.',
    requiresPrescription: true,
    category: 'Radiology Diagnostics',
  },

  // 3) Clinic
  {
    id: 'f-clinic-diab',
    name: 'Diabetes Speciality Clinic',
    price: 150,
    duration: '20 mins',
    availability: 'Mon & Wed 09 AM - 12 PM',
    description: 'Expert blood glucose profile, personalized diabetic meal charts, vascular risk assessments, and insulin therapy planning.',
    requiresPrescription: false,
    category: 'Clinic',
  },
  {
    id: 'f-clinic-derm',
    name: 'Dermatology Clinic',
    price: 200,
    duration: '20 mins',
    availability: 'Tuesdays 02 PM - 05 PM',
    description: 'Clinical examination of skin disorders, allergy profiling, chronic acne therapy, and biopsy cell scrapes.',
    requiresPrescription: false,
    category: 'Clinic',
  },
  {
    id: 'f-clinic-neuro',
    name: 'Neurology Clinic',
    price: 300,
    duration: '30 mins',
    availability: 'Thursdays 10 AM - 01 PM',
    description: 'General neurological checks, motor coordination tests, reflexes checks, and headache/epilepsy consultations.',
    requiresPrescription: false,
    category: 'Clinic',
  },

  // 4) Pathology and Microbiology
  {
    id: 'f-lab-cbc',
    name: 'CBC (Complete Blood Count)',
    price: 250,
    duration: '4 hours',
    availability: 'Daily Walk-in',
    description: 'Complete blood count analysis: Hb%, white blood counts (TC, DC), red cells, and platelets count.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-urcr',
    name: 'UR, CR (Urea & Creatinine)',
    price: 250,
    duration: '4 hours',
    availability: 'Daily Walk-in',
    description: 'Kidney Function parameters mapping blood urea nitrogen and serum creatinine levels.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-lft',
    name: 'LFT (Liver Function Test)',
    price: 500,
    duration: '6 hours',
    availability: 'Daily Fasting Recommended',
    description: 'Comprehensive liver assay assessing Bilirubin (Total & Direct), SGPT, SGOT, Alkaline Phosphatase, and Albumin.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-nak',
    name: 'NA+, K+ (Electrolytes)',
    price: 450,
    duration: '3 hours',
    availability: 'Daily / Emergency Priority',
    description: 'Serum electrolytes panel measuring active sodium (Na+) and potassium (K+) concentrations.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-ptime',
    name: 'P-TIME (Prothrombin Time / INR)',
    price: 350,
    duration: '4 hours',
    availability: 'Daily Walk-in',
    description: 'Coagulation profile measuring extrinsic clotting pathways and standard INR progression.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-crp',
    name: 'CRP (C-Reactive Protein)',
    price: 350,
    duration: '5 hours',
    availability: 'Daily Walk-in',
    description: 'Quantitative blood evaluation of C-reactive protein levels to detect active internal inflammation or bacterial infections.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-serology',
    name: 'SEROLOGY Panel',
    price: 1250,
    duration: '8 hours',
    availability: 'Daily Walk-in',
    description: 'Comprehensive blood diagnostic serology checks detecting critical immunological properties and infections.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-btct',
    name: 'BT, CT (Bleeding & Clotting Time)',
    price: 50,
    duration: '2 hours',
    availability: 'Daily Walk-in',
    description: 'Clinical evaluation of clotting time and bleeding cycles, essential for pre-operative fitness certificates.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-rbs',
    name: 'RBS (Random Blood Sugar)',
    price: 50,
    duration: '30 mins',
    availability: 'Immediate Access 24/7',
    description: 'Immediate analysis of glucose levels to screen for acute hypo- or hyperglycemia.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-sugar-f',
    name: 'SUGAR (F) [Fasting]',
    price: 50,
    duration: '2 hours',
    availability: '8-12 hours overnight fast required',
    description: 'Precise baseline glucose analysis performed after structured fasting period.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-sugar-pp',
    name: 'SUGAR (PP) [Post Prandial]',
    price: 50,
    duration: '2 hours',
    availability: 'Sample exactly 2 hours post-meal',
    description: 'Glucose processing measurement evaluating pancreas regulation response exactly two hours after meal ingestion.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-group',
    name: 'GROUP (Blood Grouping)',
    price: 50,
    duration: '1 hour',
    availability: 'Immediate Walk-in',
    description: 'ABO and Rh factor blood groups identification validation.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-hiv',
    name: 'HIV 1 & 2 ELISA',
    price: 500,
    duration: 'Same day reports',
    availability: 'Private Counseling Window',
    description: 'High-specificity screening for human immunodeficiency virus (HIV 1 and HIV 2) clinical antigens and antibodies.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-hcv',
    name: 'HCV (Hepatitis C Virus)',
    price: 500,
    duration: 'Same day reports',
    availability: 'Daily Intake',
    description: 'Immuno-assay screening for active Hepatitis C viral antibodies.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-hbsag',
    name: 'HBSAG (Hepatitis B)',
    price: 500,
    duration: 'Same day reports',
    availability: 'Daily Intake',
    description: 'Highly sensitive surface antigen test to detect acute or chronic Hepatitis B viral exposure.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-lipid',
    name: 'LIPID PROFILE',
    price: 500,
    duration: '6 hours',
    availability: '10-12 hours fasting required',
    description: 'Comprehensive cardiovascular index mapping Total Cholesterol, Triglycerides, HDL, LDL, and VLDL.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-amylase',
    name: 'AMYLASE',
    price: 350,
    duration: '4 hours',
    availability: 'Daily Walk-in',
    description: 'Pancreatic enzyme profiling to diagnose acute abdomen pain or pancreatitis suspected cases.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-lipase',
    name: 'LIPASE',
    price: 350,
    duration: '4 hours',
    availability: 'Daily Walk-in',
    description: 'A highly sensitive biochemical marker confirming general or acute pancreatic status.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-hba1c',
    name: 'HBA1C (Glycated Haemoglobin)',
    price: 800,
    duration: '4 hours',
    availability: 'Daily Walk-in (No fasting needed)',
    description: 'A three-month average glucose index critical for diagnosing and active monitoring of diabetic patients.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-all-blood',
    name: 'ALL TOTAL REPORTS OF BLOOD (Comprehensive Executive Panel)',
    price: 10000,
    duration: '1-2 days',
    availability: 'Required Overnight Fasting',
    description: 'Ultimate comprehensive diagnostic blood portfolio incorporating CBC, LFT, UR, CR, Lipid Panel, Thyroid Panel, Serology screen, CRP, and multiple key diagnostic indicators.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-urine-re',
    name: 'URINE R/E (Routine & Examination)',
    price: 150,
    duration: '3 hours',
    availability: 'First morning sample preferred',
    description: 'Microscopic and physical examination check for sugar, protein, WBC count, and epithelial contamination signs.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-sgpt',
    name: 'SGPT (ALT)',
    price: 70,
    duration: '4 hours',
    availability: 'Daily Walk-in',
    description: 'Targeted liver liver enzyme test focusing on cellular health and acute hepatocyte strain checks.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-sgot',
    name: 'SGOT (AST)',
    price: 70,
    duration: '4 hours',
    availability: 'Daily Walk-in',
    description: 'Biochemical muscle, heart, and liver cell enzyme check indicator.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-uric',
    name: 'URIC ACID',
    price: 150,
    duration: '4 hours',
    availability: 'Daily Walk-in',
    description: 'Serum uric acid levels testing, crucial for evaluating joint gout symptoms or renal balance.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-hb',
    name: 'HB (Haemoglobin Only)',
    price: 50,
    duration: '1 hour',
    availability: 'Walk-in / Immediate response',
    description: 'Isolated digital reading mapping active Haemoglobin count to check for anaemia scales.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-cardiac-enzymes',
    name: 'CPK + MB + LDH Panel (Cardiac Markers)',
    price: 800,
    duration: '3 hours',
    availability: '24/7 Emergency Priority',
    description: 'Emergency cardiac enzyme trio (Creatine Phosphokinase, CPK-MB, and Lactate Dehydrogenase) validating myocardial damage risks.',
    requiresPrescription: true,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-urine-cs',
    name: 'URINE C/S (Culture & Sensitivity)',
    price: 300,
    duration: '48-72 hours',
    availability: 'Sterile sample container supplied',
    description: 'Bacterial incubation suite to diagnose urinary tract infection strains with active drug response mapping.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-thyroid',
    name: 'T3, T4, TSH (Thyroid Profile)',
    price: 750,
    duration: '6 hours',
    availability: 'Morning sample highly recommended',
    description: 'Trifecta endocrine essay assessing hyperthyroidism, hypothyroidism, and pituitary responses.',
    requiresPrescription: false,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-hep-profile',
    name: 'HEPATITIS PROFILE (Comprehensive Screen)',
    price: 8500,
    duration: '24-48 hours',
    availability: 'Booking Required',
    description: 'All-inclusive multi-marker screening for Hepatitis A, B, C, and E viral strains and active viral loads.',
    requiresPrescription: true,
    category: 'Pathology and Microbiology',
  },
  {
    id: 'f-lab-blood-bank',
    name: 'Blood Bank Facility & Compatibility Check',
    price: 50,
    duration: 'Immediate matches',
    availability: '24x7 Support',
    description: 'Immediate compatibility profiles and blood group mapping verification with reserve stock holds.',
    requiresPrescription: true,
    category: 'Pathology and Microbiology',
  }
];

const generateWards = (hospitalName: string): Ward[] => {
  return [
    {
      id: 'w-icu-coronary',
      name: 'Coronary care unit (ICCU)',
      pricePerDay: 850,
      totalBeds: 5,
      columns: 5,
      beds: Array.from({ length: 5 }, (_, i) => {
        const bedNum = `ICCU-${(i + 1).toString().padStart(2, '0')}`;
        const isOccupied = Math.random() < (hospitalName.includes('Emergency') ? 0.8 : 0.6);
        return {
          id: `bed-iccu-${hospitalName.slice(0, 3).toLowerCase()}-${i}`,
          number: bedNum,
          status: isOccupied ? 'occupied' : 'available',
          patientName: isOccupied ? getRandomName() : undefined,
          patientAge: isOccupied ? Math.floor(Math.random() * 50) + 25 : undefined,
          gender: isOccupied ? (Math.random() > 0.5 ? 'Male' : 'Female') : undefined,
          admissionReason: isOccupied ? 'Acute Myocardial Infarction' : undefined,
        };
      }),
    },
    {
      id: 'w-icu-medical',
      name: 'Medical ICU',
      pricePerDay: 850,
      totalBeds: 5,
      columns: 5,
      beds: Array.from({ length: 5 }, (_, i) => {
        const bedNum = `MICU-${(i + 1).toString().padStart(2, '0')}`;
        const isOccupied = Math.random() < (hospitalName.includes('Emergency') ? 0.8 : 0.6);
        return {
          id: `bed-micu-${hospitalName.slice(0, 3).toLowerCase()}-${i}`,
          number: bedNum,
          status: isOccupied ? 'occupied' : 'available',
          patientName: isOccupied ? getRandomName() : undefined,
          patientAge: isOccupied ? Math.floor(Math.random() * 50) + 25 : undefined,
          gender: isOccupied ? (Math.random() > 0.5 ? 'Male' : 'Female') : undefined,
          admissionReason: isOccupied ? 'Severe Sepsis / COPD' : undefined,
        };
      }),
    },
    {
      id: 'w-icu-surgical',
      name: 'Surgical ICU',
      pricePerDay: 850,
      totalBeds: 5,
      columns: 5,
      beds: Array.from({ length: 5 }, (_, i) => {
        const bedNum = `SICU-${(i + 1).toString().padStart(2, '0')}`;
        const isOccupied = Math.random() < (hospitalName.includes('Emergency') ? 0.8 : 0.6);
        return {
          id: `bed-sicu-${hospitalName.slice(0, 3).toLowerCase()}-${i}`,
          number: bedNum,
          status: isOccupied ? 'occupied' : 'available',
          patientName: isOccupied ? getRandomName() : undefined,
          patientAge: isOccupied ? Math.floor(Math.random() * 50) + 25 : undefined,
          gender: isOccupied ? (Math.random() > 0.5 ? 'Male' : 'Female') : undefined,
          admissionReason: isOccupied ? 'Post-Op Coronary Artery Bypass' : undefined,
        };
      }),
    },
    {
      id: 'w-icu-picu-nicu',
      name: 'P.I.C.U. & N.I.C.U',
      pricePerDay: 850,
      totalBeds: 5,
      columns: 5,
      beds: Array.from({ length: 5 }, (_, i) => {
        const bedNum = `PICU/NICU-${(i + 1).toString().padStart(2, '0')}`;
        const isOccupied = Math.random() < (hospitalName.includes('Emergency') ? 0.8 : 0.6);
        return {
          id: `bed-pnicu-${hospitalName.slice(0, 3).toLowerCase()}-${i}`,
          number: bedNum,
          status: isOccupied ? 'occupied' : 'available',
          patientName: isOccupied ? getRandomName() : undefined,
          patientAge: isOccupied ? Math.floor(Math.random() * 12) : undefined,
          gender: isOccupied ? (Math.random() > 0.5 ? 'Male' : 'Female') : undefined,
          admissionReason: isOccupied ? 'Neonatal Respiratory Distress' : undefined,
        };
      }),
    },
    {
      id: 'w-general-male',
      name: 'General Ward - Male',
      pricePerDay: 150,
      totalBeds: 32,
      columns: 8,
      beds: Array.from({ length: 32 }, (_, i) => {
        const bedNum = `GWM-${(i + 1).toString().padStart(2, '0')}`;
        const isOccupied = Math.random() < 0.5;
        return {
          id: `bed-gwm-${hospitalName.slice(0, 3).toLowerCase()}-${i}`,
          number: bedNum,
          status: isOccupied ? 'occupied' : 'available',
          patientName: isOccupied ? getRandomMaleName() : undefined,
          patientAge: isOccupied ? Math.floor(Math.random() * 50) + 18 : undefined,
          gender: 'Male',
          admissionReason: isOccupied ? getRandomSymptom() : undefined,
        };
      }),
    },
    {
      id: 'w-general-female',
      name: 'General Ward - Female',
      pricePerDay: 150,
      totalBeds: 32,
      columns: 8,
      beds: Array.from({ length: 32 }, (_, i) => {
        const bedNum = `GWF-${(i + 1).toString().padStart(2, '0')}`;
        const isOccupied = Math.random() < 0.55;
        return {
          id: `bed-gwf-${hospitalName.slice(0, 3).toLowerCase()}-${i}`,
          number: bedNum,
          status: isOccupied ? 'occupied' : 'available',
          patientName: isOccupied ? getRandomFemaleName() : undefined,
          patientAge: isOccupied ? Math.floor(Math.random() * 50) + 18 : undefined,
          gender: 'Female',
          admissionReason: isOccupied ? getRandomSymptom() : undefined,
        };
      }),
    },
    {
      id: 'w-deluxe',
      name: 'Deluxe Private Suites',
      pricePerDay: 450,
      totalBeds: 12,
      columns: 6,
      beds: Array.from({ length: 12 }, (_, i) => {
        const bedNum = `DLX-${(i + 1).toString().padStart(2, '0')}`;
        const isOccupied = Math.random() < 0.4;
        return {
          id: `bed-dlx-${hospitalName.slice(0, 3).toLowerCase()}-${i}`,
          number: bedNum,
          status: isOccupied ? 'occupied' : 'available',
          patientName: isOccupied ? getRandomName() : undefined,
          patientAge: isOccupied ? Math.floor(Math.random() * 60) + 22 : undefined,
          gender: isOccupied ? (Math.random() > 0.5 ? 'Male' : 'Female') : undefined,
          admissionReason: isOccupied ? 'Post-Surgery Recovery' : undefined,
        };
      }),
    },
  ];
};

const getRandomName = () => {
  const names = ['Michael Green', 'Emily Watson', 'James Carter', 'Sophia Davis', 'Robert Miller', 'Charlotte Taylor', 'David Anderson', 'Isabella Thomas'];
  return names[Math.floor(Math.random() * names.length)];
};

const getRandomMaleName = () => {
  const names = ['John Doe', 'Alexander Brown', 'William Wilson', 'Charles Smith', 'Richard Johnson', 'Joseph Martinez', 'Thomas White', 'Peter Parker'];
  return names[Math.floor(Math.random() * names.length)];
};

const getRandomFemaleName = () => {
  const names = ['Jane Doe', 'Mary Smith', 'Patricia Jones', 'Elizabeth Clark', 'Sarah Hall', 'Nancy Harris', 'Jessica Adams', 'Karen Nelson'];
  return names[Math.floor(Math.random() * names.length)];
};

const getRandomSymptom = () => {
  const symptoms = ['Acute Coronary Syndrome', 'Post-Op Observation', 'Pneumonia Support', 'Fracture Splinting', 'Chronic Hypertension', 'Asthmatic Fit', 'Dehydration & Fever', 'Severe Migraine Check'];
  return symptoms[Math.floor(Math.random() * symptoms.length)];
};

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-bc-roy',
    name: 'Dr. Bidhan Chandra Roy Hospital (ICARE)',
    address: 'ICARE Complex, Banbishnupur, PO: Balughata, Haldia, Purba Medinipur, West Bengal - 721645',
    phone: '+91 (03224) 269261',
    email: 'info@icaremedicalcollege.in',
    distance: 0.0,
    rating: 4.7,
    reviewsCount: 412,
    specialties: ['Medicine', 'General Surgery', 'Obstetrics & Gynaecology', 'Pediatrics', 'Orthopedics', 'Ophthalmology', 'Cardiology'],
    facilities: [
      'ECG', 'Chest X-Ray', 'Echo Cardiography', 'Echo with Colour Doppler', 'Paediatric Colour Doppler',
      'Holter Monitoring', 'Pulmonary Function Test', 'TMT', 'Endoscopy', 'Ultra-Sonography',
      'Body Part CT Scan', 'Brain CT Scan', 'Abdomen CT Scan', 'Abdomen Thorax CT', 'CT Spine',
      'Diabetes Speciality Clinic', 'Dermatology Clinic', 'Neurology Clinic',
      'Haematology & Biochemistry', 'Serology & Hormone Assay', 'Clinical Pathology & Cytology', 'Blood Bank Facility',
      'ICU', 'NICU', 'Emergency Triage', 'Dialysis Unit', '24/7 Pharmacy'
    ],
    image: 'https://images.unsplash.com/photo-1587351021759-3e56616af1bb?auto=format&fit=crop&q=80&w=1000',
    about: 'Dr. Bidhan Chandra Roy Hospital is a premier 500+-bed super specialty clinical teaching hospital associated with the ICARE Institute of Medical Sciences and Research in Haldia, West Bengal (Coordinates: 22.0641° N, 88.0359° E). Operating as the ultimate healthcare lifeline of Purba Medinipur, it provides state-of-the-art diagnostic facilities (MRI, CT scans), 24/7 emergency response, specialized maternity care, and advanced operating theaters with visual seat maps monitored directly at our central nursing stations.',
    coordinates: { x: 48, y: 52 },
    gpsCoordinates: { lat: 22.0641352, lng: 88.0359571 },
    testingFacilities: [...INITIAL_TESTING_FACILITIES],
    wards: generateWards('Dr. B. C. Roy Hospital'),
    photos: [
      'https://images.unsplash.com/photo-1587351021759-3e56616af1bb?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1000'
    ],
    doctors: [
      {
        id: 'doc-1',
        name: 'Dr. Soumya Sarathi Martin',
        specialty: 'Medicine',
        experience: '20 years',
        photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
        rating: 4.9,
        reviews: [
          { id: 'r-1', author: 'Siddharth Roy', rating: 5, date: '2026-05-18', comment: 'Dr. Martin is extremely gentle and detailed. Explained the medical treatment super clearly.' },
          { id: 'r-2', author: 'Sreemoyee Kundu', rating: 5, date: '2026-05-10', comment: 'Extremely professional clinical medicine consulting at Haldia.' }
        ],
        timings: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
        fee: 300,
        bio: 'Professor & Head of Department of General Medicine at ICARE, specializing in critical medical care, metabolic syndromes, and chronic infection management.'
      },
      {
        id: 'doc-2',
        name: 'Dr. Atanu Chandra',
        specialty: 'Medicine',
        experience: '15 years',
        photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
        rating: 4.8,
        reviews: [
          { id: 'r-3', author: 'Ramesh Das', rating: 5, date: '2026-05-02', comment: 'Excellent diagnosis and clear prescription. Very dedicated physician.' }
        ],
        timings: ['10:00 AM', '12:00 PM', '03:00 PM', '05:00 PM'],
        fee: 250,
        bio: 'Associate Professor of General Medicine with extensive research in tropical medicine, acute respiratory disorders, and complex internal pathology cases.'
      },
      {
        id: 'doc-3',
        name: 'Dr. Sanjoy Kar',
        specialty: 'Pediatrics',
        experience: '18 years',
        photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
        rating: 4.9,
        reviews: [
          { id: 'r-4', author: 'Arjun Adhikari', rating: 5, date: '2026-05-25', comment: 'Very reassuring pediatric immunization visit. Highly recommended child care expert.' }
        ],
        timings: ['10:30 AM', '12:30 PM', '03:30 PM', '05:30 PM'],
        fee: 300,
        bio: 'Professor & Head of Pediatrics. Renowned pediatric health expert focusing on neonatal intensive care, pediatric immunization, and acute child health emergencies.'
      },
      {
        id: 'doc-4',
        name: 'Dr. Debasis Adhikari',
        specialty: 'Obstetrics & Gynaecology',
        experience: '22 years',
        photo: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200',
        rating: 4.8,
        reviews: [
          { id: 'r-5', author: 'Koyel Patra', rating: 5, date: '2026-05-22', comment: 'Extremely supportive throughout my emergency pregnancy triage and delivery.' }
        ],
        timings: ['09:30 AM', '11:30 AM', '01:30 PM', '04:00 PM'],
        fee: 350,
        bio: 'Professor & Head of Department of Obstetrics & Gynecology. Expert in high-risk obstetric cases, advanced laparoscopic gynaecological surgery, and prenatal diagnostics.'
      },
      {
        id: 'doc-5',
        name: 'Dr. Debasish Mandal',
        specialty: 'Orthopedics',
        experience: '15 years',
        photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        rating: 4.7,
        reviews: [
          { id: 'r-6', author: 'Bimal Halder', rating: 4, date: '2026-05-12', comment: 'Fixed my knee fractures nicely with post-operative therapy care.' }
        ],
        timings: ['08:30 AM', '10:30 AM', '02:30 PM', '04:30 PM'],
        fee: 300,
        bio: 'Associate Professor of Orthopedic Surgery, specializing in complicated trauma management, joint reconstructions, and pediatric orthopedic surgeries.'
      },
      {
        id: 'doc-6',
        name: 'Dr. Subhasish Pramanik',
        specialty: 'General Surgery',
        experience: '19 years',
        photo: 'https://images.unsplash.com/photo-137368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
        rating: 4.8,
        reviews: [
          { id: 'r-7', author: 'Tarun Pal', rating: 5, date: '2026-05-15', comment: 'Excellent laparoscopic gall bladder operation. Healing quickly.' }
        ],
        timings: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
        fee: 350,
        bio: 'Professor & Head of Department of General Surgery. Expert in advanced gastrointestinal procedures, laparo-abdominal surgeries, and emergency trauma triage.'
      },
      {
        id: 'doc-7',
        name: 'Dr. Amitava Mukherjee',
        specialty: 'Ophthalmology',
        experience: '21 years',
        photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
        rating: 4.9,
        reviews: [
          { id: 'r-8', author: 'Nirmal Roy', rating: 5, date: '2026-05-11', comment: 'My cataract op was quick and painless. Perfect distance vision now!' }
        ],
        timings: ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'],
        fee: 250,
        bio: 'Professor & Head of Ophthalmology, specializing in micro-incision cataract surgeries, corneal therapeutics, and diabetic retinopathy screenings.'
      }
    ]
  }
];
