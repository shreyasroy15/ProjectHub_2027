import React from 'react';
import { Cpu, AlertTriangle, ShieldCheck, Zap, Info } from 'lucide-react';
import type { ProjectDetail } from '../../types';

export const PinMappingTab: React.FC<{ project: ProjectDetail }> = ({ project }) => {
  // Aggregate all pins associated with the primary microcontroller
  const mcuName = project.controller || 'ESP32';
  
  const pinRows = project.connections.map(c => {
    let pin = '';
    let connectedComponent = '';
    let peripheralPin = '';

    if (c.fromComponent.toLowerCase().includes('esp') || c.fromComponent.toLowerCase().includes('arduino') || c.fromComponent.toLowerCase().includes('stm32')) {
      pin = c.fromPin;
      connectedComponent = c.toComponent;
      peripheralPin = c.toPin;
    } else {
      pin = c.toPin;
      connectedComponent = c.fromComponent;
      peripheralPin = c.fromPin;
    }

    const is5VWarning = c.voltage.includes('5V') && !c.signal.includes('VCC') && !c.signal.includes('GND');

    return {
      id: c.id,
      pin,
      component: connectedComponent,
      peripheralPin,
      signal: c.signal,
      voltage: c.voltage,
      purpose: c.description,
      hasWarning: is5VWarning,
      warningText: is5VWarning ? '5V into 3.3V GPIO requires logic level shifter or resistor divider' : null
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="p-4 rounded-xl border border-[#202938] bg-[#101620] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Dedicated Pin Mapping & Voltage Compatibility</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Microcontroller pinout assignment for <strong className="text-cyan-400">{project.controller}</strong>
          </p>
        </div>
        <div className="px-3 py-1 rounded bg-[#0E131F] border border-[#202938] text-xs font-mono text-slate-300">
          Total Assigned Pins: <strong className="text-cyan-400">{pinRows.length}</strong>
        </div>
      </div>

      <div className="rounded-xl border border-[#202938] bg-[#101620] overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#0E131F] border-b border-[#202938] text-slate-400">
            <tr>
              <th className="py-3 px-4">MCU Pin</th>
              <th className="py-3 px-4">Interfaced Peripheral</th>
              <th className="py-3 px-4">Peripheral Pin</th>
              <th className="py-3 px-4">Signal Type</th>
              <th className="py-3 px-4">Voltage Level</th>
              <th className="py-3 px-4">Electrical Function & Safety</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202938]/60 text-slate-300">
            {pinRows.map((r, i) => (
              <tr key={i} className="hover:bg-[#131A26] transition-colors">
                <td className="py-3 px-4 font-bold text-cyan-400">{r.pin}</td>
                <td className="py-3 px-4 font-semibold text-slate-100">{r.component}</td>
                <td className="py-3 px-4 text-slate-300">{r.peripheralPin}</td>
                <td className="py-3 px-4 text-amber-300">{r.signal}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    r.voltage.includes('3.3V')
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : r.voltage.includes('5V')
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {r.voltage}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="space-y-1">
                    <span className="text-slate-300">{r.purpose}</span>
                    {r.hasWarning && (
                      <div className="text-[11px] text-amber-400 flex items-center gap-1 font-sans">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{r.warningText}</span>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
