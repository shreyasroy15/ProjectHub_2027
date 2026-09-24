import React from 'react';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import type { ProjectDetail, BuildStep } from '../../types';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const BuildGuideTab: React.FC<{
  project: ProjectDetail;
  onRefresh: () => void;
}> = ({ project, onRefresh }) => {
  const { success, error } = useToast();

  const handleToggle = async (step: BuildStep) => {
    try {
      await api.toggleBuildStep(project.id, step.id, !step.isCompleted);
      step.isCompleted = !step.isCompleted;
      onRefresh();
      success(step.isCompleted ? `Step ${step.stepNumber} marked complete.` : `Step ${step.stepNumber} incomplete.`);
    } catch (err: any) {
      error(err.message || 'Failed to update step.');
    }
  };

  const completed = project.buildSteps.filter(s => s.isCompleted).length;
  const total = project.buildSteps.length || 1;
  const pct = Math.round((completed / total) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header & Progress Indicator */}
      <div className="p-5 rounded-xl border border-[#202938] bg-[#101620] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Step-by-Step Hardware Assembly Guide</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Follow sequential electrical steps to assemble and verify your circuit safely
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-mono text-cyan-400 font-bold">{completed} of {total} Complete</span>
            <span className="text-[10px] font-mono text-slate-500 block">({pct}%)</span>
          </div>
          <div className="w-28 h-2 rounded-full bg-[#161F2E] overflow-hidden">
            <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Assembly Steps */}
      <div className="space-y-4">
        {project.buildSteps.map(step => (
          <div
            key={step.id}
            className={`p-5 rounded-xl border transition-all ${
              step.isCompleted
                ? 'border-emerald-500/40 bg-emerald-950/10'
                : 'border-[#202938] bg-[#101620]'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <button
                  onClick={() => handleToggle(step)}
                  className="mt-0.5 text-slate-500 hover:text-cyan-400 transition-colors shrink-0"
                >
                  {step.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-cyan-400">Step {step.stepNumber}:</span>
                    <h4 className={`text-sm font-bold ${step.isCompleted ? 'text-slate-300 line-through' : 'text-slate-100'}`}>
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">{step.description}</p>

                  {step.warnings && (
                    <div className="mt-3 p-3 rounded-lg bg-amber-950/30 border border-amber-500/40 text-xs text-amber-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{step.warnings}</span>
                    </div>
                  )}

                  {step.expectedResult && (
                    <div className="mt-2 text-xs font-mono text-slate-400">
                      <span className="text-emerald-400">Expected Result:</span> {step.expectedResult}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleToggle(step)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors shrink-0 ${
                  step.isCompleted
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-[#161F2E] text-slate-300 hover:text-white border border-[#202938]'
                }`}
              >
                {step.isCompleted ? 'Completed' : 'Mark Done'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
