import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Cpu,
  FileSpreadsheet,
  Activity,
  Code2,
  CheckCircle2,
  BookOpen,
  Download,
  Share2,
  Trash2,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  History,
  Send,
  X,
  Printer,
  ChevronRight
} from 'lucide-react';
import { api } from '../api/client';
import type { ProjectDetail, ProjectVersion } from '../types';
import { useToast } from '../context/ToastContext';
import { Sidebar, Topbar } from '../components/common/AppLayout';
import { CommandPalette } from '../components/common/CommandPalette';
import { Skeleton, ErrorBoundary } from '../components/common/CommonUi';

// Workspace Tabs
import { OverviewTab } from '../components/workspace/OverviewTab';
import { ComponentsTab } from '../components/workspace/ComponentsTab';
import { BomTab } from '../components/workspace/BomTab';
import { WiringTab } from '../components/workspace/WiringTab';
import { PinMappingTab } from '../components/workspace/PinMappingTab';
import { BlueprintTab } from '../components/workspace/BlueprintTab';
import { ArchitectureTab } from '../components/workspace/ArchitectureTab';
import { InfrastructureTab } from '../components/workspace/InfrastructureTab';
import { CodeTab } from '../components/workspace/CodeTab';
import { BuildGuideTab } from '../components/workspace/BuildGuideTab';
import { TestingTab } from '../components/workspace/TestingTab';
import { DocumentationTab } from '../components/workspace/DocumentationTab';

