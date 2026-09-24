import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, BookOpen, Settings, Cpu, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Template } from '../types';
import { Sidebar, Topbar } from '../components/common/AppLayout';
import { CommandPalette } from '../components/common/CommandPalette';
import { Badge } from '../components/common/CommonUi';

export const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.getTemplates().then(setTemplates).catch(() => []);
  }, []);

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 flex">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`flex-1 flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Topbar onOpenSearch={() => setSearchOpen(true)} />
        <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <span>Project Templates Catalog</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Select pre-engineered templates with proven pinouts, BOMs, and firmware architectures
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(t => (
              <div
                key={t.id}
                className="p-5 rounded-xl border border-[#202938] bg-[#101620] hover:border-purple-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                      {t.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{t.controller}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{t.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#202938]/60 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">${t.estimatedCost.toFixed(2)}</span>
                  <button
                    onClick={() => navigate('/projects/new', { state: { templatePrompt: t.promptText } })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono transition-colors"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export const DocsPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 flex">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`flex-1 flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Topbar onOpenSearch={() => setSearchOpen(true)} />
        <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        <main className="flex-1 p-6 sm:p-8 max-w-4xl w-full mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>IoTForge Engineering Documentation</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Standard operating procedures, pinout guides, and safety protocols</p>
          </div>

          <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
            <section className="p-6 rounded-xl border border-[#202938] bg-[#101620] space-y-3">
              <h2 className="text-base font-bold text-white font-mono text-cyan-400">1. Microcontroller Logic Level Safety</h2>
              <p>
                The ESP32, STM32, and RP2040 microcontrollers operate at a 3.3V logic level. Connecting 5V digital or analog signals directly to GPIO input pins without an intermediate resistor divider or bi-directional level shifter (such as the BSS138) can degrade or permanently damage internal silicon gates.
              </p>
            </section>

            <section className="p-6 rounded-xl border border-[#202938] bg-[#101620] space-y-3">
              <h2 className="text-base font-bold text-white font-mono text-amber-400">2. Inductive Load & Flyback Protection</h2>
              <p>
                Directly driving electromagnetic coils, solenoids, or DC motors from microcontroller GPIOs is strictly prevented. When inductive loads are switched off, the collapsing magnetic field creates a reverse voltage spike (back-EMF) reaching tens of volts. Always route through an optocoupled relay or MOSFET driver with an anti-parallel freewheeling diode (e.g. 1N4007).
              </p>
            </section>

            <section className="p-6 rounded-xl border border-[#202938] bg-[#101620] space-y-3">
              <h2 className="text-base font-bold text-white font-mono text-purple-400">3. I2C and SPI Bus Multi-Drop Topology</h2>
              <p>
                Multiple peripherals can share hardware I2C SDA and SCL buses (ESP32 GPIO21 & GPIO22) provided each device possesses a unique 7-bit address (e.g. OLED at 0x3C, BME280 at 0x76). For SPI devices, MOSI, MISO, and SCK are shared while each peripheral requires a distinct Chip Select (CS) GPIO line.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 flex">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`flex-1 flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Topbar onOpenSearch={() => setSearchOpen(true)} />
        <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        <main className="flex-1 p-6 sm:p-8 max-w-2xl w-full mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              <span>Workspace Preferences</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Configure your engineer profile and API integrations</p>
          </div>

          <div className="p-6 rounded-xl border border-[#202938] bg-[#101620] space-y-4">
            <h3 className="text-sm font-bold text-white font-mono">User Profile</h3>
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Display Name</label>
                <input
                  type="text"
                  readOnly
                  value={user?.name || ''}
                  className="w-full px-3 py-2 rounded bg-[#090D16] border border-[#202938] text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  readOnly
                  value={user?.email || ''}
                  className="w-full px-3 py-2 rounded bg-[#090D16] border border-[#202938] text-slate-200"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
