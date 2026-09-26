import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Cpu,
  Zap,
  Activity,
  Code2,
  FileSpreadsheet,
  CheckCircle2,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Terminal,
  Radio,
  Server,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { Badge } from '../components/common/CommonUi';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [previewTab, setPreviewTab] = useState<'wiring' | 'code' | 'bom'>('wiring');

  const examplePrompts = [
    { title: "Smart Irrigation", text: "Build a smart irrigation system using ESP32, soil moisture sensors, temperature monitoring and automatic water pump control." },
    { title: "Weather Station", text: "Create an ESP32 solar weather station monitoring barometric pressure, temperature, humidity with BME280 and OLED display." },
    { title: "RFID Attendance", text: "Build an RFID attendance system using ESP32, RC522 card reader, RGB indicator and server-side employee verification." },
    { title: "Home Security", text: "Build a smart home security system with PIR motion sensors, magnetic door contacts, buzzer alarm and push notifications." }
  ];

  const faqs = [
    {
      q: "Does ProjectHub support electrical safety and voltage checks?",
      a: "Yes! ProjectHub runs an automated compatibility engine that checks 3.3V vs 5V logic compatibility, flags direct GPIO-to-motor connections that require relay or MOSFET drivers, detects pin collisions, and enforces isolation rules for high-voltage mains AC circuits."
    },
    {
      q: "What microcontrollers and architectures are supported?",
      a: "ProjectHub has pre-configured electrical and pinout models for ESP32 (DevKit V1, S3, C3), STM32 (Blue Pill F103), Arduino Uno R3/Nano, Raspberry Pi 4 Model B, and RP2040 Raspberry Pi Pico W."
    },
    {
      q: "Is the generated firmware ready to flash?",
      a: "Yes. ProjectHub generates syntax-highlighted, compilation-ready C++ firmware for the Arduino framework, PlatformIO configuration environments, and ESP-IDF, complete with Wi-Fi reconnection loops, sensor libraries, and MQTT telemetry logic."
    },
    {
      q: "Can I export my Bill of Materials (BOM) and documentation?",
      a: "Yes. You can export complete BOM tables to CSV with unit costs and verified vendor sources, export CAD blueprints to SVG/PNG, download documentation dossiers in Markdown/PDF, and download code artifacts."
    }
  ];

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 selection:bg-cyan-500 selection:text-black">
      <Navbar />

      {/* 1. Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden bg-tech-grid border-b border-[#202938]">
        {/* Ambient Gradient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-blue-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-mono mb-8 animate-in fade-in slide-in-from-top-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI-Powered IoT Engineering Workspace</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Build Your IoT Project <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">With AI</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Describe your idea. ProjectHub creates the verified components, pin-to-pin wiring, CAD blueprint, system architecture, firmware code, and step-by-step build guide.
          </p>

          <form onSubmit={(e) => {
            e.preventDefault();
            const input = new FormData(e.currentTarget).get('prompt') as string;
            if (input?.trim()) {
              navigate('/projects/new', { state: { templatePrompt: input } });
            } else {
              navigate('/projects/new');
            }
          }} className="mt-12 max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center p-2 rounded-2xl bg-[#0E1522]/90 border border-[#202938] group-hover:border-cyan-500/50 backdrop-blur-xl transition-colors shadow-2xl">
              <Terminal className="w-6 h-6 text-cyan-400 shrink-0 ml-4" />
              <input
                type="text"
                name="prompt"
                placeholder="e.g. Build a smart home security system with PIR sensors..."
                className="flex-1 bg-transparent border-none px-4 py-3 text-slate-100 text-base focus:outline-none placeholder-slate-500 font-medium"
              />
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-extrabold text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 active:scale-95 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Generate</span>
              </button>
            </div>
          </form>


        </div>
      </section>



      {/* 3. How It Works */}
      <section id="how-it-works" className="relative py-32 border-b border-[#202938] overflow-hidden bg-[#05070B]">
        {/* Background Grid & Gradient */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 -z-10 m-auto h-[400px] w-[600px] rounded-[100%] bg-cyan-900/10 opacity-30 blur-[120px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Floating Decorative Elements */}
          <div className="hidden lg:flex absolute top-4 left-4 -rotate-6 animate-pulse flex-col p-3 rounded-xl border border-cyan-500/20 bg-cyan-950/20 shadow-[0_0_30px_-5px_rgba(6,182,212,0.1)] backdrop-blur-sm z-0">
             <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center mb-2">
               <Terminal className="w-3 h-3 text-cyan-400" />
             </div>
             <div className="h-1.5 w-20 bg-cyan-500/30 rounded mb-1.5"></div>
             <div className="h-1.5 w-12 bg-cyan-500/20 rounded"></div>
          </div>
          
          <div className="hidden lg:block absolute top-0 right-10 rotate-6 p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 shadow-[0_0_40px_-5px_rgba(99,102,241,0.15)] backdrop-blur-sm z-0">
             <div className="grid grid-cols-2 gap-2">
                <div className="w-10 h-10 rounded-lg border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center shadow-inner">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="w-10 h-10 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center shadow-inner">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="w-10 h-10 rounded-lg border border-purple-500/30 bg-purple-500/10 flex items-center justify-center shadow-inner">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div className="w-10 h-10 rounded-lg border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center shadow-inner">
                  <Server className="w-5 h-5 text-cyan-400" />
                </div>
             </div>
          </div>

          <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
            <div className="mb-4">
              <Badge variant="cyan" size="sm">Pipeline</Badge>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              How ProjectHub Transforms Your Idea
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mb-10">
              From natural language idea to ready-to-solder schematics in under 10 seconds.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-medium text-purple-300">
                <Zap className="w-3.5 h-3.5" /> AI-Powered Engineering
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-300">
                <Cpu className="w-3.5 h-3.5" /> Real Components
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-medium text-blue-300">
                <ShieldAlert className="w-3.5 h-3.5" /> Verified Design Rules
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-medium text-purple-300">
                <Layers className="w-3.5 h-3.5" /> Production-Ready Output
              </span>
            </div>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Desktop Connectors with Glowing Arrows */}
            <div className="hidden lg:flex absolute top-[25%] left-[20%] right-[20%] z-0 items-center justify-between pointer-events-none">
              <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/20 to-emerald-500/50 relative">
                <div className="absolute -right-3 -top-3 w-6 h-6 flex items-center justify-center animate-pulse">
                  <ChevronRight className="w-6 h-6 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/50 to-purple-500/50 relative">
                <div className="absolute -right-3 -top-3 w-6 h-6 flex items-center justify-center animate-pulse" style={{ animationDelay: '200ms' }}>
                  <ChevronRight className="w-6 h-6 text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                </div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-amber-500/50 relative">
                <div className="absolute -right-3 -top-3 w-6 h-6 flex items-center justify-center animate-pulse" style={{ animationDelay: '400ms' }}>
                  <ChevronRight className="w-6 h-6 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                </div>
              </div>
            </div>
            
            {[
              { step: "01", title: "Natural Language Prompt", desc: "Describe your project requirements, target controller, and power constraints.", icon: Terminal, color: "cyan", numColor: "text-cyan-900/40 group-hover:text-cyan-800/60" },
              { step: "02", title: "AI Hardware Synthesis", desc: "Selects sensors, actuators, voltage regulators, and microcontrollers based on electrical specs.", icon: Cpu, color: "emerald", numColor: "text-emerald-900/40 group-hover:text-emerald-800/60" },
              { step: "03", title: "Compatibility Validation", desc: "Enforces voltage level shifting, motor flyback protection, and pin mapping rules.", icon: ShieldAlert, color: "purple", numColor: "text-purple-900/40 group-hover:text-purple-800/60" },
              { step: "04", title: "Engineering Workspace", desc: "Generates interactive React Flow wiring, Monaco firmware C++, BOM table, and build guide.", icon: Code2, color: "amber", numColor: "text-amber-900/40 group-hover:text-amber-800/60" }
            ].map((s, idx) => {
              const borderColors = {
                cyan: "group-hover:border-cyan-500/50 group-hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.15)]",
                emerald: "group-hover:border-emerald-500/50 group-hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)]",
                purple: "group-hover:border-purple-500/50 group-hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.15)]",
                amber: "group-hover:border-amber-500/50 group-hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.15)]",
              }[s.color as 'cyan'|'emerald'|'purple'|'amber'];

              const iconBgColors = {
                cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]",
                emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]",
                purple: "bg-purple-500/10 border-purple-500/20 text-purple-400 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]",
                amber: "bg-amber-500/10 border-amber-500/20 text-amber-400 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]",
              }[s.color as 'cyan'|'emerald'|'purple'|'amber'];

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -6 }}
                  key={idx}
                  className={`group flex flex-col h-full relative z-10 p-6 sm:p-7 rounded-[18px] bg-[#0E1522] border border-slate-800/80 transition-all duration-300 ${borderColors}`}
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${iconBgColors}`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <span className={`font-mono text-4xl font-extrabold transition-colors duration-300 ${s.numColor}`}>{s.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-3 group-hover:text-white transition-colors">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors mb-auto">{s.desc}</p>
                  
                  {s.step === "01" && (
                    <div className="mt-8 flex flex-col gap-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 rounded-full border border-slate-700/50 bg-slate-800/30 text-[10px] font-medium text-slate-300">Smart Home</span>
                        <span className="px-2.5 py-1 rounded-full border border-slate-700/50 bg-slate-800/30 text-[10px] font-medium text-slate-300">Agriculture</span>
                        <span className="px-2.5 py-1 rounded-full border border-slate-700/50 bg-slate-800/30 text-[10px] font-medium text-slate-300">Monitoring</span>
                      </div>
                      <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-900/30 relative">
                        <p className="text-[10px] text-cyan-200/70 leading-relaxed font-mono">Build a smart irrigation system using ESP32, soil moisture sensor, relay and water pump...</p>
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                          <Terminal className="w-3 h-3 text-slate-950" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {s.step === "02" && (
                    <div className="mt-8 grid grid-cols-2 gap-2">
                      <div className="aspect-video rounded-lg border border-slate-800 bg-[#131B29] flex items-center justify-center shadow-inner">
                        <Cpu className="w-6 h-6 text-slate-500" />
                      </div>
                      <div className="aspect-video rounded-lg border border-slate-800 bg-[#131B29] flex items-center justify-center shadow-inner">
                        <Activity className="w-6 h-6 text-slate-500" />
                      </div>
                      <div className="aspect-video rounded-lg border border-slate-800 bg-[#131B29] flex items-center justify-center shadow-inner">
                        <Zap className="w-6 h-6 text-slate-500" />
                      </div>
                      <div className="aspect-video rounded-lg border border-slate-800 bg-[#131B29] flex items-center justify-center shadow-inner">
                        <Radio className="w-6 h-6 text-slate-500" />
                      </div>
                    </div>
                  )}
                  
                  {s.step === "03" && (
                    <div className="mt-8 flex flex-col gap-2">
                      {['Voltage Compatibility', 'GPIO Pin Mapping', 'Motor Protection', 'Power Budget Analysis'].map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-800/20 p-2 rounded-lg border border-slate-800/50">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{item}</span>
                          </div>
                          <ChevronDown className="w-3 h-3 text-slate-600 -rotate-90" />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {s.step === "04" && (
                    <div className="mt-8 rounded-lg border border-slate-800 bg-[#0A0F1A] overflow-hidden flex flex-col">
                      <div className="flex text-[9px] font-mono border-b border-slate-800">
                        <span className="px-3 py-1.5 border-r border-slate-800 text-amber-400 bg-amber-950/10">Code</span>
                        <span className="px-3 py-1.5 border-r border-slate-800 text-slate-500">BOM</span>
                        <span className="px-3 py-1.5 text-slate-500">Guide</span>
                      </div>
                      <div className="p-3 bg-[#0A0F1A] grid grid-cols-2 gap-2 h-24">
                        <div className="border border-slate-800 rounded bg-[#131B29] relative overflow-hidden flex items-center justify-center">
                           <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4px_4px]"></div>
                           <Activity className="w-5 h-5 text-slate-600 relative z-10" />
                        </div>
                        <div className="font-mono text-[6px] text-slate-400 leading-tight flex flex-col justify-center">
                          <div><span className="text-pink-500">#include</span> &lt;WiFi.h&gt;</div>
                          <div><span className="text-pink-500">#include</span> &lt;DHT.h&gt;</div>
                          <div><span className="text-slate-500">// Smart Irrigation</span></div>
                          <div><span className="text-blue-400">void</span> <span className="text-yellow-200">setup</span>() {'{'}</div>
                          <div>&nbsp;&nbsp;Serial.<span className="text-yellow-200">begin</span>(115200);</div>
                          <div>{'}'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Indicators */}
          <div className="mt-16 pt-8 border-t border-slate-800/50 flex flex-wrap items-center justify-center lg:justify-between gap-4 max-w-4xl mx-auto font-mono text-[10px] font-bold text-slate-500 tracking-widest uppercase">
            <span className="text-cyan-500/80">IDEA</span>
            <ArrowRight className="hidden lg:block w-3.5 h-3.5 text-slate-700" />
            <span className="text-emerald-500/80">COMPONENTS</span>
            <ArrowRight className="hidden lg:block w-3.5 h-3.5 text-slate-700" />
            <span className="text-purple-500/80">VALIDATION</span>
            <ArrowRight className="hidden lg:block w-3.5 h-3.5 text-slate-700" />
            <span className="text-amber-500/80">READY TO BUILD</span>
          </div>
        </div>
      </section>

      {/* 4. Core Features */}
      <section id="features" className="py-24 border-b border-[#202938] bg-[#0A0E17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="blue" size="sm">Workspace Capabilities</Badge>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">Engineered For Real Hardware</h2>
            <p className="mt-3 text-slate-400 text-sm">
              Every diagram, wire connection, and component price is structured and verified.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Interactive Wiring Canvas", desc: "Zoom, pan, inspect pins, and highlight colored wires dynamically powered by React Flow.", icon: Activity },
              { title: "CAD Blueprint Mode", desc: "Technical blueprint grid visualizing component footprints, power rails, and physical dimensions.", icon: Layers },
              { title: "Bill of Materials & Shopping", desc: "Accurate itemized table comparing estimated prices with verified vendor links from Adafruit, DigiKey, Mouser.", icon: FileSpreadsheet },
              { title: "Monaco Code Generator", desc: "Multi-stack code editor for Arduino C++, ESP-IDF, ASP.NET Core C#, and SQL migrations.", icon: Code2 },
              { title: "Hardware Testing Checklist", desc: "Interactive verification checklist tracking hardware power, sensor calibration, and connectivity.", icon: CheckCircle2 },
              { title: "Electrical Safety Review", desc: "Automated warnings for inductive load back-EMF, 3.3V/5V logic clashes, and mains AC isolation.", icon: ShieldAlert }
            ].map((f, idx) => (
              <div key={idx} className="p-6 rounded-xl border border-[#202938] bg-[#101620] hover:border-slate-600 transition-colors">
                <f.icon className="w-6 h-6 text-cyan-400 mb-4" />
                <h3 className="text-base font-bold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Technology Matrix */}
      <section id="tech" className="py-20 border-b border-[#202938]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="purple" size="sm">Hardware Ecosystem</Badge>
          <h2 className="mt-3 text-3xl font-bold text-white">Universal Microcontroller & Cloud Support</h2>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {['ESP32 Xtensa', 'STM32 ARM', 'Arduino Uno', 'RP2040 Pico', 'MQTT TLS', 'ASP.NET Core', 'PostgreSQL', 'FreeRTOS', 'I2C / SPI', 'LoRaWAN', 'BLE 5.0', 'Docker'].map((tech, i) => (
              <div key={i} className="p-3.5 rounded-lg border border-[#202938] bg-[#101620] text-xs font-mono text-slate-300 flex items-center justify-center">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faq" className="py-24 border-b border-[#202938] bg-[#0A0E17]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-[#202938] bg-[#101620] overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-slate-200 hover:text-cyan-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180 text-cyan-400' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-[#202938]/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

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
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">ProjectHub</span>
            <span>— AI-Powered IoT Project Builder</span>
          </div>
          <p>© 2026 ProjectHub SaaS Engineering Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
