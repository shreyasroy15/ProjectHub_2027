import React, { useRef, useState } from 'react';
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Printer,
  Layers,
  Zap,
  Activity
} from 'lucide-react';
import type { ProjectDetail } from '../../types';
import { useToast } from '../../context/ToastContext';

export const BlueprintTab: React.FC<{ project: ProjectDetail }> = ({ project }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { success } = useToast();

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '_')}_Blueprint.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    success('Blueprint SVG exported successfully.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Blueprint Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-[#202938] bg-[#101620]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            CAD Engineering Blueprint (Scale 1:1)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-[#202938] rounded-lg bg-[#0E131F] p-0.5">
            <button
              onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
              className="p-1.5 text-slate-400 hover:text-white rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono text-cyan-400 font-semibold">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
              className="p-1.5 text-slate-400 hover:text-white rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="p-1.5 text-slate-400 hover:text-white rounded border-l border-[#202938]"
              title="Reset Layout"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleExportSvg}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 text-xs font-mono hover:bg-cyan-950/80 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export SVG</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#202938] bg-[#161F2E] text-slate-300 text-xs font-mono hover:text-white transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print CAD</span>
          </button>
        </div>
      </div>

      {/* Blueprint Drawing Surface */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-[520px] rounded-xl border border-[#202938] bg-blueprint-grid overflow-hidden relative cursor-grab active:cursor-grabbing shadow-2xl"
      >
        <svg
          ref={svgRef}
          width="1000"
          height="700"
          viewBox="0 0 1000 700"
          className="absolute inset-0 select-none pointer-events-none transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'top left'
          }}
        >
          {/* Blueprint Title Block Box (Corner standard) */}
          <g transform="translate(680, 560)">
            <rect width="300" height="120" fill="#0E1929" stroke="#00E5FF" strokeWidth="1.5" opacity="0.9" />
            <text x="15" y="25" fill="#00E5FF" fontSize="12" fontFamily="monospace" fontWeight="bold">IOTFORGE CAD SCHEMATIC</text>
            <text x="15" y="45" fill="#E2E8F0" fontSize="11" fontFamily="monospace">PROJECT: {project.title.substring(0, 24)}</text>
            <text x="15" y="65" fill="#94A3B8" fontSize="10" fontFamily="monospace">CONTROLLER: {project.controller}</text>
            <text x="15" y="85" fill="#94A3B8" fontSize="10" fontFamily="monospace">SHEET: 1 OF 1 | REV: {project.version}.0</text>
            <text x="15" y="105" fill="#38BDF8" fontSize="10" fontFamily="monospace">STATUS: APPROVED ELECTRICAL</text>
          </g>

          {/* Microcontroller Footprint (Center) */}
          <g transform="translate(380, 220)">
            {/* PCB Body */}
            <rect width="240" height="150" rx="8" fill="#0C1B2A" stroke="#00E5FF" strokeWidth="2" filter="drop-shadow(0px 0px 8px rgba(0,229,255,0.4))" />
            <text x="120" y="28" fill="#00E5FF" fontSize="13" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{project.controller}</text>
            <text x="120" y="45" fill="#64748B" fontSize="10" fontFamily="monospace" textAnchor="middle">52mm x 28mm Footprint</text>

            {/* Microcontroller Chip Center */}
            <rect x="75" y="60" width="90" height="50" rx="4" fill="#080F18" stroke="#38BDF8" strokeWidth="1" />
            <text x="120" y="88" fill="#38BDF8" fontSize="10" fontFamily="monospace" textAnchor="middle">Xtensa Dual Core</text>

            {/* Left Header Pins */}
            {['3V3', 'GND', 'GPIO34', 'GPIO4', 'GPIO21'].map((pin, i) => (
              <g key={pin} transform={`translate(0, ${40 + i * 22})`}>
                <rect x="-8" y="0" width="8" height="10" fill="#F59E0B" />
                <text x="10" y="9" fill="#E2E8F0" fontSize="9" fontFamily="monospace">{pin}</text>
              </g>
            ))}

            {/* Right Header Pins */}
            {['VIN', 'GND', 'GPIO26', 'GPIO22', 'GPIO2'].map((pin, i) => (
              <g key={pin} transform={`translate(240, ${40 + i * 22})`}>
                <rect x="0" y="0" width="8" height="10" fill="#F59E0B" />
                <text x="-10" y="9" fill="#E2E8F0" fontSize="9" fontFamily="monospace" textAnchor="end">{pin}</text>
              </g>
            ))}
          </g>

          {/* Sensor 1 Block (Top Left) */}
          <g transform="translate(80, 80)">
            <rect width="180" height="90" rx="6" fill="#0D1A26" stroke="#38BDF8" strokeWidth="1.5" />
            <text x="90" y="25" fill="#38BDF8" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Capacitive Moisture Sensor</text>
            <text x="90" y="42" fill="#64748B" fontSize="9" fontFamily="monospace" textAnchor="middle">Analog 0.5V-3.0V Output</text>
            <line x1="180" y1="45" x2="380" y2="286" stroke="#10B981" strokeWidth="2" strokeDasharray="4 2" />
            <text x="280" y="160" fill="#10B981" fontSize="9" fontFamily="monospace">ADC Signal Net</text>
          </g>

          {/* Sensor 2 Block (Top Right) */}
          <g transform="translate(720, 80)">
            <rect width="180" height="90" rx="6" fill="#0D1A26" stroke="#F59E0B" strokeWidth="1.5" />
            <text x="90" y="25" fill="#F59E0B" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">DHT22 Temp & Humidity</text>
            <text x="90" y="42" fill="#64748B" fontSize="9" fontFamily="monospace" textAnchor="middle">Single-bus 1-Wire</text>
            <line x1="720" y1="45" x2="380" y2="308" stroke="#F59E0B" strokeWidth="2" />
            <text x="560" y="180" fill="#F59E0B" fontSize="9" fontFamily="monospace">GPIO4 Data Net</text>
          </g>

          {/* Power Conditioning & Buck Converter (Bottom Left) */}
          <g transform="translate(80, 420)">
            <rect width="200" height="100" rx="6" fill="#1A140F" stroke="#EF4444" strokeWidth="1.5" />
            <text x="100" y="25" fill="#EF4444" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">LM2596 Buck Converter</text>
            <text x="100" y="45" fill="#F59E0B" fontSize="9" fontFamily="monospace" textAnchor="middle">12V DC IN → 5.0V Regulated OUT</text>
            {/* Power trace to MCU VIN */}
            <path d="M 280 470 L 620 470 L 620 262" fill="none" stroke="#EF4444" strokeWidth="2.5" />
            <text x="440" y="460" fill="#EF4444" fontSize="9" fontFamily="monospace">+5V Regulated Power Rail</text>
          </g>

          {/* Actuator Relay & Load (Bottom Right) */}
          <g transform="translate(420, 460)">
            <rect width="200" height="100" rx="6" fill="#150F24" stroke="#A855F7" strokeWidth="1.5" />
            <text x="100" y="25" fill="#A855F7" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">5V Relay + 12V Load</text>
            <text x="100" y="45" fill="#A855F7" fontSize="9" fontFamily="monospace" textAnchor="middle">10A 250VAC / 30VDC Contact</text>
            <line x1="520" y1="460" x2="620" y2="284" stroke="#A855F7" strokeWidth="2" />
            <text x="580" y="380" fill="#A855F7" fontSize="9" fontFamily="monospace">GPIO26 Trigger</text>
          </g>
        </svg>

        {/* Blueprint Helper Overlay */}
        <div className="absolute bottom-3 left-3 bg-[#0A0F1A]/90 border border-[#202938] px-3 py-1.5 rounded-lg text-[10px] font-mono text-cyan-300">
          Click and drag to pan • Scroll to zoom
        </div>
      </div>
    </div>
  );
};
