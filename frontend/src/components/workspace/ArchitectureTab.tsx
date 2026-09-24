import React, { useMemo } from 'react';
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
  Server,
  Database,
  Radio,
  Cpu,
  Activity,
  Globe,
  Monitor,
  ShieldCheck
} from 'lucide-react';
import type { ProjectDetail } from '../../types';

// Custom Architecture Node
const ArchCustomNode: React.FC<{ data: any }> = ({ data }) => {
  const Icon = {
    Sensor: Activity,
    Device: Cpu,
    Actuator: ZapIcon,
    Gateway: Radio,
    Cloud: Globe,
    Backend: Server,
    Database: Database,
    Frontend: Monitor
  }[data.type as string] || Server;

  const colorStyles = {
    Sensor: 'border-emerald-500/80 bg-[#0B1A14] text-emerald-300',
    Device: 'border-cyan-500/80 bg-[#0B1824] text-cyan-300',
    Actuator: 'border-purple-500/80 bg-[#160E26] text-purple-300',
    Gateway: 'border-sky-500/80 bg-[#0B1522] text-sky-300',
    Cloud: 'border-blue-500/80 bg-[#0E1528] text-blue-300',
    Backend: 'border-indigo-500/80 bg-[#12122A] text-indigo-300',
    Database: 'border-amber-500/80 bg-[#1C160B] text-amber-300',
    Frontend: 'border-teal-500/80 bg-[#0A1A1A] text-teal-300'
  }[data.type as string] || 'border-slate-700 bg-[#101620] text-slate-200';

  return (
    <div className={`p-4 rounded-xl border-2 shadow-2xl backdrop-blur-md min-w-[210px] ${colorStyles}`}>
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-slate-900" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-slate-900" />

      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-4 h-4 shrink-0" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider">{data.label}</span>
      </div>
      <p className="text-[11px] text-slate-300/80 leading-snug">{data.description}</p>
      <div className="mt-2 text-[9px] font-mono text-slate-400 uppercase tracking-widest bg-black/40 px-1.5 py-0.5 rounded w-max">
        {data.layer} Layer
      </div>
    </div>
  );
};

const ZapIcon = (props: any) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const nodeTypes = {
  archNode: ArchCustomNode
};

export const ArchitectureTab: React.FC<{ project: ProjectDetail }> = ({ project }) => {
  const initialNodes: Node[] = useMemo(() => {
    if (project.architecture?.nodes?.length > 0) {
      return project.architecture.nodes.map(n => ({
        id: n.id,
        type: 'archNode',
        position: { x: n.x, y: n.y },
        data: {
          label: n.label,
          type: n.type,
          layer: n.layer,
          description: n.description
        }
      }));
    }

    // Default Fallback Nodes if empty
    return [
      { id: 'sensors', type: 'archNode', position: { x: 50, y: 120 }, data: { label: 'Sensor Cluster', type: 'Sensor', layer: 'Edge', description: 'ADC / 1-Wire Telemetry' } },
      { id: 'mcu', type: 'archNode', position: { x: 300, y: 120 }, data: { label: project.controller, type: 'Device', layer: 'Edge', description: 'Real-time Edge Controller' } },
      { id: 'gateway', type: 'archNode', position: { x: 550, y: 120 }, data: { label: 'Wi-Fi AP / Gateway', type: 'Gateway', layer: 'Transport', description: '2.4GHz WPA2 Uplink' } },
      { id: 'mqtt', type: 'archNode', position: { x: 800, y: 120 }, data: { label: 'MQTT Broker', type: 'Cloud', layer: 'Cloud', description: 'EMQX / Mosquitto Cluster' } },
      { id: 'backend', type: 'archNode', position: { x: 800, y: 280 }, data: { label: 'ASP.NET Core API', type: 'Backend', layer: 'Cloud', description: 'Business Logic & Ingestion' } },
      { id: 'database', type: 'archNode', position: { x: 1050, y: 280 }, data: { label: 'PostgreSQL DB', type: 'Database', layer: 'Cloud', description: 'Persistent Time-Series' } },
      { id: 'dashboard', type: 'archNode', position: { x: 550, y: 280 }, data: { label: 'React Dashboard', type: 'Frontend', layer: 'Client', description: 'Telemetry Visualization' } }
    ];
  }, [project]);

  const initialEdges: Edge[] = useMemo(() => {
    if (project.architecture?.connections?.length > 0) {
      return project.architecture.connections.map((c, idx) => ({
        id: `e-arch-${idx}`,
        source: c.from,
        target: c.to,
        label: c.protocol,
        animated: true,
        style: { stroke: '#00E5FF', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#00E5FF' }
      }));
    }

    return [
      { id: 'e1', source: 'sensors', target: 'mcu', label: 'ADC / 1-Wire', animated: true, style: { stroke: '#10B981', strokeWidth: 2 } },
      { id: 'e2', source: 'mcu', target: 'gateway', label: '802.11 b/g/n', animated: true, style: { stroke: '#00E5FF', strokeWidth: 2 } },
      { id: 'e3', source: 'gateway', target: 'mqtt', label: 'MQTT TLS (8883)', animated: true, style: { stroke: '#38BDF8', strokeWidth: 2 } },
      { id: 'e4', source: 'mqtt', target: 'backend', label: 'Subscribe', animated: true, style: { stroke: '#818CF8', strokeWidth: 2 } },
      { id: 'e5', source: 'backend', target: 'database', label: 'Npgsql TCP (5432)', animated: true, style: { stroke: '#F59E0B', strokeWidth: 2 } },
      { id: 'e6', source: 'dashboard', target: 'backend', label: 'REST + WebSockets', animated: true, style: { stroke: '#2DD4BF', strokeWidth: 2 } }
    ];
  }, [project]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="p-4 rounded-xl border border-[#202938] bg-[#101620] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>End-to-End System Architecture Topology</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Distributed data flow from Edge Sensors through Cloud Ingestion, Database, and Web Presentation
          </p>
        </div>
      </div>

      <div className="h-[500px] rounded-xl border border-[#202938] bg-[#070B12] overflow-hidden shadow-2xl relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background color="#202938" gap={28} size={1} />
          <Controls className="!bg-[#101620] !border-[#202938] !text-slate-200 fill-slate-200" />
          <MiniMap
            nodeColor="#00E5FF"
            maskColor="rgba(8, 11, 18, 0.7)"
            className="!bg-[#0A0F1A] !border-[#202938]"
          />
        </ReactFlow>
      </div>
    </div>
  );
};
