import React from 'react';
import {
  Infinity,
  Wifi,
  ArrowLeftRight,
  Bluetooth
} from 'lucide-react';

export const IoTEcosystemSection: React.FC = () => {
  const ecosystems = [
    {
      title: 'ESP32 Xtensa',
      theme: 'cyan',
      cardBg: 'bg-[#08121B]/90',
      border: 'border-cyan-500/40 hover:border-cyan-400/80 shadow-[0_0_25px_-5px_rgba(6,182,212,0.2)]',
      iconBox: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-400',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="5" width="14" height="14" rx="2" />
          <path d="M9 9h6v6H9z" fill="currentColor" fillOpacity="0.2" />
          {/* External pin traces */}
          <path d="M2 9h3M2 15h3M22 9h-3M22 15h-3M9 2v3M15 2v3M9 22v-3M15 22v-3" strokeLinecap="round" />
        </svg>
      )
    },
    {
      title: 'STM32 ARM',
      theme: 'purple',
      cardBg: 'bg-[#120B1F]/90',
      border: 'border-purple-500/40 hover:border-purple-400/80 shadow-[0_0_25px_-5px_rgba(168,85,247,0.2)]',
      iconBox: 'bg-purple-950/80 border-purple-500/40 text-purple-400',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="5" width="14" height="14" rx="2" />
          <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.25" />
          <path d="M1 8h4M1 12h4M1 16h4M23 8h-4M23 12h-4M23 16h-4M8 1v4M12 1v4M16 1v4M8 23v-4M12 23v-4M16 23v-4" strokeLinecap="round" />
        </svg>
      )
    },
    {
      title: 'Arduino Uno',
      theme: 'teal',
      cardBg: 'bg-[#08151A]/90',
      border: 'border-teal-500/40 hover:border-teal-400/80 shadow-[0_0_25px_-5px_rgba(20,184,166,0.2)]',
      iconBox: 'bg-teal-950/80 border-teal-500/40 text-teal-300',
      icon: (
        <svg viewBox="0 0 32 20" className="w-7 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
          {/* Dual infinity loops of Arduino */}
          <path d="M 8 10 C 8 5, 2 5, 2 10 C 2 15, 8 15, 16 10 C 24 5, 30 5, 30 10 C 30 15, 24 15, 16 10 Z" />
          {/* Minus in left loop, Plus in right loop */}
          <line x1="5" y1="10" x2="8" y2="10" strokeWidth="2" strokeLinecap="round" />
          <line x1="23" y1="10" x2="26" y2="10" strokeWidth="2" strokeLinecap="round" />
          <line x1="24.5" y1="8.5" x2="24.5" y2="11.5" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      title: 'RP2040 Pico',
      theme: 'rose',
      cardBg: 'bg-[#190913]/90',
      border: 'border-rose-500/40 hover:border-rose-400/80 shadow-[0_0_25px_-5px_rgba(244,63,94,0.2)]',
      iconBox: 'bg-rose-950/80 border-rose-500/40 text-rose-400',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          {/* Stylized Raspberry Pi Berry Icon */}
          <circle cx="12" cy="14" r="3.2" />
          <circle cx="8" cy="12" r="2.8" />
          <circle cx="16" cy="12" r="2.8" />
          <circle cx="9.2" cy="17.5" r="2.6" />
          <circle cx="14.8" cy="17.5" r="2.6" />
          <circle cx="12" cy="20" r="2" />
          {/* Leaves */}
          <path d="M 12 8 C 10 5, 7 6, 8 8 C 9 9, 11 9, 12 8 Z" fill="#10B981" />
          <path d="M 12 8 C 14 5, 17 6, 16 8 C 15 9, 13 9, 12 8 Z" fill="#10B981" />
          <path d="M 12 8 C 12 5, 12 3, 12 2" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    },
    {
      title: 'MQTT TLS',
      theme: 'emerald',
      cardBg: 'bg-[#091712]/90',
      border: 'border-emerald-500/40 hover:border-emerald-400/80 shadow-[0_0_25px_-5px_rgba(16,185,129,0.2)]',
      iconBox: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400',
      icon: <Wifi className="w-6 h-6" />
    },
    {
      title: 'I2C / SPI',
      theme: 'sky',
      cardBg: 'bg-[#08131E]/90',
      border: 'border-sky-500/40 hover:border-sky-400/80 shadow-[0_0_25px_-5px_rgba(14,165,233,0.2)]',
      iconBox: 'bg-sky-950/80 border-sky-500/40 text-sky-400',
      icon: <ArrowLeftRight className="w-6 h-6" />
    },
    {
      title: 'LoRaWAN',
      theme: 'indigo',
      cardBg: 'bg-[#120D22]/90',
      border: 'border-indigo-500/40 hover:border-indigo-400/80 shadow-[0_0_25px_-5px_rgba(99,102,241,0.2)]',
      iconBox: 'bg-indigo-950/80 border-indigo-500/40 text-indigo-400',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
          {/* Radio Transmission Tower */}
          <path d="M 9 21 L 12 9 L 15 21" strokeLinecap="round" />
          <line x1="10" y1="17" x2="14" y2="17" />
          <line x1="11" y1="13" x2="13" y2="13" />
          <circle cx="12" cy="7" r="2" fill="currentColor" />
          {/* Waves */}
          <path d="M 6 8 C 4 10, 4 14, 6 16" strokeLinecap="round" />
          <path d="M 18 8 C 20 10, 20 14, 18 16" strokeLinecap="round" />
          <path d="M 3 6 C 0 9, 0 15, 3 18" strokeLinecap="round" />
          <path d="M 21 6 C 24 9, 24 15, 21 18" strokeLinecap="round" />
        </svg>
      )
    },
    {
      title: 'BLE 5.0',
      theme: 'blue',
      cardBg: 'bg-[#091122]/90',
      border: 'border-blue-500/40 hover:border-blue-400/80 shadow-[0_0_25px_-5px_rgba(59,130,246,0.2)]',
      iconBox: 'bg-blue-950/80 border-blue-500/40 text-blue-400',
      icon: <Bluetooth className="w-6 h-6" />
    }
  ];

  return (
    <section id="tech" className="relative py-24 sm:py-32 border-b border-[#202938] overflow-hidden bg-[#070A11]">
      {/* Background Engineering Grid and Ambient Blur */}
      <div className="absolute inset-0 bg-tech-grid opacity-25 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[360px] bg-gradient-to-tr from-cyan-500/10 via-blue-500/10 to-indigo-500/10 blur-[140px] pointer-events-none" />

      {/* Decorative Left Side Glowing Circuit Board Chip */}
      <div className="hidden 2xl:block absolute left-8 top-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none opacity-40">
        <svg viewBox="0 0 200 200" className="w-full h-full text-cyan-400" fill="none" stroke="currentColor">
          {/* Main IC */}
          <rect x="60" y="60" width="80" height="80" rx="10" strokeWidth="2.5" />
          <rect x="75" y="75" width="50" height="50" rx="6" strokeWidth="1.5" strokeDasharray="4 2" />
          
          {/* Pins on 4 sides */}
          {[0, 1, 2, 3, 4].map((i) => (
            <React.Fragment key={i}>
              <line x1={70 + i * 15} y1="40" x2={70 + i * 15} y2="60" strokeWidth="2" />
              <line x1={70 + i * 15} y1="140" x2={70 + i * 15} y2="160" strokeWidth="2" />
              <line x1="40" y1={70 + i * 15} x2="60" y2={70 + i * 15} strokeWidth="2" />
              <line x1="140" y1={70 + i * 15} x2="160" y2={70 + i * 15} strokeWidth="2" />
            </React.Fragment>
          ))}

          {/* Glowing Circuit Node Dots */}
          <path d="M 40 85 L 15 85 L 5 110" strokeWidth="1.5" />
          <circle cx="5" cy="110" r="3.5" fill="#00E5FF" />
          <path d="M 40 115 L 20 115 L 10 145" strokeWidth="1.5" />
          <circle cx="10" cy="145" r="3.5" fill="#00E5FF" />
          <path d="M 70 40 L 70 20 L 50 10" strokeWidth="1.5" />
          <circle cx="50" cy="10" r="3.5" fill="#00E5FF" />
          <path d="M 115 160 L 115 185 L 140 195" strokeWidth="1.5" />
          <circle cx="140" cy="195" r="3.5" fill="#00E5FF" />
        </svg>
      </div>

      {/* Decorative Right Side Branching PCB Traces with Solder Nodes */}
      <div className="hidden 2xl:block absolute right-8 top-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none opacity-40">
        <svg viewBox="0 0 200 200" className="w-full h-full text-cyan-400" fill="none" stroke="currentColor">
          <path d="M 20 30 L 70 30 L 110 70 L 170 70" strokeWidth="2" strokeLinecap="round" />
          <circle cx="170" cy="70" r="4" fill="#00E5FF" />

          <path d="M 50 60 L 90 60 L 130 100 L 185 100" strokeWidth="2" strokeLinecap="round" />
          <circle cx="185" cy="100" r="4" fill="#00E5FF" />

          <path d="M 80 130 L 120 130 L 150 160 L 190 160" strokeWidth="2" strokeLinecap="round" />
          <circle cx="190" cy="160" r="4" fill="#00E5FF" />

          <path d="M 110 70 L 140 40 L 180 40" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="180" cy="40" r="3.5" fill="#00E5FF" />

          <path d="M 130 100 L 155 125 L 175 125" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="175" cy="125" r="3.5" fill="#00E5FF" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
            Universal{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              IoT Support
            </span>
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Build IoT projects across microcontrollers and connectivity protocols.
          </p>
        </div>

        {/* 8 Cards Grid (4 columns x 2 rows) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {ecosystems.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border ${item.cardBg} ${item.border} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] cursor-default`}
            >
              {/* Icon Container */}
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-inner ${item.iconBox}`}>
                {item.icon}
              </div>

              {/* Title & Status */}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white tracking-tight truncate">
                  {item.title}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] shrink-0" />
                  <span className="text-xs text-slate-300 font-medium">Supported</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
