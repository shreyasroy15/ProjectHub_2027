import React from 'react';
import {
  CheckCircle2,
  XCircle,
  SkipForward,
  Clock,
  ShieldCheck,
  Cpu,
  Radio,
  Server,
  Lock
} from 'lucide-react';
import type { ProjectDetail, TestCase } from '../../types';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const TestingTab: React.FC<{
  project: ProjectDetail;
  onRefresh: () => void;
}> = ({ project, onRefresh }) => {
  const { success, error } = useToast();

  const handleUpdateStatus = async (test: TestCase, statusNumber: number) => {
    try {
      await api.updateTest(project.id, test.id, statusNumber);
      test.status = statusNumber;
      onRefresh();
      success(`Test "${test.title}" updated.`);
    } catch (err: any) {
      error(err.message || 'Failed to update test status.');
    }
  };

  const categories = Array.from(new Set(project.testCases.map(t => t.category)));

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="p-4 rounded-xl border border-[#202938] bg-[#101620] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Hardware Verification & Testing Checklist</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Validate physical voltages, sensor ADC telemetry, network handshakes, and fail-safe logic
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {project.testCases.filter(t => t.status === 1 || t.status === 'Passed').length} Passed
          </span>
          <span className="text-rose-400 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            {project.testCases.filter(t => t.status === 2 || t.status === 'Failed').length} Failed
          </span>
          <span className="text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {project.testCases.filter(t => t.status === 0 || t.status === 'Pending').length} Pending
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map(cat => {
          const tests = project.testCases.filter(t => t.category === cat);

          return (
            <div key={cat} className="rounded-xl border border-[#202938] bg-[#101620] overflow-hidden">
              <div className="p-3 bg-[#0E131F] border-b border-[#202938] flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-cyan-400">
                  {cat} Diagnostics
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {tests.length} Checks
                </span>
              </div>

              <div className="divide-y divide-[#202938]/60">
                {tests.map(test => {
                  const isPassed = test.status === 1 || test.status === 'Passed';
                  const isFailed = test.status === 2 || test.status === 'Failed';
                  const isSkipped = test.status === 3 || test.status === 'Skipped';

                  return (
                    <div key={test.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#121926] transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-100">{test.title}</h4>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            isPassed ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                            isFailed ? 'bg-rose-950 text-rose-300 border-rose-800' :
                            isSkipped ? 'bg-slate-800 text-slate-300 border-slate-700' :
                            'bg-amber-950/60 text-amber-300 border-amber-800/60'
                          }`}>
                            {isPassed ? 'Passed' : isFailed ? 'Failed' : isSkipped ? 'Skipped' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{test.description}</p>
                      </div>

                      {/* Status Action Buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          onClick={() => handleUpdateStatus(test, 1)}
                          className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
                            isPassed
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : 'bg-[#161F2E] text-slate-400 hover:text-emerald-400 border border-[#202938]'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Pass</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(test, 2)}
                          className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
                            isFailed
                              ? 'bg-rose-500 text-white font-bold'
                              : 'bg-[#161F2E] text-slate-400 hover:text-rose-400 border border-[#202938]'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Fail</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(test, 3)}
                          className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
                            isSkipped
                              ? 'bg-slate-700 text-white font-bold'
                              : 'bg-[#161F2E] text-slate-400 hover:text-slate-200 border border-[#202938]'
                          }`}
                        >
                          <SkipForward className="w-3.5 h-3.5" />
                          <span>Skip</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
