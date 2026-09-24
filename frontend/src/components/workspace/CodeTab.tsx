import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Copy,
  Download,
  RotateCcw,
  Sparkles,
  FileCode,
  Check,
  Terminal,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import type { ProjectDetail, CodeArtifact } from '../../types';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const CodeTab: React.FC<{ project: ProjectDetail }> = ({ project }) => {
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>(
    project.codeArtifacts[0]?.id || ''
  );
  const [copied, setCopied] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { success, error } = useToast();

  const currentArtifact = project.codeArtifacts.find(a => a.id === selectedArtifactId) || project.codeArtifacts[0];

  const handleCopy = () => {
    if (!currentArtifact) return;
    navigator.clipboard.writeText(currentArtifact.codeContent);
    setCopied(true);
    success('Code copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentArtifact) return;
    const blob = new Blob([currentArtifact.codeContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentArtifact.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    success(`Downloaded ${currentArtifact.fileName}`);
  };

  const handleExplain = () => {
    if (!currentArtifact) return;
    if (currentArtifact.targetStack === 'Firmware') {
      setAiExplanation(
        `This firmware connects the ${project.controller} to local Wi-Fi, registers with the MQTT broker, polls the sensors every 10 seconds with moving-average filtering, and actuates the relay with safe hysteresis to prevent rapid cycling.`
      );
    } else if (currentArtifact.targetStack === 'Backend') {
      setAiExplanation(
        `This ASP.NET Core REST API controller validates incoming JSON telemetry packets, maps device identifiers, logs telemetry structured events via Serilog, and commits records to PostgreSQL.`
      );
    } else {
      setAiExplanation(
        `This relational PostgreSQL DDL migration sets up hypertable indexing on device_id and recorded_at for fast time-series analytical queries.`
      );
    }
  };

  const handleRegenerate = async () => {
    if (!currentArtifact) return;
    setIsRegenerating(true);
    try {
      const updated = await api.regenerateCode(project.id, currentArtifact.targetStack, currentArtifact.subCategory);
      currentArtifact.codeContent = updated.codeContent;
      success(`Regenerated ${currentArtifact.fileName} implementation.`);
    } catch (err: any) {
      error(err.message || 'Failed to regenerate code.');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* File Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-[#202938] bg-[#101620]">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {project.codeArtifacts.map(artifact => (
            <button
              key={artifact.id}
              onClick={() => { setSelectedArtifactId(artifact.id); setAiExplanation(null); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                (currentArtifact?.id === artifact.id)
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'bg-[#0E131F] text-slate-400 border border-[#202938] hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>{artifact.fileName}</span>
              <span className="text-[10px] text-slate-500">({artifact.subCategory})</span>
            </button>
          ))}
        </div>

        {/* Code Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#202938] bg-[#161F2E] hover:bg-[#1E293B] text-slate-300 hover:text-white text-xs font-mono transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#202938] bg-[#161F2E] hover:bg-[#1E293B] text-slate-300 hover:text-white text-xs font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download</span>
          </button>

          <button
            onClick={handleExplain}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-950/30 text-purple-300 hover:bg-purple-950/60 text-xs font-mono transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Explain</span>
          </button>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#202938] bg-[#161F2E] hover:bg-[#1E293B] text-slate-300 hover:text-white text-xs font-mono transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-cyan-400 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* AI Explanation Banner */}
      {aiExplanation && (
        <div className="p-4 rounded-xl border border-purple-500/40 bg-purple-950/20 text-purple-200 text-xs font-mono flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white block">AI Code Architecture Explanation:</span>
            <p className="leading-relaxed text-slate-300">{aiExplanation}</p>
          </div>
        </div>
      )}

      {/* Monaco Editor Container */}
      <div className="h-[520px] rounded-xl border border-[#202938] bg-[#0E131F] overflow-hidden shadow-2xl">
        <Editor
          height="100%"
          language={currentArtifact?.language === 'sql' ? 'sql' : currentArtifact?.language === 'csharp' ? 'csharp' : 'cpp'}
          value={currentArtifact?.codeContent || '// No code artifact available'}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: true },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
          }}
        />
      </div>
    </div>
  );
};
