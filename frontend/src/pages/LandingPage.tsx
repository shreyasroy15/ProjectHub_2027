import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Cpu,
  ChevronDown,
  Terminal,
  Sparkles
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import { PipelineSection } from '../components/landing/PipelineSection';
import { WorkspaceCapabilitiesSection } from '../components/landing/WorkspaceCapabilitiesSection';
import { IoTEcosystemSection } from '../components/landing/IoTEcosystemSection';
import { FaqSection } from '../components/landing/FaqSection';
import projecthubLogo from '../assets/projecthub-logo.png';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [promptInput, setPromptInput] = useState('');

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptInput.trim()) {
      navigate('/projects/new', { state: { templatePrompt: promptInput.trim() } });
    } else {
      navigate('/projects/new');
    }
  };

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 selection:bg-cyan-500 selection:text-black">
      <Navbar />

      {/* 1. Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] w-full flex flex-col justify-between items-center overflow-hidden bg-tech-grid border-b border-[#202938] px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        {/* Ambient Gradient Glow & Subtle Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#080B12_95%)] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[620px] lg:w-[900px] h-[260px] sm:h-[420px] bg-gradient-to-tr from-cyan-500/15 via-blue-500/10 to-transparent blur-[90px] sm:blur-[130px] pointer-events-none" />

        {/* Top spacer for clean vertical balance on desktop */}
        <div className="hidden sm:block h-2" aria-hidden="true" />

        {/* Center Hero Content */}
        <div className="max-w-5xl w-full mx-auto text-center relative z-10 my-auto flex flex-col items-center">
          {/* Tag Label */}
          <div className="inline-flex items-center gap-2 text-cyan-300 text-[11px] sm:text-xs font-mono mb-4 sm:mb-6 tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
            <span className="truncate">AI-Powered IoT Engineering Workspace</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.14] sm:leading-[1.1]">
            Build Your IoT Project{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              With AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg lg:text-xl text-slate-400 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed px-2">
            Describe your idea. ProjectHub creates the verified components, pin-to-pin wiring, CAD blueprint, system architecture, firmware code, and step-by-step build guide.
          </p>

          {/* Interactive Prompt Input Bar */}
          <form
            onSubmit={handlePromptSubmit}
            className="mt-8 sm:mt-10 w-full max-w-2xl mx-auto relative group px-1 sm:px-0"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-45 transition duration-500"></div>
            <div className="relative flex items-center p-1.5 sm:p-2 rounded-2xl bg-[#0E1522]/95 border border-[#202938] group-hover:border-cyan-500/50 backdrop-blur-xl transition-all shadow-2xl">
              <Terminal className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 shrink-0 ml-2.5 sm:ml-4" />
              <input
                type="text"
                name="prompt"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g. Build a smart home security system with PIR sensors..."
                className="w-full min-w-0 bg-transparent border-none px-2.5 sm:px-4 py-2.5 sm:py-3 text-slate-100 text-sm sm:text-base focus:outline-none placeholder-slate-500 font-medium"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 active:scale-95 shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Generate</span>
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Explore / Scroll Cue */}
        <div className="w-full relative z-10 pt-4 pb-2 text-center">
          <a
            href="#how-it-works"
            className="inline-flex flex-col items-center text-xs text-slate-500 hover:text-cyan-400 transition-colors group cursor-pointer"
            aria-label="Scroll to How It Works"
          >
            <span className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase opacity-70 group-hover:opacity-100 transition-opacity">
              Explore Pipeline
            </span>
            <ChevronDown className="w-4 h-4 animate-bounce mt-1 text-slate-500 group-hover:text-cyan-400" />
          </a>
        </div>
      </section>

      {/* 2. Pipeline Section */}
      <PipelineSection />

      {/* 3. Workspace Capabilities Section */}
      <WorkspaceCapabilitiesSection />

      {/* 4. IoT Ecosystem Section */}
      <IoTEcosystemSection />

      {/* 5. Frequently Asked Questions Section */}
      <FaqSection />

      {/* 7. Bottom CTA */}
      {!isAuthenticated && (
        <section className="py-20 text-center bg-tech-grid">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white">Ready to Build Your IoT Project?</h2>
            <p className="mt-4 text-slate-400 text-sm max-w-xl mx-auto">
              Stop manually matching GPIOs and guessing component compatibility. Let ProjectHub engineer your complete buildable workspace in seconds.
            </p>
            <div className="mt-8">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-base transition-all shadow-xl shadow-cyan-500/20 active:scale-95"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 8. Footer */}
      <footer className="py-12 border-t border-[#202938] bg-[#07090F] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={projecthubLogo}
              alt="ProjectHub"
              className="h-7 sm:h-8 w-auto object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]"
            />
            <span className="text-slate-400 hidden sm:inline">— AI-Powered IoT Project Builder</span>
          </div>
          <p>© 2026 ProjectHub SaaS Engineering Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
