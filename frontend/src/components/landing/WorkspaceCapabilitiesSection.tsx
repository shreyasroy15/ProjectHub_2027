import React from 'react';
import {
  Activity,
  Box,
  FileText,
  Code2,
  CheckCircle2,
  Zap
} from 'lucide-react';
import capC1 from '../../assets/cap-c1-clean.png';
import capC2 from '../../assets/cap-c2-clean.png';
import capC3 from '../../assets/cap-c3-clean.png';
import capC4 from '../../assets/cap-c4-clean.png';
import capC5 from '../../assets/cap-c5-clean.png';
import capC6 from '../../assets/cap-c6-clean.png';

export const WorkspaceCapabilitiesSection: React.FC = () => {
  return (
    <section id="features" className="relative py-24 sm:py-32 border-b border-[#1A2638] overflow-hidden bg-[#060A12]">
      {/* Background Circuit Grid & Tech Ambient Glow */}
      <div className="absolute inset-0 bg-tech-grid opacity-25 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[950px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-blue-500/10 to-transparent blur-[140px] pointer-events-none" />

      {/* Background Circuit Traces - Top Left Microchip Outline SVG */}
      <div className="hidden 2xl:block absolute top-12 left-10 w-44 h-44 opacity-35 pointer-events-none">
        <svg viewBox="0 0 160 160" className="w-full h-full text-cyan-400" fill="none" stroke="currentColor">
          <rect x="40" y="40" width="80" height="80" rx="8" strokeWidth="2" strokeDasharray="4 2" />
          <rect x="55" y="55" width="50" height="50" rx="4" strokeWidth="1.5" />
          {[0, 1, 2, 3, 4].map((i) => (
            <React.Fragment key={i}>
              <line x1={50 + i * 15} y1="20" x2={50 + i * 15} y2="40" strokeWidth="2" />
              <line x1={50 + i * 15} y1="120" x2={50 + i * 15} y2="140" strokeWidth="2" />
              <line x1="20" y1={50 + i * 15} x2="40" y2={50 + i * 15} strokeWidth="2" />
              <line x1="120" y1={50 + i * 15} x2="140" y2={50 + i * 15} strokeWidth="2" />
            </React.Fragment>
          ))}
          <path d="M 20 65 L 0 65 M 140 95 L 180 95 L 200 120" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Background Circuit Traces - Top Right Microcontroller Outline SVG */}
      <div className="hidden 2xl:block absolute top-10 right-10 opacity-40 pointer-events-none">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 100 100" className="w-20 h-20 text-cyan-400" fill="none" stroke="currentColor">
            <rect x="25" y="25" width="50" height="50" rx="6" strokeWidth="2" />
            <circle cx="35" cy="35" r="3" fill="currentColor" />
            {[0, 1, 2, 3].map((i) => (
              <React.Fragment key={i}>
                <line x1={32 + i * 12} y1="10" x2={32 + i * 12} y2="25" strokeWidth="2" />
                <line x1={32 + i * 12} y1="75" x2={32 + i * 12} y2="90" strokeWidth="2" />
                <line x1="10" y1={32 + i * 12} x2="25" y2={32 + i * 12} strokeWidth="2" />
                <line x1="75" y1={32 + i * 12} x2="90" y2={32 + i * 12} strokeWidth="2" />
              </React.Fragment>
            ))}
          </svg>
          <div className="font-mono text-[9px] text-cyan-300/80 space-y-0.5 tracking-wider uppercase">
            <div>ESP32</div>
            <div>Arduino</div>
            <div>IoT</div>
            <div>Sensors</div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
            Engineered For{' '}
            <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              Real Hardware
            </span>
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Every diagram, wire connection, and component choice is structured and verified.
          </p>
        </div>

        {/* 6 Capabilities Cards Grid (2 rows x 3 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          
          {/* Card 1: Interactive Wiring Canvas */}
          <div className="rounded-2xl border-2 border-[#1565C0]/70 bg-[#071120]/90 shadow-[0_0_20px_rgba(21,101,192,0.2)] p-5 flex flex-col justify-between backdrop-blur-md transition-all hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center h-full">
              {/* Left Column: Icon + Text */}
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mb-3.5 shadow-inner">
                    <Activity className="w-4 h-4 text-cyan-300" />
                  </div>
                  <h3 className="text-white font-bold text-base tracking-tight mb-2">
                    Interactive Wiring Canvas
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Zoom, pan, inspect pins, and intelligently place wires with automatic routing.
                  </p>
                </div>
              </div>

              {/* Right Column: Visual Preview Box */}
              <div className="rounded-xl overflow-hidden border border-cyan-500/30 bg-[#040A14] flex items-center justify-center shadow-inner">
                <img
                  src={capC1}
                  alt="Interactive Wiring Canvas"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Card 2: CAD Blueprint Mode */}
          <div className="rounded-2xl border-2 border-[#00897B]/70 bg-[#051515]/90 shadow-[0_0_20px_rgba(0,137,123,0.2)] p-5 flex flex-col justify-between backdrop-blur-md transition-all hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center h-full">
              {/* Left Column: Icon + Text */}
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-3.5 shadow-inner">
                    <Box className="w-4 h-4 text-emerald-300" />
                  </div>
                  <h3 className="text-white font-bold text-base tracking-tight mb-2">
                    CAD Blueprint Mode
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Technical blueprints and visual 2D/3D component layouts for enclosures, mounts, and physical dimensions.
                  </p>
                </div>
              </div>

              {/* Right Column: Visual Preview Box */}
              <div className="rounded-xl overflow-hidden border border-emerald-500/30 bg-[#030D0D] flex items-center justify-center shadow-inner">
                <img
                  src={capC2}
                  alt="CAD Blueprint Mode"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Bill of Materials & Shopping */}
          <div className="rounded-2xl border-2 border-[#7E22CE]/70 bg-[#100720]/90 shadow-[0_0_20px_rgba(126,34,206,0.2)] p-5 flex flex-col justify-between backdrop-blur-md transition-all hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center h-full">
              {/* Left Column: Icon + Text */}
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-400 flex items-center justify-center mb-3.5 shadow-inner">
                    <FileText className="w-4 h-4 text-purple-300" />
                  </div>
                  <h3 className="text-white font-bold text-base tracking-tight mb-2">
                    Bill of Materials & Shopping
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Accurate component list with details for easy purchasing and project planning.
                  </p>
                </div>
              </div>

              {/* Right Column: Visual Preview Box */}
              <div className="rounded-xl overflow-hidden border border-purple-500/30 bg-[#080312] flex items-center justify-center shadow-inner">
                <img
                  src={capC3}
                  alt="Bill of Materials & Shopping"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Monaco Code Generator */}
          <div className="rounded-2xl border-2 border-[#D97706]/70 bg-[#160E05]/90 shadow-[0_0_20px_rgba(217,119,6,0.2)] p-5 flex flex-col justify-between backdrop-blur-md transition-all hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center h-full">
              {/* Left Column: Icon + Text */}
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-3.5 shadow-inner">
                    <Code2 className="w-4 h-4 text-amber-300" />
                  </div>
                  <h3 className="text-white font-bold text-base tracking-tight mb-2">
                    Monaco Code Generator
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Generate clean, ready-to-flash code for Arduino, ESP-IDF, MicroPython and more.
                  </p>
                </div>
              </div>

              {/* Right Column: Visual Preview Box */}
              <div className="rounded-xl overflow-hidden border border-amber-500/30 bg-[#0B0601] flex items-center justify-center shadow-inner">
                <img
                  src={capC4}
                  alt="Monaco Code Generator"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Card 5: Hardware Testing Checklist */}
          <div className="rounded-2xl border-2 border-[#0284C7]/70 bg-[#05111F]/90 shadow-[0_0_20px_rgba(2,132,199,0.2)] p-5 flex flex-col justify-between backdrop-blur-md transition-all hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center h-full">
              {/* Left Column: Icon + Text */}
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mb-3.5 shadow-inner">
                    <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                  </div>
                  <h3 className="text-white font-bold text-base tracking-tight mb-2">
                    Hardware Testing Checklist
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Ensure your design is validated before building with structured testing steps and checks.
                  </p>
                </div>
              </div>

              {/* Right Column: Visual Preview Box */}
              <div className="rounded-xl overflow-hidden border border-cyan-500/30 bg-[#030913] flex items-center justify-center shadow-inner">
                <img
                  src={capC5}
                  alt="Hardware Testing Checklist"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Card 6: Electrical Safety Review */}
          <div className="rounded-2xl border-2 border-[#7C3AED]/70 bg-[#0E061E]/90 shadow-[0_0_20px_rgba(124,58,237,0.2)] p-5 flex flex-col justify-between backdrop-blur-md transition-all hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center h-full">
              {/* Left Column: Icon + Text */}
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-400 flex items-center justify-center mb-3.5 shadow-inner">
                    <Zap className="w-4 h-4 text-purple-300" />
                  </div>
                  <h3 className="text-white font-bold text-base tracking-tight mb-2">
                    Electrical Safety Review
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    AI-powered analysis to check voltage levels, pin conflicts, and safety constraints.
                  </p>
                </div>
              </div>

              {/* Right Column: Visual Preview Box */}
              <div className="rounded-xl overflow-hidden border border-purple-500/30 bg-[#070310] flex items-center justify-center shadow-inner">
                <img
                  src={capC6}
                  alt="Electrical Safety Review"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
