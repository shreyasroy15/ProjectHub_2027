import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#080B12] bg-tech-grid flex flex-col items-center justify-center p-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-6 shadow-xl">
        <Cpu className="w-8 h-8" />
      </div>
      <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
        404 — BUS OPEN CIRCUIT
      </span>
      <h1 className="text-3xl font-extrabold text-white mt-4">Page Not Found</h1>
      <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
        The requested hardware address or routing path does not exist on this node.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};
