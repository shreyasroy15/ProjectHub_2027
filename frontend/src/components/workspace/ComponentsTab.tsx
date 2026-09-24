import React, { useState } from 'react';
import {
  Cpu,
  ExternalLink,
  FileText,
  Search,
  ShoppingCart,
  AlertCircle,
  Tag,
  CheckCircle2,
  Info
} from 'lucide-react';
import type { ProjectDetail, ProjectComponent } from '../../types';
import { Badge } from '../common/CommonUi';

export const ComponentsTab: React.FC<{ project: ProjectDetail }> = ({ project }) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [selectedComp, setSelectedComp] = useState<ProjectComponent | null>(null);

  const categories = ['All', ...Array.from(new Set(project.components.map(c => c.category)))];

  const filtered = project.components.filter(c => {
    const matchesCat = filterCategory === 'All' || c.category === filterCategory;
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-cyan-950 border border-cyan-500 text-cyan-300'
                  : 'bg-[#101620] border border-[#202938] text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter components..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#101620] border border-[#202938] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(comp => {
          const isVerified = comp.verifiedPrice !== undefined && comp.verifiedPrice !== null;
          const price = comp.verifiedPrice ?? comp.unitPrice;

          return (
            <div
              key={comp.id}
              className="p-5 rounded-xl border border-[#202938] bg-[#101620] flex flex-col justify-between hover:border-slate-600 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                    {comp.category}
                  </span>
                  <div className="text-right">
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      ${price.toFixed(2)}
                    </span>
                    <span className="block text-[10px] font-mono text-slate-500">
                      {isVerified ? 'Verified Vendor Price' : 'Estimated Price'}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-100">{comp.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {comp.description}
                </p>

                {comp.compatibilityNotes && (
                  <div className="mt-3 p-2 rounded bg-[#0A0E17] border border-[#202938] text-[11px] text-amber-300 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{comp.compatibilityNotes}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-[#202938]/60 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Qty: <strong className="text-slate-200">{comp.quantity || 1}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedComp(comp)}
                    className="px-2.5 py-1 rounded bg-[#161F2E] hover:bg-[#1E293B] border border-[#202938] text-xs font-mono text-slate-300 hover:text-white transition-colors"
                  >
                    View Specs
                  </button>

                  {comp.purchaseUrl ? (
                    <a
                      href={comp.purchaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-sm shadow-cyan-500/10"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>Buy ({comp.vendorName || 'Vendor'})</span>
                    </a>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-500">No vendor link</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Component Details Modal */}
      {selectedComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl border border-[#202938] bg-[#0E131F] p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {selectedComp.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedComp.name}</h3>
              </div>
              <button
                onClick={() => setSelectedComp(null)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{selectedComp.description}</p>

            {selectedComp.compatibilityNotes && (
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/40 text-xs text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{selectedComp.compatibilityNotes}</span>
              </div>
            )}

            {selectedComp.datasheetUrl && (
              <a
                href={selectedComp.datasheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:underline"
              >
                <FileText className="w-4 h-4" />
                <span>Open Manufacturer Technical Datasheet (PDF)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <div className="pt-3 border-t border-[#202938] flex justify-end">
              <button
                onClick={() => setSelectedComp(null)}
                className="px-4 py-2 rounded-lg bg-[#161F2E] hover:bg-[#1E293B] text-xs font-mono text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
