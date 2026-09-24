import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, ArrowRight, User as UserIcon, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-[#202938] bg-[#080B12]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5 text-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              IoTForge
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                SaaS
              </span>
            </span>
          </div>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a>
          <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
          <a href="#examples" className="hover:text-cyan-400 transition-colors">Examples</a>
          <a href="#tech" className="hover:text-cyan-400 transition-colors">Tech Matrix</a>
          <a href="#faq" className="hover:text-cyan-400 transition-colors">FAQ</a>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/30 text-cyan-300 text-sm font-medium hover:bg-cyan-950/60 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="p-2 rounded-lg border border-[#202938] hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold transition-all shadow-md shadow-cyan-500/20 active:scale-[0.98]"
              >
                <span>Start Building</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
