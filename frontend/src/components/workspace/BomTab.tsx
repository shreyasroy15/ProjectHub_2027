import React from 'react';
import {
  Download,
  Printer,
  FileSpreadsheet,
  ShoppingCart,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import type { ProjectDetail } from '../../types';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const BomTab: React.FC<{ project: ProjectDetail }> = ({ project }) => {
  const { error: toastError, success: toastSuccess } = useToast();

  const subtotal = project.components.reduce((acc, c) => {
    const price = c.verifiedPrice ?? c.unitPrice;
    return acc + price * (c.quantity || 1);
  }, 0);

  const shipping = subtotal > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  const handleExportCsv = async () => {
    try {
      const blob = await api.exportBomCsv(project.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title.replace(/\s+/g, '_')}_BOM.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toastSuccess('BOM CSV downloaded.');
    } catch (err: any) {
      toastError(err.message || 'Failed to export CSV.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* BOM Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#202938] bg-[#101620]">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span>Bill of Materials (BOM)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Itemized hardware pricing and vendor sourcing breakdown</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#202938] hover:border-cyan-500/50 bg-[#161F2E] text-slate-300 hover:text-white text-xs font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#202938] hover:border-slate-500 bg-[#161F2E] text-slate-300 hover:text-white text-xs font-mono transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print BOM</span>
          </button>
        </div>
      </div>

      {/* BOM Table */}
      <div className="rounded-xl border border-[#202938] bg-[#101620] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0E131F] border-b border-[#202938] text-slate-400">
              <tr>
                <th className="py-3 px-4">Component</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4 text-center">Price Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202938]/60 text-slate-300">
              {project.components.map(c => {
                const isVerified = c.verifiedPrice !== undefined && c.verifiedPrice !== null;
                const unitPrice = c.verifiedPrice ?? c.unitPrice;
                const qty = c.quantity || 1;
                const lineTotal = unitPrice * qty;

                return (
                  <tr key={c.id} className="hover:bg-[#131A26] transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-100">
                      {c.name}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{c.category}</td>
                    <td className="py-3 px-4 text-center font-bold">{qty}</td>
                    <td className="py-3 px-4 text-right text-slate-300">${unitPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">${lineTotal.toFixed(2)}</td>
                    <td className="py-3 px-4 text-slate-300">{c.vendorName || 'Generic Supplier'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${
                        isVerified
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                          : 'bg-amber-950/60 text-amber-300 border-amber-800/50'
                      }`}>
                        {isVerified ? 'Verified' : 'Estimated'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {c.purchaseUrl ? (
                        <a
                          href={c.purchaseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>Buy</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Summary Footer */}
        <div className="p-4 bg-[#0E131F] border-t border-[#202938] flex flex-col sm:flex-row items-end sm:items-center justify-end gap-6 text-xs font-mono">
          <div className="space-y-1 text-right">
            <div className="text-slate-400">
              Hardware Subtotal: <strong className="text-slate-200">${subtotal.toFixed(2)}</strong>
            </div>
            <div className="text-slate-400">
              Estimated Shipping: <strong className="text-slate-200">${shipping.toFixed(2)}</strong>
            </div>
            <div className="text-sm font-bold text-emerald-400 pt-1 border-t border-[#202938]">
              Estimated Project Total: ${total.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
