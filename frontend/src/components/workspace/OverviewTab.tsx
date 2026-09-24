import React from 'react';
import {
  Cpu,
  Radio,
  Zap,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Activity,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import type { ProjectDetail } from '../../types';
import { Badge, SafetyReviewBadge, SafetyPassedBadge } from '../common/CommonUi';

export const OverviewTab: React.FC<{
  project: ProjectDetail;
  onNavigateTab: (tab: string) => void;
}> = ({ project, onNavigateTab }) => {
  const completedSteps = project.buildSteps.filter(s => s.isCompleted).length;
  const totalSteps = project.buildSteps.length || 1;
  const stepProgress = Math.round((completedSteps / totalSteps) * 100);

  const passedTests = project.testCases.filter(t => t.status === 1 || t.status === 'Passed').length;
  const totalTests = project.testCases.length || 1;
  const testProgress = Math.round((passedTests / totalTests) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Safety Alert Banner if required */}
      {project.safetyReviewRequired && (
        <div className="p-4 rounded-xl border border-amber-500/50 bg-amber-950/20 text-amber-300 flex items-start gap-3.5 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-200">Safety Review Required</h4>
            <p className="text-xs text-amber-300/90 leading-relaxed">
              {project.safetyReviewReason || 'This project includes inductive loads (motors/pumps) or high voltage. Intermediate isolation (relays/optocouplers) has been pre-configured in the schematic.'}
            </p>
          </div>
        </div>
      )}

      {/* Primary KPI Hardware Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl border border-[#202938] bg-[#101620]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Target Controller</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">{project.controller}</div>
          <div className="text-[11px] text-cyan-400 font-mono mt-1">3.3V Logic Rail</div>
        </div>

        <div className="p-4 rounded-xl border border-[#202938] bg-[#101620]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Connectivity</span>
            <Radio className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono truncate">{project.connectivity}</div>
          <div className="text-[11px] text-sky-400 font-mono mt-1">MQTT / REST Telemetry</div>
        </div>

        <div className="p-4 rounded-xl border border-[#202938] bg-[#101620]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Estimated Cost</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">${project.estimatedCost.toFixed(2)}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">{project.components.length} Components</div>
        </div>

        <div className="p-4 rounded-xl border border-[#202938] bg-[#101620]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Build Time</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">{project.estimatedBuildTime}</div>
          <div className="text-[11px] text-amber-400 font-mono mt-1">{project.buildSteps.length} Assembly Steps</div>
        </div>

        <div className="p-4 rounded-xl border border-[#202938] bg-[#101620]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Safety Status</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono mt-1">
            {project.safetyReviewRequired ? 'Flagged Review' : 'Verified Safe'}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">Flyback & Logic Checked</div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-[#202938] bg-[#101620] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Construction Assembly Progress</span>
            </span>
            <span className="text-cyan-400 font-bold">{completedSteps}/{totalSteps} Steps ({stepProgress}%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#161F2E] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${stepProgress}%` }}
            />
          </div>
          <button
            onClick={() => onNavigateTab('buildGuide')}
            className="text-xs font-mono text-cyan-400 hover:underline inline-flex items-center gap-1"
          >
            Open Step-by-Step Construction Guide →
          </button>
        </div>

        <div className="p-5 rounded-xl border border-[#202938] bg-[#101620] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Hardware Testing Checklist</span>
            </span>
            <span className="text-emerald-400 font-bold">{passedTests}/{totalTests} Verified ({testProgress}%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#161F2E] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              style={{ width: `${testProgress}%` }}
            />
          </div>
          <button
            onClick={() => onNavigateTab('testing')}
            className="text-xs font-mono text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            Review Electrical & Telemetry Tests →
          </button>
        </div>
      </div>

      {/* Requirements & Power Budget Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-xl border border-[#202938] bg-[#101620] space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Functional Engineering Requirements</span>
          </h3>
          <ul className="space-y-2 text-sm text-slate-300">
            {project.requirements.map((req, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-xl border border-[#202938] bg-[#101620] space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Power & Thermal Budget</span>
          </h3>
          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[#0E131F] border border-[#202938]">
              <span className="text-slate-400 block mb-1">Primary Power In</span>
              <span className="text-slate-200 font-semibold">{project.powerSource}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#0E131F] border border-[#202938]">
              <span className="text-slate-400 block mb-1">Logic Voltage</span>
              <span className="text-cyan-400 font-semibold">3.3V Regulated (ESP32 Onboard LDO)</span>
            </div>
            <div className="p-3 rounded-lg bg-[#0E131F] border border-[#202938]">
              <span className="text-slate-400 block mb-1">Peak Transmission Draw</span>
              <span className="text-amber-400 font-semibold">~240mA during Wi-Fi RF Burst</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
