import React from 'react';
import {
  Cpu,
  Terminal,
  Shield,
  Code2,
  CheckCircle2,
  ChevronRight,
  Send,
  ChevronsRight
} from 'lucide-react';
import esp32Badge from '../../assets/pipeline-esp32-badge.png';
import c2Components from '../../assets/pipeline-c2-components.png';
import c4Workspace from '../../assets/pipeline-c4-workspace.png';

export const PipelineSection: React.FC = () => {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 border-b border-[#1A2638] overflow-hidden bg-[#060A12]">
      {/* Background Engineering Technical Grid & Subtle Ambient Glows */}
      <div className="absolute inset-0 bg-tech-grid opacity-25 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[950px] h-[380px] bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-transparent blur-[140px] pointer-events-none" />

      {/* Decorative Circuit Traces SVG on Left Top */}
      <div className="hidden lg:block absolute left-0 top-6 pointer-events-none select-none z-0 opacity-70">
        <svg className="w-80 h-72 text-cyan-400" viewBox="0 0 320 280" fill="none" stroke="currentColor">
          <path d="M 0 100 L 70 100 L 110 140 L 180 140" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="180" cy="140" r="3.5" fill="#00E5FF" />
          <path d="M 0 140 L 40 140 L 80 180 L 130 180" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="130" cy="180" r="3.5" fill="#00E5FF" />
          <path d="M 0 180 L 50 180 L 90 220 L 160 220" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="160" cy="220" r="3.5" fill="#00E5FF" />
          <path d="M 110 140 L 140 100 L 220 100" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="220" cy="100" r="3.5" fill="#00E5FF" />
        </svg>
      </div>

      {/* Decorative Top-Right Floating ESP32 + Neon Badges Artwork */}
      <div className="hidden xl:block absolute right-8 top-8 pointer-events-none select-none z-0">
        <img
          src={esp32Badge}
          alt="ESP32 IoT Cluster"
          className="w-56 2xl:w-64 h-auto drop-shadow-[0_0_30px_rgba(6,182,212,0.35)]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
            How{' '}
            <span className="text-cyan-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.5)]">
              ProjectHub
            </span>{' '}
            Transforms Your Idea
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            From natural language ideas to ready-to-order schematics in under 10 seconds.
          </p>
        </div>

        {/* 4 Connected Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-3 items-stretch relative">
          
          {/* Card 01: Natural Language Prompt */}
          <div className="relative rounded-2xl border-2 border-[#1E6FD9]/80 bg-[#07101E]/95 shadow-[0_0_25px_rgba(30,111,217,0.2)] p-5 flex flex-col justify-between backdrop-blur-md transition-all hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <div>
              {/* Header: 01 Badge + Terminal Icon */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-0.5 rounded-full bg-[#133E78] text-[#38BDF8] text-xs font-mono font-bold tracking-wider">
                  01
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#133E78]/50 border border-[#38BDF8]/40 text-[#38BDF8] flex items-center justify-center">
                  <Terminal className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-white font-bold text-base tracking-tight mb-1.5">
                Natural Language Prompt
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Describe your idea, goals, and constraints in simple language.
              </p>
            </div>

            {/* Prompt Preview Container */}
            <div className="bg-[#030712]/90 border border-[#1E3A66] rounded-xl p-3 flex items-center justify-between gap-3 shadow-inner">
              <span className="text-slate-300 text-xs italic leading-snug">
                &ldquo;Smart home temperature monitor using ESP32 and BME280 with mobile alerts&rdquo;
              </span>
              <div className="w-7 h-7 rounded-full bg-[#0284C7] text-white flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(56,189,248,0.6)]">
                <Send className="w-3 h-3 fill-white translate-x-[1px]" />
              </div>
            </div>

            {/* Connector Arrow (Desktop) */}
            <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
              <ChevronsRight className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
            </div>
          </div>

          {/* Card 02: AI Hardware Synthesis */}
          <div className="relative rounded-2xl border-2 border-[#059669]/80 bg-[#041312]/95 shadow-[0_0_25px_rgba(16,185,129,0.2)] p-5 flex flex-col justify-between backdrop-blur-md transition-all hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <div>
              {/* Header: 02 Badge + CPU Icon */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-0.5 rounded-full bg-[#064E3B] text-[#34D399] text-xs font-mono font-bold tracking-wider">
                  02
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#064E3B]/50 border border-[#34D399]/40 text-[#34D399] flex items-center justify-center">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-white font-bold text-base tracking-tight mb-1.5">
                AI Hardware Synthesis
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                The AI selects the best sensors, controllers and modules based on your requirements.
              </p>
            </div>

            {/* Hardware Component Grid Image */}
            <div className="rounded-xl overflow-hidden border border-[#064E3B]/70 bg-[#030B0B] p-1.5 flex items-center justify-center shadow-inner">
              <img
                src={c2Components}
                alt="Selected Sensors and Microcontrollers"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>

            {/* Connector Arrow (Desktop) */}
            <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
              <ChevronsRight className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
            </div>
          </div>

          {/* Card 03: Compatibility Validation */}
          <div className="relative rounded-2xl border-2 border-[#7C3AED]/80 bg-[#0E071D]/95 shadow-[0_0_25px_rgba(124,58,237,0.2)] p-5 flex flex-col justify-between backdrop-blur-md transition-all hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <div>
              {/* Header: 03 Badge + Shield Icon */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-0.5 rounded-full bg-[#4C1D95] text-[#C084FC] text-xs font-mono font-bold tracking-wider">
                  03
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#4C1D95]/50 border border-[#C084FC]/40 text-[#C084FC] flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-white font-bold text-base tracking-tight mb-1.5">
                Compatibility Validation
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Checks pin mapping, power, voltage levels and component compatibility to ensure a working design.
              </p>
            </div>

            {/* Validation Checklist Items */}
            <div className="bg-[#060310]/90 border border-[#4C1D95]/60 rounded-xl p-3 space-y-2 shadow-inner">
              {[
                'Pin & Voltage Compatibility',
                'Power Requirement Check',
                'Sensor Interference Check',
                'Real-time Design Analysis'
              ].map((text, i) => (
                <div key={i} className="flex items-center justify-between text-[11px] sm:text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                    <span>{text}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </div>
              ))}
            </div>

            {/* Connector Arrow (Desktop) */}
            <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
              <ChevronsRight className="w-5 h-5 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]" />
            </div>
          </div>

          {/* Card 04: Engineering Workspace */}
          <div className="relative rounded-2xl border-2 border-[#D97706]/80 bg-[#160D04]/95 shadow-[0_0_25px_rgba(217,119,6,0.2)] p-5 flex flex-col justify-between backdrop-blur-md transition-all hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            <div>
              {/* Header: 04 Badge + Code Icon */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-0.5 rounded-full bg-[#78350F] text-[#FBBF24] text-xs font-mono font-bold tracking-wider">
                  04
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#78350F]/50 border border-[#FBBF24]/40 text-[#FBBF24] flex items-center justify-center">
                  <Code2 className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-white font-bold text-base tracking-tight mb-1.5">
                Engineering Workspace
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Get complete schematics, wiring diagrams, BOM, firmware and purchase links. Ready to build and deploy.
              </p>
            </div>

            {/* Workspace Split Preview Image */}
            <div className="rounded-xl overflow-hidden border border-[#78350F]/70 bg-[#090501] p-1.5 flex items-center justify-center shadow-inner">
              <img
                src={c4Workspace}
                alt="Engineering Workspace Schematics and Code"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>
          </div>

        </div>

        {/* Bottom Pipeline Progress Line & Nodes */}
        <div className="mt-14 sm:mt-16 pt-4 relative">
          {/* Horizontal Glowing Track Line */}
          <div className="h-0.5 w-full bg-gradient-to-r from-cyan-500 via-emerald-500 via-purple-500 to-amber-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.6)]" />

          {/* 4 Milestone Dots & Labels */}
          <div className="relative -top-2 flex items-center justify-between px-6 sm:px-12">
            
            {/* Step 1 Node */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-cyan-400 bg-[#060A12] flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.8)]">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-cyan-400">
                IDEA
              </span>
            </div>

            {/* Step 2 Node */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-emerald-400 bg-[#060A12] flex items-center justify-center shadow-[0_0_12px_rgba(52,211,153,0.8)]">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-emerald-400">
                COMPONENTS
              </span>
            </div>

            {/* Step 3 Node */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-purple-400 bg-[#060A12] flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.8)]">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              </div>
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-purple-400">
                VALIDATION
              </span>
            </div>

            {/* Step 4 Node */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-amber-400 bg-[#060A12] flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.8)]">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-amber-400">
                READY TO BUILD
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