export const ProjectWorkspacePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // default collapsed in workspace for wide canvas!
  const [searchOpen, setSearchOpen] = useState(false);

  // Chat Drawer State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Version History Modal
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [versionNotes, setVersionNotes] = useState('');

  const fetchProject = async () => {
    if (!projectId) return;
    try {
      const data = await api.getProjectById(projectId);
      setProject(data);
    } catch (err: any) {
      error(err.message || 'Failed to load project.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !projectId || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await api.chatWithProject(projectId, userText);
      await fetchProject();
      success('AI responded.');
    } catch (err: any) {
      error(err.message || 'Chat error.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleSaveVersion = async () => {
    if (!projectId) return;
    try {
      await api.createVersion(projectId, versionNotes || `Checkpoint v${(project?.version || 1) + 1}`);
      setVersionNotes('');
      success('Project version snapshot saved.');
      const vList = await api.getVersions(projectId);
      setVersions(vList);
      await fetchProject();
    } catch (err: any) {
      error(err.message || 'Failed to save version.');
    }
  };

  const handleOpenVersions = async () => {
    if (!projectId) return;
    try {
      const vList = await api.getVersions(projectId);
      setVersions(vList);
      setVersionModalOpen(true);
    } catch (err: any) {
      error(err.message || 'Failed to fetch versions.');
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!projectId) return;
    try {
      await api.restoreVersion(projectId, versionId);
      success('Project restored to snapshot.');
      setVersionModalOpen(false);
      await fetchProject();
    } catch (err: any) {
      error(err.message || 'Failed to restore version.');
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId || !window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.deleteProject(projectId);
      success('Project deleted.');
      navigate('/dashboard');
    } catch (err: any) {
      error(err.message || 'Failed to delete project.');
    }
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-[#080B12] text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4 font-mono text-xs text-cyan-400">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Mounting Engineering Workspace...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'components', label: 'Components', icon: Cpu, count: project.components.length },
    { id: 'bom', label: 'BOM', icon: FileSpreadsheet },
    { id: 'wiring', label: 'Wiring', icon: Activity, count: project.connections.length },
    { id: 'pinMapping', label: 'Pin Mapping', icon: Cpu },
    { id: 'blueprint', label: 'Blueprint', icon: Layers },
    { id: 'architecture', label: 'Architecture', icon: Activity },
    { id: 'infrastructure', label: 'Infrastructure', icon: Layers },
    { id: 'code', label: 'Code', icon: Code2, count: project.codeArtifacts.length },
    { id: 'buildGuide', label: 'Build Guide', icon: Layers, count: project.buildSteps.length },
    { id: 'testing', label: 'Testing', icon: CheckCircle2, count: project.testCases.length },
    { id: 'documentation', label: 'Documentation', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 flex">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`flex-1 flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Topbar onOpenSearch={() => setSearchOpen(true)} />
        <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        {/* Project Header Bar */}
        <div className="border-b border-[#202938] bg-[#0A0F1A] px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold text-white tracking-tight">{project.title}</h1>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  v{project.version}.0
                </span>
                {project.safetyReviewRequired && (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    Safety Flagged
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 max-w-3xl truncate">{project.description}</p>
            </div>

            {/* Quick Header Actions */}
            <div className="flex items-center gap-2 self-start lg:self-auto">
              <button
                onClick={handleOpenVersions}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#202938] bg-[#101620] hover:border-slate-600 text-xs font-mono text-slate-300 transition-colors"
              >
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span>Versions</span>
              </button>

              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-950 text-xs font-mono text-cyan-300 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Assistant</span>
              </button>

              <button
                onClick={handleDeleteProject}
                className="p-2 rounded-lg border border-[#202938] hover:border-rose-500/50 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 transition-colors"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="mt-5 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-t border-[#202938]/60 pt-3">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-700/60 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#101620]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-cyan-900 text-cyan-200' : 'bg-[#161F2E] text-slate-500'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Body */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto relative">
          <ErrorBoundary>
            {activeTab === 'overview' && <OverviewTab project={project} onNavigateTab={(t) => setActiveTab(t)} />}
            {activeTab === 'components' && <ComponentsTab project={project} />}
            {activeTab === 'bom' && <BomTab project={project} />}
            {activeTab === 'wiring' && <WiringTab project={project} />}
            {activeTab === 'pinMapping' && <PinMappingTab project={project} />}
            {activeTab === 'blueprint' && <BlueprintTab project={project} />}
            {activeTab === 'architecture' && <ArchitectureTab project={project} />}
            {activeTab === 'infrastructure' && <InfrastructureTab project={project} />}
            {activeTab === 'code' && <CodeTab project={project} />}
            {activeTab === 'buildGuide' && <BuildGuideTab project={project} onRefresh={fetchProject} />}
            {activeTab === 'testing' && <TestingTab project={project} onRefresh={fetchProject} />}
            {activeTab === 'documentation' && <DocumentationTab project={project} />}
          </ErrorBoundary>
        </main>

        {/* AI Assistant Chat Drawer */}
        {chatOpen && (
          <div className="fixed top-16 right-0 w-full sm:w-96 h-[calc(100vh-4rem)] z-40 bg-[#0C121E] border-l border-[#202938] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-3.5 border-b border-[#202938] bg-[#0F1626] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-bold">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Project AI Assistant</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {project.messages.map((m, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-cyan-950/80 border border-cyan-800 text-cyan-200 ml-6 font-mono'
                      : 'bg-[#121A28] border border-[#202938] text-slate-300 mr-6'
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-500 block mb-1 uppercase">
                    {m.role === 'user' ? 'You' : 'ProjectHub Engineer'}
                  </span>
                  {m.content}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t border-[#202938] bg-[#0E1422] flex gap-2">
              <input
                type="text"
                value={chatInput}
                disabled={chatLoading}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about wiring, code, or power..."
                className="flex-1 px-3 py-2 rounded-lg bg-[#090D16] border border-[#202938] text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Version History Modal */}
        {versionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg rounded-xl border border-[#202938] bg-[#0E131F] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#202938] pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white font-mono">
                  <History className="w-4 h-4 text-cyan-400" />
                  <span>Version Snapshots ({versions.length})</span>
                </div>
                <button onClick={() => setVersionModalOpen(false)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>

              {/* Create new snapshot */}
              <div className="p-3 rounded-lg bg-[#101620] border border-[#202938] space-y-2">
                <span className="text-xs font-mono text-slate-300 font-semibold block">Create New Version Checkpoint</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={versionNotes}
                    onChange={(e) => setVersionNotes(e.target.value)}
                    placeholder="e.g. Added relay flyback diode circuit..."
                    className="flex-1 px-3 py-1.5 rounded bg-[#090D16] border border-[#202938] text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleSaveVersion}
                    className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Version List */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {versions.map(v => (
                  <div
                    key={v.id}
                    className="p-3 rounded-lg border border-[#202938] bg-[#101620] flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="text-cyan-400 font-bold">Version {v.versionNumber}</span>
                      <p className="text-slate-400 mt-0.5">{v.changeNotes || 'No notes'}</p>
                      <span className="text-[10px] text-slate-500">{new Date(v.createdAt).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => handleRestoreVersion(v.id)}
                      className="px-2.5 py-1 rounded bg-[#161F2E] hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-[#202938] hover:border-cyan-800 transition-colors"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
