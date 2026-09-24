import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Send,
  Sparkles,
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Terminal,
  AlertTriangle,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Sidebar, Topbar } from '../components/common/AppLayout';
import { CommandPalette } from '../components/common/CommandPalette';
import { Badge } from '../components/common/CommonUi';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  clarifications?: string[];
}

export const ProjectNewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { error: toastError, success: toastSuccess } = useToast();

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const pipelineStages = [
    { name: "Requirement Extraction", desc: "Analyzing natural language specs & constraints" },
    { name: "Microcontroller Selection", desc: "Selecting optimal target MCU (ESP32/STM32/RP2040)" },
    { name: "Sensor & Actuator Synthesis", desc: "Resolving electrical & protocol interfaces" },
    { name: "Compatibility Validation", desc: "Verifying logic levels (3.3V vs 5V) & motor isolation" },
    { name: "Pin-to-Pin Netlist Mapping", desc: "Allocating non-conflicting dedicated GPIOs & buses" },
    { name: "Wiring Diagram Generation", desc: "Synthesizing React Flow interactive net graph" },
    { name: "Firmware & Backend Scaffolding", desc: "Generating compilation-ready C++ and ASP.NET Core API" },
    { name: "Build Steps & Safety Review", desc: "Constructing step-by-step assembly guide & testing checklist" }
  ];

  useEffect(() => {
    // If navigated with initialPrompt or templatePrompt
    const initial = location.state?.initialPrompt || location.state?.templatePrompt;
    if (initial) {
      setPrompt(initial);
      // Auto-trigger analysis
      triggerGeneration(initial);
    } else {
      // Seed welcome prompt
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: "Welcome to the IoTForge Hardware Builder. Describe your IoT idea below. I will analyze your requirements, verify electrical compatibility, allocate pins, synthesize the BOM, and generate firmware code.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, []);

  const triggerGeneration = async (userPrompt: string) => {
    if (!userPrompt.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setIsGenerating(true);
    setCurrentStepIndex(0);

    // Simulate animated pipeline progression while backend generates
    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < pipelineStages.length - 1) return prev + 1;
        return prev;
      });
    }, 450);

    try {
      const generatedProject = await api.generateProject({
        prompt: userPrompt
      });

      clearInterval(interval);
      setCurrentStepIndex(pipelineStages.length);

      toastSuccess(`Engineering workspace created for "${generatedProject.title}"!`);

      // Add success message
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: `Engineering synthesis complete! Synthesized ${generatedProject.components.length} verified components, ${generatedProject.connections.length} pin-to-pin wiring connections, and complete firmware. Redirecting to workspace...`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      setTimeout(() => {
        navigate(`/projects/${generatedProject.id}`);
      }, 1200);

    } catch (err: any) {
      clearInterval(interval);
      setIsGenerating(false);
      setCurrentStepIndex(-1);
      toastError(err.message || 'Generation failed.');
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: `Could not synthesize project: ${err.message}. Please provide additional technical details regarding your sensors, actuators, and communication requirements.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    triggerGeneration(prompt);
  };

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 flex">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`flex-1 flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Topbar onOpenSearch={() => setSearchOpen(true)} />
        <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden">
          {/* Left Side: Conversational Builder */}
          <div className="w-full lg:w-1/2 flex flex-col border-r border-[#202938] bg-[#0A0E17]">
            {/* Header */}
            <div className="p-4 border-b border-[#202938] bg-[#0E1320] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h2 className="text-sm font-bold text-white">AI Project Conversation</h2>
              </div>
              <Badge variant="cyan" size="sm">Hardware Synthesis v2.4</Badge>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {msg.sender === 'user' ? 'You' : 'IoTForge Engine'}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono">{msg.timestamp}</span>
                  </div>
                  <div
                    className={`p-4 rounded-xl text-sm leading-relaxed max-w-[90%] ${
                      msg.sender === 'user'
                        ? 'bg-cyan-600 text-slate-950 font-medium rounded-tr-none shadow-md shadow-cyan-600/20'
                        : 'bg-[#121824] border border-[#202938] text-slate-200 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#101620] border border-cyan-500/30 text-cyan-300 text-xs font-mono animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Synthesizing circuit schematics & compiling netlists...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-[#202938] bg-[#0B0F19]">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={prompt}
                  disabled={isGenerating}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your IoT system (e.g. Smart irrigation with ESP32, soil sensor, relay, pump)..."
                  className="flex-1 px-4 py-3 rounded-xl bg-[#121824] border border-[#202938] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Side: Generation Pipeline Tracker */}
          <div className="w-full lg:w-1/2 flex flex-col bg-[#080B12] p-6 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span>Synthesis Pipeline Visualizer</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time hardware extraction, electrical validation, and netlist mapping</p>
            </div>

            <div className="space-y-3">
              {pipelineStages.map((stage, idx) => {
                const isPassed = currentStepIndex > idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                      isPassed
                        ? 'border-emerald-500/40 bg-emerald-950/20 text-slate-200'
                        : isCurrent
                        ? 'border-cyan-500 bg-cyan-950/30 text-white shadow-lg shadow-cyan-500/10 scale-[1.01]'
                        : 'border-[#202938] bg-[#0E1320]/60 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                          isPassed
                            ? 'bg-emerald-500 text-slate-950'
                            : isCurrent
                            ? 'bg-cyan-500 text-slate-950 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold ${isPassed || isCurrent ? 'text-slate-100' : 'text-slate-500'}`}>
                          {stage.name}
                        </h4>
                        <p className="text-xs text-slate-400">{stage.desc}</p>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing</span>
                      </span>
                    )}
                    {isPassed && (
                      <span className="text-xs font-mono text-emerald-400">Complete</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Hardware Rules Preview */}
            <div className="mt-8 p-4 rounded-xl border border-[#202938] bg-[#0E1320]">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Active Safety & Electrical Guardrails</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                <li>3.3V logic level shifting enforced for 5V analog/digital sensors</li>
                <li>Flyback diode & optocoupler isolation required for inductive motors/pumps</li>
                <li>Exclusive GPIO overlap checks on non-bus pins</li>
                <li>Mains AC power isolated from low-voltage microcontrollers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
