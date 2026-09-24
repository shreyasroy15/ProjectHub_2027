import React, { useState } from 'react';
import {
  Download,
  Copy,
  Printer,
  BookOpen,
  Check,
  FileText
} from 'lucide-react';
import type { ProjectDetail } from '../../types';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const DocumentationTab: React.FC<{ project: ProjectDetail }> = ({ project }) => {
  const [copied, setCopied] = useState(false);
  const { success, error } = useToast();

  const handleDownload = async () => {
    try {
      const doc = await api.exportDocumentation(project.id);
      const blob = new Blob([doc], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title.replace(/\s+/g, '_')}_Engineering_Dossier.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      success('Documentation dossier downloaded.');
    } catch (err: any) {
      error(err.message || 'Failed to download documentation.');
    }
  };

  const handleCopy = async () => {
    try {
      const doc = await api.exportDocumentation(project.id);
      navigator.clipboard.writeText(doc);
      setCopied(true);
      success('Documentation copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch (err: any) {
      error(err.message || 'Failed to copy.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header and Download Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#202938] bg-[#101620]">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Complete Engineering Dossier & Whitepaper</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-compiled specification including Bill of Materials, pinouts, firmware, and safety protocols
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#202938] bg-[#161F2E] hover:bg-[#1E293B] text-slate-300 hover:text-white text-xs font-mono transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy Dossier'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-950/80 text-xs font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Markdown</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#202938] bg-[#161F2E] text-slate-300 hover:text-white text-xs font-mono transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Structured Document Viewer */}
      <div className="p-8 rounded-xl border border-[#202938] bg-[#0E131F] shadow-2xl space-y-8 max-w-4xl mx-auto font-sans">
        {/* Title Header */}
        <div className="border-b border-[#202938] pb-6">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
            TECHNICAL DOSSIER
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-3">{project.title}</h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">{project.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mt-4">
            <span>Project ID: <strong className="text-slate-200">{project.id}</strong></span>
            <span>Version: <strong className="text-cyan-400">v{project.version}.0</strong></span>
            <span>Controller: <strong className="text-slate-200">{project.controller}</strong></span>
            <span>Est. Cost: <strong className="text-emerald-400">${project.estimatedCost.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Section 1: Bill of Materials */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono text-cyan-400">
            1. Bill of Materials (BOM)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border border-[#202938]">
              <thead className="bg-[#121926] text-slate-400 border-b border-[#202938]">
                <tr>
                  <th className="p-2.5">Component</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Unit Price</th>
                  <th className="p-2.5">Vendor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202938]/60 text-slate-300">
                {project.components.map(c => (
                  <tr key={c.id}>
                    <td className="p-2.5 font-semibold text-slate-100">{c.name}</td>
                    <td className="p-2.5">{c.category}</td>
                    <td className="p-2.5 text-center">{c.quantity || 1}</td>
                    <td className="p-2.5 text-right">${(c.verifiedPrice ?? c.unitPrice).toFixed(2)}</td>
                    <td className="p-2.5 text-cyan-400">{c.vendorName || 'General Stock'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Pin Netlist */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono text-cyan-400">
            2. Pin-to-Pin Circuit Netlist
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border border-[#202938]">
              <thead className="bg-[#121926] text-slate-400 border-b border-[#202938]">
                <tr>
                  <th className="p-2.5">From</th>
                  <th className="p-2.5">Pin</th>
                  <th className="p-2.5">To</th>
                  <th className="p-2.5">Pin</th>
                  <th className="p-2.5">Signal</th>
                  <th className="p-2.5">Voltage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202938]/60 text-slate-300">
                {project.connections.map(conn => (
                  <tr key={conn.id}>
                    <td className="p-2.5 text-slate-100">{conn.fromComponent}</td>
                    <td className="p-2.5 text-cyan-400 font-bold">{conn.fromPin}</td>
                    <td className="p-2.5 text-slate-100">{conn.toComponent}</td>
                    <td className="p-2.5 text-cyan-400 font-bold">{conn.toPin}</td>
                    <td className="p-2.5 text-amber-300">{conn.signal}</td>
                    <td className="p-2.5">{conn.voltage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Safety Warnings */}
        {project.safetyWarnings?.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-amber-400 uppercase tracking-wider font-mono">
              3. Electrical Safety & Isolation Protocols
            </h3>
            <div className="space-y-2">
              {project.safetyWarnings.map((w, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-amber-500/40 bg-amber-950/20 text-xs">
                  <span className="font-bold text-amber-300 block mb-1">[{w.severity}] {w.title}</span>
                  <p className="text-slate-300 mb-1">{w.warning}</p>
                  <p className="text-emerald-400 font-mono text-[11px]">Remedy: {w.remedy}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
