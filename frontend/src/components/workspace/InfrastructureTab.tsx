import React from 'react';
import {
  Server,
  Database,
  Radio,
  Cpu,
  ShieldCheck,
  Activity,
  HardDrive,
  Lock,
  Layers
} from 'lucide-react';
import type { ProjectDetail } from '../../types';

export const InfrastructureTab: React.FC<{ project: ProjectDetail }> = ({ project }) => {
  const infra = project.infrastructure || {
    hardware: "ESP32 DevKit V1, 12V 2A DC PSU, LM2596 buck converter, 5V optocoupled relay.",
    network: "802.11 b/g/n 2.4 GHz Wi-Fi, MQTT QoS 1 telemetry streaming.",
    cloud: "Containerized Docker service deployed on Linux VPS / AWS ECS with TLS reverse proxy.",
    backend: "ASP.NET Core 10 Web API, BackgroundService for MQTT ingestion, Serilog structured logging.",
    database: "PostgreSQL 15+ relational database with hypertable indexes on device_id and timestamp.",
    security: "TLS 1.3 encrypted transport, JWT Bearer authentication, isolated relay contacts.",
    monitoring: "Health check endpoints (/health), Prometheus metric exporter, Grafana dashboards.",
    backups: "Daily automated pg_dump database snapshots stored in S3 object storage."
  };

  const layers = [
    { name: "Hardware Infrastructure", content: infra.hardware, icon: Cpu, color: "text-cyan-400" },
    { name: "Network Infrastructure", content: infra.network, icon: Radio, color: "text-sky-400" },
    { name: "Cloud / Server Deployment", content: infra.cloud, icon: Server, color: "text-blue-400" },
    { name: "Backend Architecture", content: infra.backend, icon: Layers, color: "text-indigo-400" },
    { name: "Database & Storage", content: infra.database, icon: Database, color: "text-amber-400" },
    { name: "Security & Access Control", content: infra.security, icon: ShieldCheck, color: "text-emerald-400" },
    { name: "Telemetry & Health Monitoring", content: infra.monitoring, icon: Activity, color: "text-purple-400" },
    { name: "Disaster Recovery & Backups", content: infra.backups, icon: HardDrive, color: "text-teal-400" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="p-4 rounded-xl border border-[#202938] bg-[#101620]">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Multi-Layer Infrastructure Specification</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Detailed operational tiers supporting edge computing, secure transport, database persistence, and observability
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {layers.map((layer, idx) => {
          const Icon = layer.icon;

          return (
            <div
              key={idx}
              className="p-5 rounded-xl border border-[#202938] bg-[#101620] hover:border-slate-600 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <Icon className={`w-4 h-4 ${layer.color}`} />
                  <h4 className="text-sm font-bold text-slate-100">{layer.name}</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {layer.content}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-[#202938]/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Tier {idx + 1}</span>
                <span className="text-emerald-400">Production Ready</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
