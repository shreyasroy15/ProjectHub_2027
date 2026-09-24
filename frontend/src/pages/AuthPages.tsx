import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, ArrowRight, Lock, Mail, User, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      success('Logged in successfully. Welcome to IoTForge.');
      navigate('/dashboard');
    } catch (err: any) {
      error(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B12] bg-tech-grid flex flex-col justify-center items-center px-4 py-12">
      <Link to="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
          <Cpu className="w-6 h-6 text-slate-950" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white">IoTForge</span>
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-[#202938] bg-[#101620] p-8 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Welcome back</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to your engineering workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0E131F] border border-[#202938] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-xs text-cyan-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0E131F] border border-[#202938] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-cyan-400 font-semibold hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, confirmPassword);
      success('Account created successfully! Welcome to IoTForge.');
      navigate('/dashboard');
    } catch (err: any) {
      error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B12] bg-tech-grid flex flex-col justify-center items-center px-4 py-12">
      <Link to="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
          <Cpu className="w-6 h-6 text-slate-950" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white">IoTForge</span>
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-[#202938] bg-[#101620] p-8 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Create your account</h2>
          <p className="text-xs text-slate-400 mt-1">Start engineering IoT projects with AI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0E131F] border border-[#202938] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ada@company.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0E131F] border border-[#202938] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg bg-[#0E131F] border border-[#202938] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">Confirm</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg bg-[#0E131F] border border-[#202938] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating workspace...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { success } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    success('Password reset instructions sent to your email.');
  };

  return (
    <div className="min-h-screen bg-[#080B12] bg-tech-grid flex flex-col justify-center items-center px-4 py-12">
      <Link to="/" className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
          <Cpu className="w-6 h-6 text-slate-950" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white">IoTForge</span>
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-[#202938] bg-[#101620] p-8 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Reset password</h2>
          <p className="text-xs text-slate-400 mt-1">Enter your registered email address</p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/30 text-cyan-300 text-xs font-mono leading-relaxed">
            If an account exists for {email}, a recovery link has been dispatched with valid reset tokens.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0E131F] border border-[#202938] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
            >
              Send Reset Link
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          Remembered your credentials?{' '}
          <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};
