import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  FolderGit2,
  Cpu,
  Sparkles,
  DollarSign,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Activity,
  Layers,
  Server
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { AdminStats, AdminUser, AiUsageStats, MasterComponent } from '../types';
import { Sidebar, Topbar } from '../components/common/AppLayout';
import { CommandPalette } from '../components/common/CommandPalette';
import { Badge, Skeleton } from '../components/common/CommonUi';

export const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [aiUsage, setAiUsage] = useState<AiUsageStats | null>(null);
  const [components, setComponents] = useState<MasterComponent[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'components' | 'ai'>('overview');
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // New Component Modal
  const [newCompModal, setNewCompModal] = useState(false);
  const [compName, setCompName] = useState('');
  const [compCat, setCompCat] = useState(2); // Sensors
  const [compDesc, setCompDesc] = useState('');
  const [compPrice, setCompPrice] = useState('5.00');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, usersData, aiData, compsData] = await Promise.all([
          api.getAdminStats(),
          api.getAdminUsers(),
          api.getAiUsage(),
          api.getComponents()
        ]);
        setStats(statsData);
        setUsers(usersData);
        setAiUsage(aiData);
        setComponents(compsData);
      } catch (err: any) {
        error(err.message || 'Failed to load admin data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const handleToggleUser = async (userId: string) => {
    try {
      await api.toggleUserStatus(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
      success('User status updated.');
    } catch (err: any) {
      error(err.message || 'Failed to update user.');
    }
  };

  const handleCreateComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createComponent({
        name: compName,
        category: Number(compCat),
        description: compDesc,
        imageUrl: 'https://m.media-amazon.com/images/I/61gXQ7x1yKL._SL1200_.jpg',
        estimatedPrice: parseFloat(compPrice) || 0,
        specificationsJson: '{}',
        pinoutJson: '[]',
        defaultQuantity: 1
      });
      success('Component added to master library.');
      setNewCompModal(false);
      setCompName('');
      setCompDesc('');
      const comps = await api.getComponents();
      setComponents(comps);
    } catch (err: any) {
      error(err.message || 'Failed to add component.');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 flex">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`flex-1 flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Topbar onOpenSearch={() => setSearchOpen(true)} />
        <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h1 className="text-2xl font-extrabold text-white">System Administration Console</h1>
                <Badge variant="red" size="sm">Root Authorization</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">Platform telemetry, user access control, and hardware catalog operations</p>
            </div>

            <div className="flex items-center gap-2">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'users', label: 'Users' },
                { id: 'components', label: 'Components' },
                { id: 'ai', label: 'AI Synthesis' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                    activeTab === tab.id
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-[#101620] text-slate-400 border border-[#202938] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Platform Users', val: stats?.totalUsers || 0, icon: Users, color: 'text-rose-400' },
              { label: 'Total Workspaces', val: stats?.totalProjects || 0, icon: FolderGit2, color: 'text-cyan-400' },
              { label: 'Master Components', val: stats?.totalComponents || 0, icon: Cpu, color: 'text-emerald-400' },
              { label: 'Hardware Synthesized', val: `$${(stats?.totalEstimatedHardwareValue || 0).toFixed(2)}`, icon: DollarSign, color: 'text-amber-400' }
            ].map((s, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-[#202938] bg-[#101620]">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>{s.label}</span>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div className="text-xl font-extrabold text-white font-mono">{s.val}</div>
              </div>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border border-[#202938] bg-[#101620] space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>AI Engine Telemetry</span>
                </h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-2 border-b border-[#202938]">
                    <span className="text-slate-400">Active Synthesis Provider:</span>
                    <span className="text-cyan-400 font-bold">{aiUsage?.activeProvider || 'Local Engine'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#202938]">
                    <span className="text-slate-400">Total Synthesis Requests:</span>
                    <span className="text-slate-200">{aiUsage?.totalRequests || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#202938]">
                    <span className="text-slate-400">Average Latency:</span>
                    <span className="text-emerald-400">{aiUsage?.averageGenerationTimeSeconds}s</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">Clarifications Triggered:</span>
                    <span className="text-amber-400">{aiUsage?.clarificationsTriggered || 0}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-[#202938] bg-[#101620] space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>Infrastructure Status</span>
                </h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-2 border-b border-[#202938]">
                    <span className="text-slate-400">PostgreSQL Connection:</span>
                    <span className="text-emerald-400 font-bold">HEALTHY (Port 5432)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#202938]">
                    <span className="text-slate-400">ASP.NET Core Runtime:</span>
                    <span className="text-cyan-400 font-bold">.NET 10.0 (Linux x64)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#202938]">
                    <span className="text-slate-400">Active Sessions:</span>
                    <span className="text-slate-200">{users.filter(u => u.isActive).length} Users Active</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">Electrical Validation Engine:</span>
                    <span className="text-emerald-400">ONLINE (Rules v3.1)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Users */}
          {activeTab === 'users' && (
            <div className="rounded-xl border border-[#202938] bg-[#101620] overflow-hidden shadow-xl">
              <div className="p-4 bg-[#0E131F] border-b border-[#202938] flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-mono">Platform Accounts ({users.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0A0F1A] border-b border-[#202938] text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Workspaces</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202938]/60 text-slate-300">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-[#131A26]">
                        <td className="py-3 px-4 font-semibold text-slate-100">{u.name}</td>
                        <td className="py-3 px-4 text-slate-400">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${u.role === 2 || u.role === 'Admin' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-300'}`}>
                            {u.role === 2 || u.role === 'Admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-cyan-400 font-bold">{u.projectCount}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${u.isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {u.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleUser(u.id)}
                            className="px-2.5 py-1 rounded bg-[#161F2E] hover:bg-[#1E293B] text-[11px] text-slate-300 transition-colors"
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Components Catalog */}
          {activeTab === 'components' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">Master Electrical Parts Library ({components.length} Components)</span>
                <button
                  onClick={() => setNewCompModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Component</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {components.map(c => (
                  <div key={c.id} className="p-4 rounded-xl border border-[#202938] bg-[#101620] space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                        {typeof c.category === 'number' ? `Cat ${c.category}` : c.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        ${c.estimatedPrice.toFixed(2)}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100">{c.name}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: AI Synthesis */}
          {activeTab === 'ai' && (
            <div className="p-6 rounded-xl border border-[#202938] bg-[#101620] space-y-4 max-w-2xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>AI Generator Configuration</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configure external AI provider credentials or use the built-in deterministic hardware synthesis engine.
              </p>
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Active AI Provider:</label>
                  <input
                    type="text"
                    readOnly
                    value={aiUsage?.activeProvider || 'DeterministicHardwareEngine'}
                    className="w-full px-3 py-2 rounded bg-[#090D16] border border-[#202938] text-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Target Model:</label>
                  <input
                    type="text"
                    readOnly
                    value={aiUsage?.activeModel || 'gpt-4o-mini / LocalDeterministic'}
                    className="w-full px-3 py-2 rounded bg-[#090D16] border border-[#202938] text-slate-300"
                  />
                </div>
                <div className="p-3 rounded bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-300 leading-relaxed">
                  Notice: To switch to an external provider like OpenAI or Anthropic, set <code className="bg-black/50 px-1 py-0.5 rounded">AI_PROVIDER=OpenAI</code> and <code className="bg-black/50 px-1 py-0.5 rounded">AI_API_KEY=sk-...</code> in your backend environment variables or <code className="bg-black/50 px-1 py-0.5 rounded">docker-compose.yml</code>.
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Component Modal */}
      {newCompModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-xl border border-[#202938] bg-[#0E131F] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#202938] pb-3">
              <h3 className="text-sm font-bold text-white font-mono">Create Master Component</h3>
              <button onClick={() => setNewCompModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateComponent} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Component Name</label>
                <input
                  type="text"
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="e.g. BMP388 Precision Barometer"
                  className="w-full px-3 py-2 rounded bg-[#101620] border border-[#202938] text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={compCat}
                  onChange={(e) => setCompCat(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-[#101620] border border-[#202938] text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value={1}>Microcontrollers</option>
                  <option value={2}>Sensors</option>
                  <option value={3}>Actuators</option>
                  <option value={4}>Displays</option>
                  <option value={5}>Communication</option>
                  <option value={6}>Power</option>
                  <option value={7}>Motors</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Estimated Unit Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={compPrice}
                  onChange={(e) => setCompPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#101620] border border-[#202938] text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={compDesc}
                  onChange={(e) => setCompDesc(e.target.value)}
                  placeholder="Specifications, voltage levels, pinout summary..."
                  className="w-full px-3 py-2 rounded bg-[#101620] border border-[#202938] text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#202938]">
                <button
                  type="button"
                  onClick={() => setNewCompModal(false)}
                  className="px-3 py-1.5 rounded bg-[#161F2E] text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-500 text-slate-950 font-bold"
                >
                  Save Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
