import React, { useState, useEffect } from 'react';
import { X, Mail, Send, CheckCircle2, AlertCircle, Server, Key, ShieldCheck, RefreshCw, Info, HelpCircle } from 'lucide-react';
import { fetchEmailConfig, updateEmailConfig, sendTestVerificationEmail, EmailConfigData } from '../services/api';

interface EmailDeliveryConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipientEmail?: string;
  onConfigSaved?: () => void;
}

export const EmailDeliveryConfigModal: React.FC<EmailDeliveryConfigModalProps> = ({
  isOpen,
  onClose,
  defaultRecipientEmail = '',
  onConfigSaved,
}) => {
  const [activeTab, setActiveTab] = useState<'GMAIL' | 'CUSTOM_SMTP' | 'RESEND'>('GMAIL');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [currentConfig, setCurrentConfig] = useState<EmailConfigData | null>(null);
  const [gmailUser, setGmailUser] = useState('');
  const [gmailPass, setGmailPass] = useState('');

  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');
  const [smtpSecure, setSmtpSecure] = useState(false);

  const [resendApiKey, setResendApiKey] = useState('');
  const [resendFrom, setResendFrom] = useState('');

  const [testRecipient, setTestRecipient] = useState(defaultRecipientEmail || 'madarasrini@gmail.com');

  useEffect(() => {
    if (defaultRecipientEmail) {
      setTestRecipient(defaultRecipientEmail);
    }
  }, [defaultRecipientEmail]);

  const loadConfig = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetchEmailConfig();
      if (res.success && res.config) {
        setCurrentConfig(res.config);
        if (res.config.smtpHost.includes('gmail')) {
          setActiveTab('GMAIL');
          setGmailUser(res.config.smtpUser);
        } else if (res.config.provider === 'RESEND') {
          setActiveTab('RESEND');
          setResendFrom(res.config.smtpFrom);
        } else if (res.config.smtpHost) {
          setActiveTab('CUSTOM_SMTP');
          setSmtpHost(res.config.smtpHost);
          setSmtpPort(res.config.smtpPort);
          setSmtpUser(res.config.smtpUser);
          setSmtpFrom(res.config.smtpFrom);
          setSmtpSecure(res.config.smtpSecure);
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
      loadConfig();
    }
  }, [isOpen]);

  const handleSaveGmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailUser || !gmailPass) {
      setStatusMessage({ type: 'error', text: 'Please enter both your Gmail address and 16-character Google App Password.' });
      return;
    }

    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await updateEmailConfig({
        smtpHost: 'smtp.gmail.com',
        smtpPort: 465,
        smtpUser: gmailUser.trim(),
        smtpPass: gmailPass.replace(/\s+/g, ''),
        smtpSecure: true,
        smtpFrom: `SRM IST Admissions <${gmailUser.trim()}>`,
        resendApiKey: '',
      });

      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Gmail SMTP credentials saved! You can now send a test email below.' });
        loadConfig();
        if (onConfigSaved) onConfigSaved();
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to save settings.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error updating configuration' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCustomSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpHost || !smtpUser) {
      setStatusMessage({ type: 'error', text: 'Host and Username are required.' });
      return;
    }

    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await updateEmailConfig({
        smtpHost: smtpHost.trim(),
        smtpPort: Number(smtpPort) || 587,
        smtpUser: smtpUser.trim(),
        ...(smtpPass && { smtpPass: smtpPass.trim() }),
        smtpFrom: smtpFrom.trim() || `SRM IST Admissions <${smtpUser.trim()}>`,
        smtpSecure,
        resendApiKey: '',
      });

      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Custom SMTP settings saved! You can now send a test verification email.' });
        loadConfig();
        if (onConfigSaved) onConfigSaved();
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to save SMTP settings.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error updating SMTP settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendApiKey) {
      setStatusMessage({ type: 'error', text: 'Resend API Key is required.' });
      return;
    }

    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await updateEmailConfig({
        resendApiKey: resendApiKey.trim(),
        smtpFrom: resendFrom.trim() || 'onboarding@resend.dev',
      });

      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Resend configuration saved successfully!' });
        loadConfig();
        if (onConfigSaved) onConfigSaved();
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to save Resend config.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error updating Resend config' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testRecipient || !testRecipient.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid recipient email address for testing.' });
      return;
    }

    setTesting(true);
    setStatusMessage(null);
    try {
      const res = await sendTestVerificationEmail(testRecipient.trim());
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `Success! Verification email delivered to ${testRecipient.trim()}! Please check your Inbox and Spam folders.`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.message || 'Email delivery failed. Please check your credentials and port configuration.',
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Network error sending test email.' });
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-300">
        {/* Header */}
        <div className="bg-[#002147] text-white px-6 py-4 flex items-center justify-between border-b border-[#c5a059]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-md">
              <Mail className="w-5 h-5 text-[#c5a059]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base tracking-wide">
                Email Inbox Delivery Settings (SMTP / Gmail)
              </h3>
              <p className="text-xs text-slate-300">
                Configure live email delivery so activation links land directly in user inboxes
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Status Indicator Banner */}
          <div
            className={`p-4 rounded-lg border flex items-start gap-3 ${
              currentConfig?.configured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {currentConfig?.configured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed">
              <p className="font-bold text-sm">
                Current Delivery Mode:{' '}
                <span className="uppercase tracking-wider">
                  {currentConfig?.provider === 'SIMULATED_LOCAL'
                    ? 'Campus Outbox (Local Fallback)'
                    : `Live Network (${currentConfig?.provider})`}
                </span>
              </p>
              {currentConfig?.configured ? (
                <p className="mt-1">
                  Live email delivery is ACTIVE. Transactional activation links are automatically sent to recipient inboxes via{' '}
                  <span className="font-mono font-medium">{currentConfig.smtpHost || 'External Mailer'}</span>.
                </p>
              ) : (
                <p className="mt-1">
                  Live SMTP is not connected yet. Emails are currently recorded in the in-app Campus Outbox. Connect your Gmail or SMTP below to send emails directly to user inboxes (like Gmail).
                </p>
              )}
            </div>
          </div>

          {/* Feedback alerts */}
          {statusMessage && (
            <div
              className={`p-3 rounded-md text-xs flex items-start gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Provider Selection Tabs */}
          <div className="border-b border-slate-200 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('GMAIL');
                setStatusMessage(null);
              }}
              className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'GMAIL'
                  ? 'border-[#002147] text-[#002147]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Gmail (Recommended & Fastest)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('CUSTOM_SMTP');
                setStatusMessage(null);
              }}
              className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'CUSTOM_SMTP'
                  ? 'border-[#002147] text-[#002147]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Custom Institutional SMTP
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('RESEND');
                setStatusMessage(null);
              }}
              className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'RESEND'
                  ? 'border-[#002147] text-[#002147]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Resend API
            </button>
          </div>

          {/* TAB 1: GMAIL CONFIGURATION */}
          {activeTab === 'GMAIL' && (
            <form onSubmit={handleSaveGmail} className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  How to send real emails via your Gmail account:
                </p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>
                    Go to your Google Account:{' '}
                    <span className="font-mono text-slate-800">myaccount.google.com/apppasswords</span>
                  </li>
                  <li>Ensure 2-Step Verification is turned ON.</li>
                  <li>Create a new App Password (name it e.g. "SRM Hackathon Portal").</li>
                  <li>Copy the 16-character generated password and paste it below.</li>
                </ol>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Gmail Address
                </label>
                <input
                  type="email"
                  value={gmailUser}
                  onChange={(e) => setGmailUser(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>16-Character Google App Password</span>
                  {currentConfig?.hasPassword && (
                    <span className="text-[11px] text-emerald-700 font-normal">
                      ✓ A password is currently configured
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  value={gmailPass}
                  onChange={(e) => setGmailPass(e.target.value)}
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 px-4 bg-[#002147] hover:bg-[#001733] text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
                )}
                Save & Enable Gmail Delivery
              </button>
            </form>
          )}

          {/* TAB 2: CUSTOM SMTP */}
          {activeTab === 'CUSTOM_SMTP' && (
            <form onSubmit={handleSaveCustomSmtp} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SMTP Host</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="e.g. smtp.office365.com, smtp.sendgrid.net"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Port</label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username / Email</label>
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="username or apikey"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="SMTP Password"
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">From Header</label>
                <input
                  type="text"
                  value={smtpFrom}
                  onChange={(e) => setSmtpFrom(e.target.value)}
                  placeholder='SRM IST Admissions <admissions@ist.srmtrichy.edu.in>'
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="smtpSecure"
                  checked={smtpSecure}
                  onChange={(e) => setSmtpSecure(e.target.checked)}
                  className="rounded text-[#002147] focus:ring-[#002147]"
                />
                <label htmlFor="smtpSecure" className="text-xs text-slate-700">
                  Use SSL (port 465) instead of STARTTLS (port 587)
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 px-4 bg-[#002147] hover:bg-[#001733] text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Server className="w-4 h-4 text-[#c5a059]" />
                )}
                Save Custom SMTP Settings
              </button>
            </form>
          )}

          {/* TAB 3: RESEND */}
          {activeTab === 'RESEND' && (
            <form onSubmit={handleSaveResend} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Resend API Key</span>
                  {currentConfig?.hasResendKey && (
                    <span className="text-[11px] text-emerald-700">✓ Resend key configured</span>
                  )}
                </label>
                <input
                  type="password"
                  value={resendApiKey}
                  onChange={(e) => setResendApiKey(e.target.value)}
                  placeholder="re_xxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">From Email Address</label>
                <input
                  type="text"
                  value={resendFrom}
                  onChange={(e) => setResendFrom(e.target.value)}
                  placeholder="onboarding@resend.dev or verified domain"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 px-4 bg-[#002147] hover:bg-[#001733] text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Key className="w-4 h-4 text-[#c5a059]" />
                )}
                Save Resend Configuration
              </button>
            </form>
          )}

          {/* LIVE TEST SEND SECTION */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#002147]" />
              Test Live Inbox Delivery
            </h4>
            <p className="text-xs text-slate-600 mb-3">
              Send a real verification email to your email address to confirm delivery to your inbox:
            </p>

            <div className="flex gap-2">
              <input
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="Enter recipient email (e.g. madarasrini@gmail.com)"
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#002147] focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleSendTest}
                disabled={testing}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-md shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
              >
                {testing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Send Test Email
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>SRM IST Tiruchirappalli · Institutional Mail Services</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
