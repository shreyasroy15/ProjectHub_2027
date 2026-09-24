import React, { useState, useEffect } from 'react';
import { Cpu, Search, ExternalLink, ShoppingCart } from 'lucide-react';
import { api } from '../api/client';
import type { MasterComponent } from '../types';
import { Sidebar, Topbar } from '../components/common/AppLayout';
import { CommandPalette } from '../components/common/CommandPalette';
import { Skeleton } from '../components/common/CommonUi';

export const ComponentsPage: React.FC = () => {
  const [components, setComponents] = useState<MasterComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getComponents(undefined, search || undefined)
      .then(setComponents)
      .catch(() => [])
      .finally(() => setLoading(false));
  }, [search]);

  const categories = ['All', 'Microcontrollers', 'Sensors', 'Actuators', 'Displays', 'Communication', 'Power', 'Motors'];

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 flex">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`flex-1 flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Topbar onOpenSearch={() => setSearchOpen(true)} />
        <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <span>Master Component Library</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">Verified microcontrollers, sensors, actuators, and power modules</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search library..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#101620] border border-[#202938] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-44" />
              <Skeleton className="h-44" />
              <Skeleton className="h-44" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {components.map(comp => (
                <div key={comp.id} className="p-5 rounded-xl border border-[#202938] bg-[#101620] flex flex-col justify-between hover:border-slate-600 transition-all">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                        {typeof comp.category === 'number' ? `Category ${comp.category}` : comp.category}
                      </span>
                      <span className="text-base font-bold text-emerald-400 font-mono">
                        ${comp.estimatedPrice.toFixed(2)}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100">{comp.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-3 mt-1.5 leading-relaxed">{comp.description}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#202938]/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">
                      {comp.purchaseLinks?.length ? `${comp.purchaseLinks.length} vendor sources` : 'In Library'}
                    </span>
                    {comp.datasheetUrl && (
                      <a
                        href={comp.datasheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>Datasheet</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
