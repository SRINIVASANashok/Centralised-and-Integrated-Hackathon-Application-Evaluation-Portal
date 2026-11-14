import React, { useState, useEffect } from 'react';
import { X, Mail, ExternalLink, RefreshCw, Clock, CheckCircle2, AlertTriangle, Copy, Check, Send } from 'lucide-react';
import { SentEmailRecord } from '../types/auth';
import { fetchRecentEmails } from '../services/api';

interface EmailInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToActivation?: (token: string) => void;
  onNavigateToReset?: (token: string) => void;
  onOpenEmailConfig?: () => void;
}

export const EmailInboxModal: React.FC<EmailInboxModalProps> = ({
  isOpen,
  onClose,
  onNavigateToActivation,
  onNavigateToReset,
  onOpenEmailConfig,
}) => {
  const [emails, setEmails] = useState<SentEmailRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<SentEmailRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadEmails = async () => {
    setLoading(true);
    try {
      const res = await fetchRecentEmails();
      if (res.success) {
        setEmails(res.emails);
        if (res.emails.length > 0 && !selectedEmail) {
          setSelectedEmail(res.emails[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEmails();
    }
  }, [isOpen]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';

    // Direct password reset navigation without external redirects
    if (href.includes('reset=') || selectedEmail?.reset_token) {
      e.preventDefault();
      const tokenMatch = href.match(/[?&#](?:reset|resetToken|token)=([^&#\s]+)/i);
      const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : selectedEmail?.reset_token;
      if (token) {
        onClose();
        onNavigateToReset?.(token);
        return;
      }
    }

    // Direct account activation navigation without external redirects
    if (href.includes('activate=') || selectedEmail?.activation_token) {
      e.preventDefault();
      const tokenMatch = href.match(/[?&#](?:activate|activation_token|token)=([^&#\s]+)/i);
      const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : selectedEmail?.activation_token;
      if (token) {
        onClose();
        onNavigateToActivation?.(token);
        return;
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-300">
        {/* Modal Header */}
        <div className="bg-[#002147] text-white px-6 py-4 flex items-center justify-between border-b border-[#c5a059]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-md">
              <Mail className="w-5 h-5 text-[#c5a059]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base tracking-wide">
                Campus Transactional Email Dispatcher & Outbox
              </h3>
              <p className="text-xs text-slate-300">
                Institutional Outbox · View Account Activation & Password Reset Dispatches
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadEmails}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Refresh Mail Outbox"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Two-pane mail viewer */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden min-h-[500px]">
          {/* Left Pane: Email List */}
          <div className="border-r border-slate-200 overflow-y-auto bg-slate-50 p-3 space-y-2">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
              Dispatched Emails ({emails.length})
            </div>

            {emails.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No emails dispatched yet. Register a new student or request password reset to generate an institutional email.
              </div>
            ) : (
              emails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                return (
                  <button
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`w-full text-left p-3 rounded-lg border transition-all text-xs cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#002147] shadow-xs'
                        : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900 truncate">
                        {email.recipient_name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(email.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate mb-1">
                      {email.to}
                    </div>
                    <div className="text-[11px] font-medium text-[#002147] truncate">
                      {email.subject}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium border border-blue-100">
                        {email.type}
                      </span>
                      {email.activation_token && (
                        <span className="text-emerald-600 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          24h Token
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Pane: Selected Email View */}
          <div className="md:col-span-2 overflow-y-auto p-6 bg-white flex flex-col">
            {selectedEmail ? (
              <div className="space-y-4">
                {/* Meta details header */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500">To:</span>{' '}
                      <strong className="text-slate-900">{selectedEmail.recipient_name}</strong> &lt;{selectedEmail.to}&gt;
                    </div>
                    <div>
                      <span className="text-slate-500">Date:</span>{' '}
                      <span className="text-slate-800">{new Date(selectedEmail.created_at).toLocaleString()}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500">Subject:</span>{' '}
                      <strong className="text-[#002147]">{selectedEmail.subject}</strong>
                    </div>
                  </div>

                  {/* Quick Action Button for Tester */}
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-3">
                    {selectedEmail.activation_token && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToActivation?.(selectedEmail.activation_token!);
                        }}
                        className="px-4 py-2 bg-[#002147] text-white rounded-md text-xs font-semibold hover:bg-blue-900 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span>Open Activation Page Directly</span>
                      </button>
                    )}

                    {selectedEmail.reset_token && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToReset?.(selectedEmail.reset_token!);
                        }}
                        className="px-4 py-2 bg-[#002147] text-white rounded-md text-xs font-semibold hover:bg-blue-900 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span>Open Password Reset Page</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(selectedEmail.action_link || '', selectedEmail.id)}
                      className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-xs font-medium flex items-center gap-1.5 border border-slate-300 transition-colors cursor-pointer"
                    >
                      {copiedId === selectedEmail.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied Link</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Raw Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Rendered HTML Email Content */}
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Transactional Email Preview
                  </div>
                  <div
                    onClick={handlePreviewClick}
                    dangerouslySetInnerHTML={{ __html: selectedEmail.html_preview }}
                    className="overflow-x-auto cursor-pointer"
                  />
                </div>

                {/* Plain Text Fallback View */}
                <details className="text-xs text-slate-600">
                  <summary className="cursor-pointer font-medium text-slate-700 hover:text-slate-900">
                    View Plain-Text Body Fallback
                  </summary>
                  <pre className="mt-2 p-3 bg-slate-100 rounded border border-slate-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed text-slate-800">
                    {selectedEmail.text_body}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                Select an email from the left pane to view details.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Activation links expire in 24 hours · Password reset links expire in 30 minutes</span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenEmailConfig && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEmailConfig();
                }}
                className="px-3 py-1.5 bg-[#002147] hover:bg-[#001733] text-white font-medium rounded-md cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Send className="w-3 h-3 text-[#c5a059]" />
                <span>Configure Live Inbox Delivery (SMTP)</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-md cursor-pointer transition-colors"
            >
              Close Outbox
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
