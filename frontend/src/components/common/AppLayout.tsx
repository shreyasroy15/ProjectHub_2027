import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FolderGit2,
  Cpu,
  BookOpen,
  Settings,
  ShieldAlert,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Layers,
  Users,
  LayoutGrid,
  Mail,
  ShoppingBag,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from './CommonUi';

export const Sidebar: React.FC<{
  collapsed: boolean;
  onToggle: () => void;
}> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  let navigation: any[] = [];

  if (isAdmin) {
    navigation = [
      { name: 'Dashboard', href: '/admin#dashboard', icon: LayoutDashboard },
      { name: 'Users', href: '/admin#users', icon: Users },
      { name: 'Contact', href: '/admin#contact', icon: Mail },
      { name: 'Shop', href: '/admin#shop', icon: ShoppingBag },
      { name: 'Gallery', href: '/admin#gallery', icon: ImageIcon }
    ];
  } else {
    navigation = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }
    ];
  }

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-[#0A0E17] border-r border-[#202938] transition-all duration-200 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#202938]">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
              <LayoutGrid className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-bold tracking-tight text-white text-base flex items-center gap-1.5">
              ProjectHub
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1 py-0.2 rounded border border-cyan-800/40">
                PRO
              </span>
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto text-slate-950 font-bold">
            <LayoutGrid className="w-5 h-5" />
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#161F2E] transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = (item.href.includes('#') 
            ? location.pathname + location.hash === item.href 
            : location.pathname === item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-cyan-950/50 text-cyan-300 border border-cyan-800/50 shadow-sm'
                  : item.highlight
                  ? 'text-cyan-400 hover:bg-cyan-950/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#101620]'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-cyan-400' : ''}`} />
              {!collapsed && <span>{item.name}</span>}
              {!collapsed && item.name === 'Admin Console' && (
                <span className="ml-auto text-[10px] font-mono uppercase bg-rose-950/70 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800/50">
                  Admin
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-[#202938] bg-[#080B12]">
        {!collapsed ? (
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300 shrink-0">
                {user?.name.charAt(0) || 'U'}
              </div>
              <div className="truncate pr-2">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-[10px] font-mono text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#161F2E] transition-colors shrink-0"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-xs font-bold text-slate-300">
            {user?.name.charAt(0) || 'U'}
          </div>
        )}
      </div>
    </aside>
  );
};

export const Topbar: React.FC<{
  onOpenSearch: () => void;
}> = ({ onOpenSearch }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 h-16 w-full bg-[#080B12]/85 backdrop-blur-md border-b border-[#202938] px-6 flex items-center justify-between">
      {/* Global Search Bar */}
      {!isAdmin ? (
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-3.5 py-2 w-72 md:w-96 rounded-lg bg-[#101620] border border-[#202938] text-slate-400 text-xs hover:border-slate-600 transition-colors text-left"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="flex-1 truncate">Search projects, components, templates...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#161F2E] border border-slate-700 rounded text-slate-400">
            Ctrl+K
          </kbd>
        </button>
      ) : (
        <div />
      )}

      {/* Quick Action & Profile */}
      <div className="flex items-center gap-4">
        {!isAdmin && (
          <>
            <Link
              to="/projects/new"
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-cyan-500/10 active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Project</span>
            </Link>

            <div className="h-5 w-px bg-[#202938]" />

            <Badge variant="cyan" size="sm">
              {user?.experienceLevel === 3 ? 'Advanced' : user?.experienceLevel === 2 ? 'Intermediate' : 'Beginner'}
            </Badge>
          </>
        )}

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 mr-2">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
              {user?.name.charAt(0) || 'U'}
            </div>
            <span className="text-xs font-semibold text-slate-200 hidden sm:inline-block">{user?.name}</span>
          </div>
          <div className="h-5 w-px bg-[#202938]" />
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#161F2E] transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
