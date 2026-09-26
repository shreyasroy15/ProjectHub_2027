import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Cpu,
  DollarSign,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Clock,
  Layers,
  Search,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import type { ProjectSummary, Template } from '../types';
import { Badge, SafetyReviewBadge, Skeleton, EmptyState } from '../components/common/CommonUi';
import { Sidebar, Topbar } from '../components/common/AppLayout';
import { CommandPalette } from '../components/common/CommandPalette';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projList, tempList] = await Promise.all([
          api.getProjects().catch(() => []),
          api.getTemplates().catch(() => [])
        ]);
        setProjects(projList);
        setTemplates(tempList);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    navigate('/projects/new', { state: { initialPrompt: prompt.trim() } });
  };

  // Compute statistics
  const totalProjects = projects.length;
  const totalComponents = projects.reduce((acc, p) => acc + p.componentCount, 0);
  const totalEstimatedCost = projects.reduce((acc, p) => acc + p.estimatedCost, 0);
  const completedProjects = projects.filter(p => p.status === 3 || p.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Topbar onOpenSearch={() => setSearchOpen(true)} />
        <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Welcome Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {user?.name || 'Engineer'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Your AI-assisted hardware engineering console is active.
              </p>
            </div>
            <button
              onClick={() => navigate('/projects/new')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/10 active:scale-[0.98] self-start md:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Project</span>
            </button>
          </div>

          {/* Prominent AI Generator Bar */}
          <div className="p-6 rounded-2xl border border-cyan-500/40 bg-[#101726]/80 backdrop-blur-sm shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-2">
                <Sparkles className="w-4 h-4" />
                <span>AI Engineering Synthesis</span>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">What do you want to build?</h2>
              <form onSubmit={handlePromptSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Build a smart irrigation system using ESP32, soil moisture sensors, temperature monitoring and automatic water pump control."
                  className="flex-1 px-4 py-3 rounded-xl bg-[#090D16] border border-[#202938] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-inner"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 active:scale-95 shrink-0"
                >
                  Generate Project
                </button>
              </form>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="font-mono text-[11px] text-slate-500">Suggested:</span>
                {[
                  "Smart Irrigation System",
                  "ESP32 Weather Station",
                  "RFID Attendance Gate",
                  "Home Security Alarm"
                ].map(suggest => (
                  <button
                    key={suggest}
                    type="button"
                    onClick={() => setPrompt(`Build a ${suggest.toLowerCase()} with sensors, alerts and real-time cloud dashboard.`)}
                    className="px-2 py-0.5 rounded bg-[#161F2E] hover:bg-[#1E293B] border border-[#202938] text-slate-300 hover:text-cyan-400 transition-colors text-[11px] font-mono"
                  >
                    {suggest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Projects Created', val: totalProjects, icon: FolderGit2, color: 'text-cyan-400' },
              { label: 'Components Used', val: totalComponents, icon: Cpu, color: 'text-sky-400' },
              { label: 'Estimated Hardware Cost', val: `$${totalEstimatedCost.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400' },
              { label: 'Completed Builds', val: completedProjects, icon: CheckCircle2, color: 'text-purple-400' },
            ].map((stat, i) => (
              <div key={i} className="p-5 rounded-xl border border-[#202938] bg-[#101620] shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-2xl font-extrabold text-white font-mono">{stat.val}</div>
              </div>
            ))}
          </div>

          {/* Recent Projects Section */}
          <section id="projects" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-cyan-400" />
                  <span>Your Projects</span>
                </h3>
                <p className="text-xs text-slate-400">Reopen and continue previously generated hardware workspaces</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
              </div>
            ) : projects.length === 0 ? (
              <EmptyState
                title="No projects yet"
                description="Describe your first IoT idea and ProjectHub will synthesize the complete schematic, wiring, and code structure for you."
                actionText="Create First Project"
                onAction={() => navigate('/projects/new')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(p => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="p-5 rounded-xl border border-[#202938] bg-[#101620] hover:border-cyan-500/50 hover:bg-[#121A27] transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                          {p.controller}
                        </span>
                        {p.safetyReviewRequired && (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Safety Review
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1">
                        {p.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#202938]/60 flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>{p.componentCount} components</span>
                      <span className="text-emerald-400 font-bold">${p.estimatedCost.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Project Templates Gallery */}
          <section className="space-y-4 pt-4 border-t border-[#202938]/60">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <span>Pre-Engineered Templates</span>
              </h3>
              <p className="text-xs text-slate-400">Populate the AI builder with verified starting architectures</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.slice(0, 6).map(t => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border border-[#202938] bg-[#101620] hover:border-purple-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">
                        {t.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {t.controller}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-200">{t.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">{t.description}</p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-[#202938]/60 flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400">${t.estimatedCost.toFixed(2)}</span>
                    <button
                      onClick={() => navigate('/projects/new', { state: { templatePrompt: t.promptText } })}
                      className="px-3 py-1 rounded-md bg-[#161F2E] hover:bg-purple-950 text-xs font-mono text-purple-300 hover:text-white border border-[#202938] hover:border-purple-800 transition-colors"
                    >
                      Use Template →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
