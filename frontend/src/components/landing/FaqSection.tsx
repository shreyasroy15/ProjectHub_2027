import React, { useState } from 'react';
import {
  Cpu,
  Network,
  Box,
  ShoppingCart,
  Code2,
  FileText,
  Save,
  ChevronDown
} from 'lucide-react';
import faqLeft from '../../assets/faq-left.png';
import faqRight from '../../assets/faq-right.png';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems = [
    {
      icon: Cpu,
      q: 'What microcontrollers and architectures are supported?',
      a: 'ProjectHub provides verified hardware and pinout definitions for ESP32 (DevKit V1, S3, C3), STM32 (Blue Pill F103), Arduino Uno R3 & Nano, Raspberry Pi 4 Model B, and RP2040 Raspberry Pi Pico W.'
    },
    {
      icon: Network,
      q: 'Can I automatically generate wiring diagrams?',
      a: 'Yes! ProjectHub automatically produces interactive React Flow wiring schematics with zero-collision pin mapping, color-coded power rails, logic-level shifting verification, and live pin inspection.'
    },
    {
      icon: Box,
      q: 'Can I create a FreeCAD/CAD blueprint?',
      a: 'Yes. ProjectHub generates precise 2D/3D technical blueprint overlays with exact millimeter dimensions, component footprints, and mounting hole positions exportable for FreeCAD and 3D printing enclosures.'
    },
    {
      icon: ShoppingCart,
      q: 'Can I get component prices and purchase links?',
      a: 'Yes. Every project includes an itemized Bill of Materials (BOM) with real-time price comparisons and verified vendor links from Adafruit, DigiKey, Mouser, and Amazon.'
    },
    {
      icon: Code2,
      q: 'Can I generate firmware for my IoT project?',
      a: 'Yes. ProjectHub synthesizes complete, ready-to-flash C++ firmware for the Arduino framework, PlatformIO configuration environments, and ESP-IDF, complete with Wi-Fi reconnection loops, sensor drivers, and MQTT telemetry logic.'
    },
    {
      icon: FileText,
      q: 'Can I export my Bill of Materials (BOM) and documentation?',
      a: 'Yes. You can export complete BOM tables to CSV with unit costs and verified sources, export CAD blueprints to SVG/PNG, and download comprehensive engineering dossiers in Markdown and PDF.'
    },
    {
      icon: Save,
      q: 'Can I save and edit my generated projects?',
      a: 'All projects are securely saved to your ProjectHub cloud dashboard. You can return anytime to modify components, re-route wiring, regenerate firmware, or duplicate hardware configurations.'
    }
  ];

  return (
    <section id="faq" className="relative py-24 sm:py-32 border-b border-[#1A2638] overflow-hidden bg-[#060B12]">
      {/* Background Engineering Technical Grid & Subtle Radial Glow */}
      <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-transparent blur-[140px] pointer-events-none" />

      {/* Left Wing Artwork (ESP32 3D Board, PCB Circuit Traces & Sensors) */}
      <div className="hidden xl:block absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
        <img
          src={faqLeft}
          alt="ESP32 IoT Hardware and Sensors"
          className="h-[520px] 2xl:h-[600px] w-auto object-contain opacity-90 drop-shadow-[0_0_35px_rgba(6,182,212,0.25)]"
        />
      </div>

      {/* Right Wing Artwork (IoT Cloud, Circuit Traces & Database Badges) */}
      <div className="hidden xl:block absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
        <img
          src={faqRight}
          alt="IoT Cloud and Analytics"
          className="h-[520px] 2xl:h-[600px] w-auto object-contain opacity-90 drop-shadow-[0_0_35px_rgba(6,182,212,0.25)]"
        />
      </div>

      <div className="relative z-10 max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mx-auto mb-12 sm:mb-14">
          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              Questions
            </span>
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Everything you need to know about building IoT projects.
          </p>
        </div>

        {/* 7 Accordion Questions List */}
        <div className="space-y-3">
          {faqItems.map((item, idx) => {
            const isOpen = openIndex === idx;
            const Icon = item.icon;

            return (
              <div
                key={idx}
                className={`rounded-xl border transition-all duration-200 overflow-hidden backdrop-blur-md ${
                  isOpen
                    ? 'border-cyan-500/60 bg-[#0B1524]/95 shadow-[0_0_25px_-5px_rgba(6,182,212,0.25)]'
                    : 'border-[#152336] bg-[#09111C]/85 hover:border-cyan-500/40 hover:bg-[#0C1626]/90'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between text-left text-sm sm:text-[15px] font-medium text-slate-100 hover:text-cyan-300 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-4">
                    {/* Glowing Cyan Icon Badge */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 group-hover:border-cyan-400 group-hover:shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all">
                      <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>

                    <span className="truncate leading-snug">
                      {item.q}
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400'
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-4 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-cyan-500/15 animate-in fade-in duration-200">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
