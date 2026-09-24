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
  Terminal,
  Radio,
  Server,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { Badge } from '../components/common/CommonUi';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
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
      q: "Does IoTForge support electrical safety and voltage checks?",
      a: "Yes! IoTForge runs an automated compatibility engine that checks 3.3V vs 5V logic compatibility, flags direct GPIO-to-motor connections that require relay or MOSFET drivers, detects pin collisions, and enforces isolation rules for high-voltage mains AC circuits."
    },
    {
      q: "What microcontrollers and architectures are supported?",
      a: "IoTForge has pre-configured electrical and pinout models for ESP32 (DevKit V1, S3, C3), STM32 (Blue Pill F103), Arduino Uno R3/Nano, Raspberry Pi 4 Model B, and RP2040 Raspberry Pi Pico W."
    },
    {
      q: "Is the generated firmware ready to flash?",
      a: "Yes. IoTForge generates syntax-highlighted, compilation-ready C++ firmware for the Arduino framework, PlatformIO configuration environments, and ESP-IDF, complete with Wi-Fi reconnection loops, sensor libraries, and MQTT telemetry logic."
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
            Describe your idea. IoTForge creates the verified components, pin-to-pin wiring, CAD blueprint, system architecture, firmware code, and step-by-step build guide.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/signup"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-base transition-all shadow-xl shadow-cyan-500/20 active:scale-95"
            >
              <span>Start Building Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#examples"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-[#202938] hover:border-slate-600 bg-[#101620] text-slate-300 hover:text-white font-medium text-base transition-colors"
            >
              Explore Example Projects
            </a>
          </div>

          {/* Animated Engineering Workspace Preview Widget */}
          <div className="mt-16 max-w-5xl mx-auto rounded-2xl border border-[#202938] bg-[#0E1420] shadow-2xl overflow-hidden text-left">
            {/* Window Titlebar */}
            <div className="h-11 px-4 bg-[#101622] border-b border-[#202938] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs font-mono text-slate-400 flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>workspace://smart_irrigation_esp32_v1</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewTab('wiring')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${previewTab === 'wiring' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'}`}
                >
                  Wiring Canvas
                </button>
                <button
                  onClick={() => setPreviewTab('code')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${previewTab === 'code' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'}`}
                >
                  Firmware C++
                </button>
                <button
                  onClick={() => setPreviewTab('bom')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${previewTab === 'bom' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'}`}
                >
                  BOM Table
                </button>
              </div>
            </div>

            {/* Preview Body */}
            <div className="p-6 bg-[#090D16] min-h-[340px] flex items-center justify-center">
              {previewTab === 'wiring' && (
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="p-4 rounded-xl border border-cyan-500/40 bg-[#101726] shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-cyan-400 font-bold">ESP32 DevKit V1</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">MCU</span>
                    </div>
                    <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
                      <div className="flex justify-between border-b border-slate-800/60 pb-1"><span>GPIO21 (SDA)</span><span className="text-cyan-400">→ OLED</span></div>
                      <div className="flex justify-between border-b border-slate-800/60 pb-1"><span>GPIO34 (ADC1)</span><span className="text-emerald-400">→ Soil Sensor</span></div>
                      <div className="flex justify-between border-b border-slate-800/60 pb-1"><span>GPIO4 (Data)</span><span className="text-amber-400">→ DHT22</span></div>
                      <div className="flex justify-between"><span>GPIO26 (IN)</span><span className="text-purple-400">→ 5V Relay</span></div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-full flex items-center justify-center gap-2 font-mono text-xs text-slate-400">
                      <span className="w-8 h-px bg-cyan-500/40" />
                      <span className="text-cyan-400">I2C / ADC / 1-Wire Netlist</span>
                      <span className="w-8 h-px bg-cyan-500/40" />
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Zero Pin Collisions Detected</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-purple-500/40 bg-[#151024] shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-purple-300 font-bold">5V Relay & 12V Pump</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">Actuator</span>
                    </div>
                    <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
                      <div className="flex justify-between border-b border-slate-800/60 pb-1"><span>Trigger</span><span className="text-purple-400">Active LOW</span></div>
                      <div className="flex justify-between border-b border-slate-800/60 pb-1"><span>Isolation</span><span className="text-emerald-400">Optocoupled</span></div>
                      <div className="flex justify-between"><span>Load Supply</span><span className="text-amber-400">12V 2A DC PSU</span></div>
                    </div>
                  </div>
                </div>
              )}

              {previewTab === 'code' && (
                <pre className="w-full font-mono text-xs text-slate-300 p-4 rounded-lg bg-black/60 border border-[#202938] overflow-x-auto leading-relaxed">
                  <code>{`#include <WiFi.h>
#include <PubSubClient.h>

#define SOIL_PIN 34
#define RELAY_PIN 26

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // Safe initial state
  WiFi.begin("SSID", "PASS");
}

void loop() {
  int moisture = analogRead(SOIL_PIN);
  if (moisture > 3000) {
    digitalWrite(RELAY_PIN, LOW); // Trigger pump
  }
}`}</code>
                </pre>
              )}

              {previewTab === 'bom' && (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="border-b border-[#202938] text-slate-400">
                      <tr>
                        <th className="py-2">Component</th>
                        <th className="py-2">Qty</th>
                        <th className="py-2">Unit Price</th>
                        <th className="py-2">Vendor</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#202938]/60 text-slate-300">
                      <tr><td className="py-2 text-cyan-400">ESP32 DevKit V1</td><td>1</td><td>$6.20</td><td>Adafruit</td><td className="text-emerald-400">Verified Price</td></tr>
                      <tr><td className="py-2 text-cyan-400">Capacitive Moisture Sensor</td><td>1</td><td>$2.95</td><td>SparkFun</td><td className="text-emerald-400">In Stock</td></tr>
                      <tr><td className="py-2 text-cyan-400">5V Optocoupled Relay</td><td>1</td><td>$2.10</td><td>DigiKey</td><td className="text-emerald-400">In Stock</td></tr>
                      <tr><td className="py-2 text-cyan-400">12V Submersible Pump</td><td>1</td><td>$7.99</td><td>Amazon</td><td className="text-amber-400">Estimated</td></tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Generator Preview */}
      <section className="py-20 border-b border-[#202938] bg-[#0A0F1A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-bold text-white">Try Prompting the Builder</h2>
            <p className="mt-3 text-slate-400 text-sm">
              Click an engineering concept below or type your custom requirement to start building immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {examplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => navigate('/projects/new', { state: { templatePrompt: p.text } })}
                className="p-4 rounded-xl border border-[#202938] bg-[#101620] hover:border-cyan-500/50 hover:bg-[#131B29] transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm text-slate-200 group-hover:text-cyan-400">{p.title}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-1" />
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{p.text}</p>
              </button>
            ))}
          </div>

          <div className="p-3 rounded-2xl border border-cyan-500/30 bg-[#0E1522] shadow-2xl flex items-center gap-3">
            <Terminal className="w-5 h-5 text-cyan-400 shrink-0 ml-3" />
            <input
              type="text"
              readOnly
              value="Build an industrial telemetry node with ESP32, K-type thermocouple, MAX6675 digitizer and Modbus/TCP..."
              className="flex-1 bg-transparent border-none text-slate-300 text-sm focus:outline-none cursor-pointer"
              onClick={() => navigate('/projects/new')}
            />
            <button
              onClick={() => navigate('/projects/new')}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
            >
              Generate
            </button>
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section id="how-it-works" className="py-24 border-b border-[#202938]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="cyan" size="sm">Pipeline</Badge>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">How IoTForge Transforms Your Idea</h2>
            <p className="mt-3 text-slate-400 text-sm">
              From natural language idea to ready-to-solder schematics in under 10 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              { step: "01", title: "Natural Language Prompt", desc: "Describe your project requirements, target controller, and power constraints.", icon: Terminal },
              { step: "02", title: "AI Hardware Synthesis", desc: "Selects sensors, actuators, voltage regulators, and microcontrollers based on electrical specs.", icon: Cpu },
              { step: "03", title: "Compatibility Validation", desc: "Enforces voltage level shifting, motor flyback protection, and pin mapping rules.", icon: ShieldAlert },
              { step: "04", title: "Engineering Workspace", desc: "Generates interactive React Flow wiring, Monaco firmware C++, BOM table, and build guide.", icon: Code2 }
            ].map((s, idx) => (
              <div key={idx} className="relative p-6 rounded-xl border border-[#202938] bg-[#101620] hover:border-cyan-500/40 transition-colors">
                <span className="font-mono text-3xl font-extrabold text-slate-700/60 mb-3 block">{s.step}</span>
                <s.icon className="w-6 h-6 text-cyan-400 mb-4" />
                <h3 className="text-base font-bold text-slate-100 mb-2">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
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
      <section className="py-20 text-center bg-tech-grid">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">Ready to Build Your IoT Project?</h2>
          <p className="mt-4 text-slate-400 text-sm max-w-xl mx-auto">
            Stop manually matching GPIOs and guessing component compatibility. Let IoTForge engineer your complete buildable workspace in seconds.
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

      {/* 8. Footer */}
      <footer className="py-12 border-t border-[#202938] bg-[#07090F] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">IoTForge</span>
            <span>— AI-Powered IoT Project Builder</span>
          </div>
          <p>© 2026 IoTForge SaaS Engineering Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
