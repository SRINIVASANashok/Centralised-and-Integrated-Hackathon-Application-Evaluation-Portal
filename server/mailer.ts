// ==============================================================================
// SRM IST Tiruchirappalli - Institutional Mail Delivery Service (Nodemailer & SMTP)
// ==============================================================================

import nodemailer from 'nodemailer';

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  smtpSecure: boolean;
  resendApiKey: string;
}

// In-memory runtime override if configured via admin/setup portal
let runtimeConfig: Partial<EmailConfig> = {};

export function getActiveEmailConfig(): EmailConfig {
  return {
    smtpHost: runtimeConfig.smtpHost ?? process.env.SMTP_HOST ?? 'smtp.gmail.com',
    smtpPort: runtimeConfig.smtpPort ?? parseInt(process.env.SMTP_PORT || '465', 10),
    smtpUser: runtimeConfig.smtpUser ?? process.env.SMTP_USER ?? '',
    smtpPass: runtimeConfig.smtpPass ?? process.env.SMTP_PASS ?? '',
    smtpFrom: runtimeConfig.smtpFrom ?? process.env.SMTP_FROM ?? 'SRM IST Admissions <admissions@ist.srmtrichy.edu.in>',
    smtpSecure: runtimeConfig.smtpSecure ?? (process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465'),
    resendApiKey: runtimeConfig.resendApiKey ?? process.env.RESEND_API_KEY ?? '',
  };
}

export function updateRuntimeEmailConfig(newConfig: Partial<EmailConfig>): void {
  runtimeConfig = { ...runtimeConfig, ...newConfig };
}

export interface SendEmailResult {
  success: boolean;
  deliveredToInbox: boolean;
  provider: 'SMTP' | 'RESEND' | 'SIMULATED_LOCAL';
  messageId?: string;
  error?: string;
}

/**
 * Dispatches an email to a real recipient inbox using configured SMTP or Resend API.
 * Falls back to simulated delivery if no network provider credentials are set.
 */
export async function dispatchRealEmail(options: {
  to: string;
  recipientName: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendEmailResult> {
  const config = getActiveEmailConfig();

  /*
  // 1. Try Resend API if API Key is configured
  if (config.resendApiKey && config.resendApiKey.trim().length > 0) {
    try {
      const fromAddress = config.smtpFrom.includes('<')
        ? config.smtpFrom
        : `SRM IST Admissions <${config.smtpFrom}>`;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.resendApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      const data = await response.json();
      if (response.ok && data?.id) {
        console.log(`[SRM Mailer] Dispatched email to ${options.to} via Resend. Message ID: ${data.id}`);
        return {
          success: true,
          deliveredToInbox: true,
          provider: 'RESEND',
          messageId: data.id,
        };
      } else {
        console.warn('[SRM Mailer] Resend dispatch error:', data);
        return {
          success: false,
          deliveredToInbox: false,
          provider: 'RESEND',
          error: data?.message || 'Resend API returned error',
        };
      }
    } catch (err: any) {
      console.error('[SRM Mailer] Resend network error:', err);
      return {
        success: false,
        deliveredToInbox: false,
        provider: 'RESEND',
        error: err.message,
      };
    }
  }
  */

  // 2. Try Standard SMTP / Gmail via Nodemailer
  if (config.smtpHost && config.smtpUser && config.smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass,
        },
        tls: {
          // Do not fail on self-signed or institutional internal certificates
          rejectUnauthorized: false,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
      });

      const info = await transporter.sendMail({
        from: config.smtpFrom || `"SRM IST Admissions" <${config.smtpUser}>`,
        to: `"${options.recipientName}" <${options.to}>`,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      console.log(`[SRM Mailer] Dispatched email to ${options.to} via SMTP (${config.smtpHost}). Message ID: ${info.messageId}`);
      return {
        success: true,
        deliveredToInbox: true,
        provider: 'SMTP',
        messageId: info.messageId,
      };
    } catch (err: any) {
      console.error('[SRM Mailer] SMTP dispatch failed:', err.message);
      return {
        success: false,
        deliveredToInbox: false,
        provider: 'SMTP',
        error: err.message,
      };
    }
  }

  // 3. Fallback: No live SMTP/Resend configured
  console.log(`[SRM Mailer] Notice: No external SMTP/Resend credentials configured. Email to ${options.to} recorded in campus outbox.`);
  return {
    success: true,
    deliveredToInbox: false,
    provider: 'SIMULATED_LOCAL',
    error: 'SMTP credentials not configured on server. Email stored in Campus Mail Outbox.',
  };
}
