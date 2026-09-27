import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, User as UserIcon, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import projecthubLogo from '../../assets/projecthub-logo.png';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-[#202938] bg-[#080B12]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center group shrink-0 py-1">
          <img
            src={projecthubLogo}
            alt="ProjectHub - From Idea to Hardware"
            className="h-8 sm:h-9 md:h-10 w-auto object-contain mix-blend-screen transition-transform duration-200 group-hover:scale-105"
          />
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a>
          <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
          <a href="#tech" className="hover:text-cyan-400 transition-colors">Tech Matrix</a>
          <a href="#faq" className="hover:text-cyan-400 transition-colors">FAQ</a>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/30 text-cyan-300 text-xs sm:text-sm font-medium hover:bg-cyan-950/60 transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </Link>
              )}
              <div className="flex items-center gap-2 ml-0.5 sm:ml-1 mr-0.5 sm:mr-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                  {user?.name.charAt(0) || 'U'}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-200 hidden sm:inline-block max-w-[120px] truncate">{user?.name}</span>
              </div>
              <div className="h-4 sm:h-5 w-px bg-[#202938] mx-0.5 sm:mx-1" />
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="p-1.5 sm:p-2 rounded-lg border border-[#202938] hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-2.5 sm:px-3 py-1.5 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs sm:text-sm font-semibold transition-all shadow-md shadow-cyan-500/20 active:scale-[0.98]"
              >
                <span>Start Building</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
