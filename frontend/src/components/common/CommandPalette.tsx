import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Cpu, FolderGit2, Layers, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';
import type { ProjectSummary, MasterComponent, Template } from '../../types';

export const CommandPalette: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [components, setComponents] = useState<MasterComponent[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [projRes, compRes, tempRes] = await Promise.all([
          api.getProjects().catch(() => []),
          api.getComponents(undefined, query || undefined).catch(() => []),
          api.getTemplates().catch(() => [])
        ]);

        const filteredProjs = query
          ? projRes.filter(p => p.title.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase()))
          : projRes.slice(0, 5);

        const filteredTemps = query
          ? tempRes.filter(t => t.title.toLowerCase().includes(query.toLowerCase()) || t.category.toLowerCase().includes(query.toLowerCase()))
          : tempRes.slice(0, 5);

        setProjects(filteredProjs);
        setComponents(compRes.slice(0, 5));
        setTemplates(filteredTemps);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-xl border border-[#202938] bg-[#0E131F] shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#202938] bg-[#101620]">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search projects, components, or templates..."
            className="flex-1 bg-transparent border-none text-slate-100 text-sm focus:outline-none placeholder-slate-500"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="text-xs font-mono text-slate-400 bg-[#161F2E] px-2 py-1 rounded border border-slate-700">
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {loading && (
            <div className="py-6 text-center text-xs font-mono text-cyan-400 animate-pulse">
              Scanning hardware knowledge graph...
            </div>
          )}

          {/* Projects Group */}
          {projects.length > 0 && (
            <div>
              <p className="text-[11px] font-mono uppercase text-slate-400 px-3 py-1 flex items-center gap-2">
                <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Your Projects</span>
              </p>
              <div className="space-y-1">
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { navigate(`/projects/${p.id}`); onClose(); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-[#161F2E] transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-200 group-hover:text-cyan-400">{p.title}</p>
                      <p className="text-xs text-slate-400 truncate max-w-md">{p.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Templates Group */}
          {templates.length > 0 && (
            <div>
              <p className="text-[11px] font-mono uppercase text-slate-400 px-3 py-1 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Project Templates</span>
              </p>
              <div className="space-y-1">
                {templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { navigate('/projects/new', { state: { templatePrompt: t.promptText } }); onClose(); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-[#161F2E] transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-200 group-hover:text-purple-400">{t.title}</p>
                      <p className="text-xs text-slate-400">{t.category} • ${t.estimatedCost.toFixed(2)}</p>
                    </div>
                    <span className="text-xs font-mono text-purple-400 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/40">
                      Use Template
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Components Group */}
          {components.length > 0 && (
            <div>
              <p className="text-[11px] font-mono uppercase text-slate-400 px-3 py-1 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>Components Catalog</span>
              </p>
              <div className="space-y-1">
                {components.map(c => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#101620]/60 border border-[#202938]/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-200">{c.name}</p>
                      <p className="text-xs text-slate-400 truncate max-w-md">{c.description}</p>
                    </div>
                    <span className="text-xs font-mono text-emerald-400">
                      ${c.estimatedPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && projects.length === 0 && templates.length === 0 && components.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-400">
              No matching projects, templates, or components found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
