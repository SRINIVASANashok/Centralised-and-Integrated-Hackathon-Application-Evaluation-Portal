import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, XCircle, Play, AlertTriangle, RefreshCw } from 'lucide-react';
import { runSecuritySuite } from '../services/api';

interface SecurityTestPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityTestPanel: React.FC<SecurityTestPanelProps> = ({ isOpen, onClose }) => {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const executeSuite = async () => {
    setRunning(true);
    try {
      const res = await runSecuritySuite();
      setResult(res);
    } catch (e: any) {
      setResult({ success: false, error: e.message });
    } finally {
      setRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-300">
        {/* Header */}
        <div className="bg-[#002147] text-white px-6 py-4 flex items-center justify-between border-b border-[#c5a059]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base tracking-wide">
                Role-Based Authorization & Security Test Suite
              </h3>
              <p className="text-xs text-slate-300">
                Institutional Security Compliance & Verification Suite (Item 23 Requirements)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
            <p className="font-semibold text-slate-900">Official Institutional Security Test Protocol:</p>
            <p>
              This suite executes live backend requests against server authorization guards, database uniqueness constraints, single-use activation cryptographic mechanisms, and role boundaries.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Target: SRM IST Authentication Gateway
            </span>
            <button
              onClick={executeSuite}
              disabled={running}
              className="px-4 py-2 bg-[#002147] hover:bg-blue-950 text-white rounded-md text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {running ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Verification Checks...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-[#c5a059]" />
                  <span>Execute Full Security Verification Suite</span>
                </>
              )}
            </button>
          </div>

          {/* Test results table */}
          {result && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-200">
                <span className="font-semibold text-slate-800">
                  Audit Summary: {result.summary}
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                {result.tests?.map((t: any, idx: number) => (
                  <div key={idx} className="p-3.5 flex items-start gap-3 bg-white hover:bg-slate-50">
                    {t.status === 'PASSED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">{t.test}</strong>
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            t.status === 'PASSED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs mt-1">{t.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!result && !running && (
            <div className="py-8 text-center text-slate-400 text-xs">
              Click &quot;Execute Full Security Verification Suite&quot; to test all server-side authorization boundaries, duplicate record checks, and cryptographic token expiration rules.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs rounded-md cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
