import React, { useEffect } from 'react';
import { X, Minimize2, Download, Printer } from 'lucide-react';

interface CardMaximizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  breakdownTable?: React.ReactNode;
  actions?: React.ReactNode;
  onExportCsv?: () => void;
}

export const CardMaximizeModal: React.FC<CardMaximizeModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  breakdownTable,
  actions,
  onExportCsv
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shadow-xs">
              <Minimize2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {title}
                </h2>
                {badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            {actions}

            {onExportCsv && (
              <button
                onClick={onExportCsv}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
                title="Export Data"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
              title="Print View"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors ml-1"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Main Visual/Expanded Content */}
          <div className="bg-slate-50/60 rounded-2xl p-4 sm:p-6 border border-slate-200/60 min-h-[380px]">
            {children}
          </div>

          {/* Breakdown Table or Supplementary Details */}
          {breakdownTable && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Comprehensive Data Breakdown
              </h4>
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                {breakdownTable}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>WorkVista Real-Time Analytics Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-2xs transition-all"
          >
            Close Expanded View
          </button>
        </div>
      </div>
    </div>
  );
};
