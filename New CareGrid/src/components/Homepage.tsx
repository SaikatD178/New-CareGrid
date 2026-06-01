import React, { useState } from 'react';
import { 
  HeartPulse, 
  Stethoscope, 
  Activity, 
  Brain, 
  FlaskConical, 
  ShieldAlert, 
  Compass, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Eye, 
  Heart,
  TrendingUp,
  Flame,
  Award,
  Target,
  Phone,
  Video,
  Search,
  Calendar,
  ShieldCheck,
  MapPin,
  ClipboardList
} from 'lucide-react';
import { motion } from 'motion/react';

interface HomepageProps {
  onExploreHospitals: (preferredService?: string) => void;
  metrics: {
    bedsAvailable: number;
    doctorsTotal: number;
    hospitalsTotal: number;
  };
}

export const Homepage: React.FC<HomepageProps> = ({ onExploreHospitals, metrics }) => {
  const [hoveredService, setHoveredService] = useState<number | null>(null);
  const [hoveredQuickCard, setHoveredQuickCard] = useState<number | null>(null);

  // Elite multispecialty treatment services matching CareGrid specialties
  const treatmentServices = [
    {
      id: 1,
      title: "Cardiology & Vascular Science",
      description: "Comprehensive cardiac care specializing in dynamic structural heart disease, angiographies, and immediate STEMI care.",
      icon: Heart,
      tag: "Superior Specialty",
      color: "from-manipal-red to-rose-600",
      bgColor: "bg-red-50",
      borderColor: "hover:border-manipal-red",
      iconColor: "text-manipal-red",
      animation: "heartbeat",
      serviceFilter: "Cardiology"
    },
    {
      id: 2,
      title: "Neurology & Neurosurgery",
      description: "Advanced brain mapping, neuro-triage, precision neuro-spine interventions, and rapid diagnosis scan slots.",
      icon: Brain,
      tag: "Precision Neurology",
      color: "from-manipal-blue to-indigo-750",
      bgColor: "bg-blue-50",
      borderColor: "hover:border-manipal-blue",
      iconColor: "text-manipal-blue",
      animation: "float",
      serviceFilter: "Neurology"
    },
    {
      id: 3,
      title: "Emergency Care & ICU Beds",
      description: "24/7 instant Trauma triage and live ICU vacancy assignments. Bypassing state administrative red tape.",
      icon: ShieldAlert,
      tag: "Immediate Slot",
      color: "from-red-600 to-amber-600",
      bgColor: "bg-red-50",
      borderColor: "hover:border-manipal-red",
      iconColor: "text-manipal-red",
      animation: "pulse",
      serviceFilter: "ICU"
    },
    {
      id: 4,
      title: "Pediatrics & Child Care",
      description: "Compassionate specialized consultancy for neonates, toddlers, and adolescent developmental profiles.",
      icon: Stethoscope,
      tag: "Premium Consult",
      color: "from-teal-500 to-emerald-650",
      bgColor: "bg-teal-50",
      borderColor: "hover:border-teal-400",
      iconColor: "text-teal-650",
      animation: "spin-slow",
      serviceFilter: "Pediatrics"
    },
    {
      id: 5,
      title: "Diagnostic Radiology & Labs",
      description: "High-resolution 3T MRI systems, 128-slice CT scans, state-certified biochemistry, and rapid PCR testing.",
      icon: FlaskConical,
      tag: "Pristine Diagnostic",
      color: "from-blue-600 to-cyan-500",
      bgColor: "bg-cyan-50",
      borderColor: "hover:border-cyan-400",
      iconColor: "text-manipal-blue",
      animation: "shimmer",
      serviceFilter: "Lab"
    },
    {
      id: 6,
      title: "Ophthalmology & Micro-Optics",
      description: "Laser surgical vision rectifications, cornea transplantation diagnostic reviews, and elderly cataract consulting.",
      icon: Eye,
      tag: "Precision Optics",
      color: "from-amber-500 to-orange-650",
      bgColor: "bg-amber-50",
      borderColor: "hover:border-amber-400",
      iconColor: "text-amber-600",
      animation: "scan",
      serviceFilter: "Ophthalmology"
    }
  ];

  // Quick action widgets styled beautifully with high contrast action banner buttons
  const quickActions = [
    {
      id: 1,
      title: "Book an Appointment",
      description: "Select from top verified consultants with direct billing",
      icon: Calendar,
      btnText: "Schedule Now",
      accentColor: "border-l-4 border-manipal-blue",
      onClick: () => onExploreHospitals()
    },
    {
      id: 2,
      title: "Find a Specialty Clinic",
      description: "Locate physical hospital centers near your coordinates",
      icon: MapPin,
      btnText: "View Interactive Maps",
      accentColor: "border-l-4 border-manipal-red",
      onClick: () => onExploreHospitals()
    },
    {
      id: 3,
      title: "Emergency Bed Booking",
      description: "Secure critical ICU or General Ward beds instantly",
      icon: Activity,
      btnText: "Reserve Trauma Bed",
      accentColor: "border-l-4 border-amber-500",
      onClick: () => onExploreHospitals("ICU")
    },
    {
      id: 4,
      title: "Online Video Consult",
      description: "Speak with general physicians from the comfort of home",
      icon: Video,
      btnText: "Initiate Consult",
      accentColor: "border-l-4 border-indigo-600",
      onClick: () => onExploreHospitals("Pediatrics")
    }
  ];

  return (
    <div id="caregrid-homepage-root" className="space-y-16">
      
      {/* 1. HERO ENGAGEMENT AREA - HIGH-CONTRAST HOSPITAL NAVY & RED AESTHETIC */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl py-12 px-6 sm:px-12 md:py-20 lg:px-16">
        
        {/* Dynamic Glowing Accents matching brand colors */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-full w-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute -top-30 -left-30 h-[400px] w-[400px] rounded-full bg-manipal-blue filter blur-[110px] opacity-60 animate-pulse" />
          <div className="absolute -bottom-30 -right-30 h-[400px] w-[400px] rounded-full bg-manipal-red filter blur-[110px] opacity-50 animate-pulse" style={{ animationDuration: '7s' }} />
        </div>

        <div className="relative z-10 max-w-4xl space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 text-xs font-semibold text-slate-200">
            <span className="inline-block h-2 w-2 rounded-full bg-manipal-red animate-ping" />
            <span className="text-manipal-red font-bold">LIVE METRO SHUTTLE ACTIVE</span>
            <span className="text-slate-500">•</span>
            <span>Clinical Network Alliance</span>
          </div>
          
          <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Your Trusted Partner in Health. <br />
            <span className="bg-gradient-to-r from-manipal-red via-red-450 to-white bg-clip-text text-transparent">
              Lifeson's Partner. Life's On.
            </span>
          </h1>
          
          <p className="font-sans text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed flex flex-wrap gap-1">
            Welcome to the digital care dashboard of CareGrid. Instantly explore physical multispecialty medical hubs, coordinate real-time ICU ward bed status, and book certified diagnostic tests without intermediate agent delays.
          </p>

          <div className="pt-4 flex flex-wrap gap-4 items-center">
            <button
              id="hero-btn-explore"
              onClick={() => onExploreHospitals()}
              className="group flex items-center gap-2 rounded-full bg-manipal-red px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-red-950/40 hover:bg-red-650 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Find a Doctor / Hospital
              <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
            </button>
            
            <a 
              href="tel:18001025555"
              className="flex items-center gap-2 text-sm font-bold text-slate-100 hover:text-manipal-red transition-colors bg-slate-800/50 hover:bg-slate-800 border border-slate-700 py-3.5 px-6 rounded-full"
            >
              <Phone className="h-4.5 w-4.5 text-manipal-red animate-pulse" />
              Emergency Call Line
            </a>
          </div>
        </div>

        {/* Dynamic Pulse Graphic Line Accent resembling a real heart rate monitor */}
        <div className="absolute right-10 bottom-10 hidden lg:block w-72 h-36 opacity-35 select-none text-right">
          <svg viewBox="0 0 300 100" fill="none" xmlns="http://www.w3.org/2500/svg" className="w-full h-full">
            <path 
              d="M0 50 h60 l10 -30 l15 75 l15 -90 l10 65 l12 -20 h178" 
              stroke="#e31c3d" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="animate-dash"
              style={{
                strokeDasharray: '600',
                strokeDashoffset: '600',
                animation: 'dash 3s linear infinite'
              }}
            />
          </svg>
          <div className="text-[10px] font-mono text-manipal-red font-bold mt-1 tracking-widest uppercase">
            ⚡ APOLO STABILITY SYNCED
          </div>
        </div>
      </section>

      {/* 2. MANIPAL FLOATING QUICK ACTION BAR (BENTO STYLE) */}
      <section id="manipal-quick-gateway" className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <ClipboardList className="h-5 w-5 text-manipal-blue font-bold" />
          <h2 className="font-sans text-lg font-black text-slate-800 tracking-tight">
            Instant Care Gateway
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const isHovered = hoveredQuickCard === index;
            
            return (
              <div
                id={`quick-action-card-${action.id}`}
                key={action.id}
                onMouseEnter={() => setHoveredQuickCard(index)}
                onMouseLeave={() => setHoveredQuickCard(null)}
                onClick={action.onClick}
                className={`bg-white rounded-xl shadow-2xs hover:shadow-md transition-all duration-300 p-5 cursor-pointer border border-slate-150 flex flex-col justify-between ${
                  action.accentColor
                } ${isHovered ? 'scale-[1.015] bg-slate-50/70 border-r-slate-350' : ''}`}
              >
                <div>
                  <div className={`p-2.5 rounded-lg w-fit ${
                    isHovered ? 'bg-manipal-blue text-white' : 'bg-slate-100 text-slate-700'
                  } transition-colors duration-250`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3.5 font-sans font-extrabold text-sm text-slate-800">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-400 font-medium leading-relaxed">
                    {action.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
                  <span className="font-bold text-manipal-blue group-hover:underline">
                    {action.btnText}
                  </span>
                  <ArrowRight className={`h-4 w-4 text-manipal-red transition-transform ${isHovered ? 'translate-x-1.5' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. TREATMENT SERVICES - WITH HIGH-FIDELITY ANIMATIONS */}
      <section id="homepage-treatment-services" className="space-y-8 bg-manipal-blue/5 rounded-3xl p-6.5 sm:p-10 border border-manipal-blue/10">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-manipal-red">CareGrid Operations Blueprints</span>
          <h2 className="font-sans text-2xl sm:text-3xl font-black text-manipal-blue tracking-tight">
            Animated Treatment Specialties
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Hover over any specialized clinical pathway below to see advanced micro-animations. Click a pathway to discover centers matching that specialty.
          </p>
        </div>

        {/* Dynamic Bento-Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {treatmentServices.map((service, index) => {
            const Icon = service.icon;
            const isHovered = hoveredService === index;

            // Generate specific CSS inline classes/animations based on service type
            let animatedIconClass = "transition-all duration-350 ";
            if (isHovered) {
              if (service.animation === "heartbeat") animatedIconClass += "scale-115 text-manipal-red animate-pulse";
              else if (service.animation === "pulse") animatedIconClass += "scale-115 text-manipal-red animate-bounce";
              else if (service.animation === "float") animatedIconClass += "-translate-y-2 text-manipal-blue";
              else if (service.animation === "spin-slow") animatedIconClass += "rotate-180 text-teal-600 duration-500";
              else if (service.animation === "shimmer") animatedIconClass += "scale-110 text-emerald-600 brightness-110";
              else if (service.animation === "scan") animatedIconClass += "scale-110 text-amber-500 animate-pulse";
            } else {
              animatedIconClass += service.iconColor;
            }

            return (
              <div
                id={`treatment-service-card-${service.id}`}
                key={service.id}
                onMouseEnter={() => setHoveredService(index)}
                onMouseLeave={() => setHoveredService(null)}
                onClick={() => onExploreHospitals(service.serviceFilter)}
                className={`group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isHovered ? 'border-manipal-red -translate-y-1' : 'border-slate-150'
                }`}
              >
                {/* Background visual highlight */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${service.color} transform origin-left transition-transform duration-350 ${
                  isHovered ? 'scale-x-100' : 'scale-x-0'
                }`} />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200/60 rounded-full px-2.5 py-0.5">
                      {service.tag}
                    </span>
                    
                    {/* Animated Pulse Ring underneath icons the user hovers */}
                    <div className="relative">
                      {isHovered && (
                        <div className="absolute inset-0 rounded-xl bg-red-155 animate-ping opacity-75" />
                      )}
                      <div className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
                        isHovered ? 'bg-manipal-red text-white shadow-sm' : service.bgColor
                      }`}>
                        <Icon className={`h-6 w-6 ${isHovered ? 'text-white' : animatedIconClass}`} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-sans text-base font-extrabold text-[#002060] group-hover:text-manipal-red transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Animated Electrocardiogram Line/Visual footer on card hover */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                      {isHovered ? "Consult Network Live Slots" : "CareGrid Certified Sync"}
                    </span>
                  </div>
                  <span className="text-manipal-blue text-xs font-bold inline-flex items-center gap-0.5 group-hover:underline">
                    Inquire Specialty
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 text-manipal-red" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. CORE MISSION & VISION SEGMENT - DETAILED INTERFACE WITH BRAND PARITY */}
      <section id="caregrid-mission-vision" className="border-t border-slate-250 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Accent editorial intro box */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-4.5 pr-0 lg:pr-6">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#003087]">Our Identity Core</span>
            <h2 className="font-sans text-3xl font-extrabold text-manipal-blue tracking-tight leading-tight">
              Our Vision and <br />
              Strategic Mission 
            </h2>
            <div className="h-1 w-16 bg-gradient-to-r from-manipal-blue to-manipal-red rounded-md" />
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              We operate on the foundation of medical integrity and precision telemetry. CareGrid unifies hospitals and patients to create transparent pathways of care under absolute service availability.
            </p>
          </div>

          {/* Mission Card */}
          <div className="lg:col-span-4 relative overflow-hidden rounded-2xl border border-slate-150 bg-white p-7 sm:p-8 shadow-3xs hover:shadow-2xs transition-shadow flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
              <Award className="h-32 w-32 text-manipal-red" />
            </div>
            
            <div className="space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 border border-rose-100 text-[#e31c3d]">
                <Target className="h-5.5 w-5.5" />
              </div>
              <h3 className="font-sans text-lg font-black text-slate-800">
                The CareGrid Mission
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                To simplify and accelerate patient pathways to world-class hospital care. Our mission is to eliminate unexpected service capacity gridlocks, decrease response latency, and empower patients through transparent state metrics that coordinate wards, scanner units, and specialist rosters.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-manipal-red" />
                <span>Synchronized Specialty Wards</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-manipal-red" />
                <span>Zero-Barrier Live Confirmations</span>
              </div>
            </div>
          </div>

          {/* Vision Card */}
          <div className="lg:col-span-4 relative overflow-hidden rounded-2xl border border-slate-150 bg-white p-7 sm:p-8 shadow-3xs hover:shadow-2xs transition-shadow flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
              <Compass className="h-32 w-32 text-manipal-blue" />
            </div>

            <div className="space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-105 text-[#003087]">
                <Compass className="h-5.5 w-5.5" />
              </div>
              <h3 className="font-sans text-lg font-black text-[#0f172a]">
                Our Future Vision
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                To build an intelligent, decentralized regional clinical healthcare grid. We envision an integrated ecosystem where patient records, diagnostic queues, physician hours, and emergency bed allotments are synchronized securely in real-time, delivering error-free guidance for any citizen.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-manipal-blue" />
                <span>Cryptographically Safe Local Cache</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-manipal-blue" />
                <span>Intelligent Ambulance Re-routing</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. CLINICAL ALLIANCE STAMP VALUE */}
      <section className="bg-manipal-blue text-white rounded-3xl p-6.5 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-lg border border-manipal-blue/40">
        <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-slate-850/20 filter blur-2xl pointer-events-none" />
        <div className="text-left space-y-1.5 max-w-xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-manipal-red text-white text-[9px] font-bold uppercase tracking-widest font-mono">
            Clinical Priority Protocol
          </div>
          <h4 className="font-sans text-base font-extrabold text-white leading-snug">
            Accredited Emergency Response Network
          </h4>
          <p className="text-[11px] text-slate-200 font-medium leading-relaxed">
            In compliance with regional directives, CareGrid redirects acute surgical crises directly to physical trauma pipelines. If you have immediate life-threatening events, please dial <span className="font-bold underline text-white">1800-102-5555</span> or 911 immediately.
          </p>
        </div>
        
        <button
          onClick={() => onExploreHospitals()}
          className="rounded-full bg-manipal-red hover:bg-[#c91834] py-3.5 px-7 font-extrabold text-xs text-white uppercase tracking-wider transition-all shadow-sm shrink-0 relative z-10"
        >
          Check Bed & Doctor Live Status
        </button>
      </section>
    </div>
  );
};
