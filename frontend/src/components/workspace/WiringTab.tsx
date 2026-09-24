import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  Handle,
  Position,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Cpu,
  Activity,
  Layers,
  RotateCcw,
  ZoomIn,
  Eye,
  Info,
  ShieldCheck,
  Zap
} from 'lucide-react';
import type { ProjectDetail, Connection } from '../../types';

// Custom Component Node Component for React Flow
const HardwareNode: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className={`p-4 rounded-xl border-2 shadow-2xl backdrop-blur-md min-w-[200px] ${
      data.isMcu
        ? 'border-cyan-500/80 bg-[#0E1B2A] text-slate-100 tech-glow-cyan'
        : 'border-slate-700 bg-[#101620] text-slate-200'
    }`}>
      {/* Target and Source Handles */}
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-slate-900" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-slate-900" />

      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#202938]">
        <div className="flex items-center gap-1.5 font-bold text-xs font-mono text-cyan-300">
          <Cpu className="w-3.5 h-3.5" />
          <span className="truncate max-w-[140px]">{data.label}</span>
        </div>
        <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
          {data.category}
        </span>
      </div>

      {data.pins && data.pins.length > 0 && (
        <div className="space-y-1 font-mono text-[10px] text-slate-300">
          {data.pins.slice(0, 5).map((p: any, i: number) => (
            <div key={i} className="flex justify-between items-center bg-[#090D16] px-1.5 py-0.5 rounded">
              <span className="text-slate-400">{p.pin}</span>
              <span className="text-cyan-400 font-semibold">{p.function || p.signal}</span>
            </div>
          ))}
          {data.pins.length > 5 && (
            <div className="text-[9px] text-slate-500 text-center pt-0.5">+{data.pins.length - 5} more pins</div>
          )}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  hardware: HardwareNode
};

export const WiringTab: React.FC<{ project: ProjectDetail }> = ({ project }) => {
  const [highlightedConnectionId, setHighlightedConnectionId] = useState<string | null>(null);

  // Derive Nodes
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];
    const components = project.components;
    
    // Find MCU
    const mcu = components.find(c => c.category === 'Microcontrollers') || components[0];
    
    if (mcu) {
      nodes.push({
        id: mcu.name,
        type: 'hardware',
        position: { x: 380, y: 140 },
        data: {
          label: mcu.name,
          category: 'MCU',
          isMcu: true,
          pins: [
            { pin: 'GPIO21', signal: 'I2C SDA' },
            { pin: 'GPIO22', signal: 'I2C SCL' },
            { pin: 'GPIO34', signal: 'ADC1 (Analog)' },
            { pin: 'GPIO26', signal: 'Relay OUT' },
            { pin: '3V3', signal: '3.3V Power' },
            { pin: 'GND', signal: 'Ground' }
          ]
        }
      });
    }

    // Place remaining peripherals around MCU
    const peripherals = components.filter(c => c.name !== mcu?.name);
    peripherals.forEach((comp, idx) => {
      // Circle or grid layout
      const angle = (idx / (peripherals.length || 1)) * 2 * Math.PI;
      const radius = 320;
      const x = 380 + radius * Math.cos(angle);
      const y = 160 + radius * Math.sin(angle);

      nodes.push({
        id: comp.name,
        type: 'hardware',
        position: { x: Math.max(20, x), y: Math.max(20, y) },
        data: {
          label: comp.name,
          category: comp.category,
          isMcu: false,
          pins: [
            { pin: 'VCC', signal: 'Power' },
            { pin: 'GND', signal: 'Ground' },
            { pin: 'SIG', signal: 'Signal' }
          ]
        }
      });
    });

    return nodes;
  }, [project]);

  // Derive Edges
  const initialEdges: Edge[] = useMemo(() => {
    return project.connections.map((c, i) => {
      const isHighlighted = highlightedConnectionId === c.id;

      return {
        id: c.id || `e-${i}`,
        source: c.fromComponent,
        target: c.toComponent,
        label: `${c.fromPin} → ${c.toPin} (${c.signal})`,
        animated: isHighlighted,
        style: {
          stroke: isHighlighted ? '#00E5FF' : (c.wireColor || '#38BDF8'),
          strokeWidth: isHighlighted ? 3.5 : 2
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isHighlighted ? '#00E5FF' : (c.wireColor || '#38BDF8')
        }
      };
    });
  }, [project, highlightedConnectionId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleConnectionClick = useCallback((connectionId: string) => {
    setHighlightedConnectionId(prev => (prev === connectionId ? null : connectionId));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Wiring Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#202938] bg-[#101620]">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Interactive Pin-to-Pin Wiring Diagram</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click connections in the table below to trace and highlight the visual wire. Drag components to customize layout.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> 5V / VCC</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-600" /> GND</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Signal</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> I2C/SPI</span>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="h-[460px] rounded-xl border border-[#202938] bg-[#070B12] overflow-hidden shadow-2xl relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          minZoom={0.2}
          maxZoom={2}
        >
          <Background color="#202938" gap={24} size={1} />
          <Controls className="!bg-[#101620] !border-[#202938] !text-slate-200 fill-slate-200" />
          <MiniMap
            nodeColor="#38BDF8"
            maskColor="rgba(8, 11, 18, 0.7)"
            className="!bg-[#0A0F1A] !border-[#202938]"
          />
        </ReactFlow>
      </div>

      {/* Synchronized Wiring Netlist Table */}
      <div className="rounded-xl border border-[#202938] bg-[#101620] overflow-hidden shadow-xl">
        <div className="p-3.5 bg-[#0E131F] border-b border-[#202938] flex items-center justify-between">
          <span className="text-xs font-bold font-mono text-slate-200">
            NETLIST CONNECTIONS ({project.connections.length} NETS)
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Click any row to illuminate trace on diagram
          </span>
        </div>

        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left text-xs font-mono">
            <thead className="sticky top-0 bg-[#0A0F1A] border-b border-[#202938] text-slate-400">
              <tr>
                <th className="py-2.5 px-4">From Component</th>
                <th className="py-2.5 px-4">Pin</th>
                <th className="py-2.5 px-4">To Component</th>
                <th className="py-2.5 px-4">Pin</th>
                <th className="py-2.5 px-4">Signal</th>
                <th className="py-2.5 px-4">Voltage</th>
                <th className="py-2.5 px-4">Wire Color</th>
                <th className="py-2.5 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202938]/60 text-slate-300">
              {project.connections.map(c => {
                const isSelected = highlightedConnectionId === c.id;

                return (
                  <tr
                    key={c.id}
                    onClick={() => handleConnectionClick(c.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/60 text-cyan-200 font-bold'
                        : 'hover:bg-[#131A26]'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-semibold text-slate-100">{c.fromComponent}</td>
                    <td className="py-2.5 px-4 text-cyan-400">{c.fromPin}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-100">{c.toComponent}</td>
                    <td className="py-2.5 px-4 text-cyan-400">{c.toPin}</td>
                    <td className="py-2.5 px-4 text-amber-300">{c.signal}</td>
                    <td className="py-2.5 px-4">{c.voltage}</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full border border-slate-700"
                          style={{ backgroundColor: c.wireColor }}
                        />
                        <span className="text-[10px] text-slate-400">{c.wireColor}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 truncate max-w-xs">{c.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
