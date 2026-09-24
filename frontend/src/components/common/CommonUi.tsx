import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, Cpu, ShieldCheck } from 'lucide-react';

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'cyan' | 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'neutral';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}> = ({ children, variant = 'neutral', size = 'sm', icon }) => {
  const variantStyles = {
    cyan: 'bg-cyan-950/40 text-cyan-400 border-cyan-800/50',
    blue: 'bg-sky-950/40 text-sky-400 border-sky-800/50',
    green: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50',
    amber: 'bg-amber-950/40 text-amber-400 border-amber-800/50',
    purple: 'bg-purple-950/40 text-purple-400 border-purple-800/50',
    red: 'bg-rose-950/40 text-rose-400 border-rose-800/50',
    neutral: 'bg-slate-900/60 text-slate-300 border-slate-700/60'
  }[variant];

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-md border ${sizeStyles} ${variantStyles}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export const SafetyReviewBadge: React.FC<{ reason?: string }> = ({ reason }) => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-950/30 text-amber-300 text-xs font-mono" title={reason}>
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
      <span>Safety Review Required</span>
    </div>
  );
};

export const SafetyPassedBadge: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 text-xs font-mono">
      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
      <span>Electrical Validation Passed</span>
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-6 w-full' }) => {
  return (
    <div className={`animate-pulse rounded bg-[#161F2E]/70 border border-[#202938]/40 ${className}`} />
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}> = ({ title, description, actionText, onAction, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-[#202938] bg-[#101620]/60 max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-xl bg-[#161F2E] border border-[#202938] flex items-center justify-center text-cyan-400 mb-4 shadow-inner">
        {icon || <Cpu className="w-7 h-7" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 m-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-slate-200">
          <div className="flex items-center gap-3 text-rose-400 mb-3">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Workspace Component Error</h3>
          </div>
          <p className="text-sm text-slate-300 mb-4">
            An unexpected error occurred while rendering this workspace tab.
          </p>
          <pre className="p-3 bg-black/60 rounded text-xs font-mono text-rose-300 overflow-x-auto">
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-sm"
          >
            Retry Component
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
