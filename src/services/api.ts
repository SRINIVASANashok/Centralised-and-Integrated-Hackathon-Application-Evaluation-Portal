// ==============================================================================
// SRM Institute of Science and Technology – API Client Service
// ==============================================================================

import {
  AuthenticatedUser,
  StudentRegistrationInput,
  FacultyRegistrationInput,
  ActivationTokenVerifyResult,
  SecurityAuditLog,
  SentEmailRecord,
} from '../types/auth';
import {
  SIHSubmission,
  SIHHackathonInfo,
  SIHAdminOverviewStats,
  SIHTeacherOverviewStats,
  SIHTeacherSummary,
  SubmitIdeaPayload,
} from '../types/sih';

const BASE_URL = '/api';

let inMemorySessionToken: string | null = null;

export function getSessionToken(): string | null {
  if (inMemorySessionToken) return inMemorySessionToken;
  try {
    return sessionStorage.getItem('srm_session_token');
  } catch {
    return null;
  }
}

export function setSessionToken(token: string | null) {
  inMemorySessionToken = token;
  try {
    if (token) {
      sessionStorage.setItem('srm_session_token', token);
    } else {
      sessionStorage.removeItem('srm_session_token');
    }
  } catch {}
}

export function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getSessionToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function checkSession(): Promise<{ authenticated: boolean; user?: AuthenticatedUser }> {
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 2500) : null;
    const res = await fetch(`${BASE_URL}/auth/session`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
      signal: controller ? controller.signal : undefined,
    });
    if (timeoutId) clearTimeout(timeoutId);
    if (!res.ok) return { authenticated: false };
    return await res.json();
  } catch (err) {
    console.warn('Session check fallback:', err);
    return { authenticated: false };
  }
}

export async function loginUser(
  username: string,
  password: string,
  expectedRole?: 'STUDENT' | 'FACULTY' | 'ADMIN'
): Promise<{ success: boolean; user?: AuthenticatedUser; error?: string; accountStatus?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ username, password, expectedRole }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Invalid username or password.', accountStatus: data.accountStatus };
    }
    if (data.sessionToken) {
      setSessionToken(data.sessionToken);
    }
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: 'Network communication failure. Please verify connection to SRM gateway.' };
  }
}

export async function registerStudent(input: StudentRegistrationInput): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}> {
  try {
    const res = await fetch(`${BASE_URL}/auth/register-student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...input,
        clientOrigin: typeof window !== 'undefined' ? window.location.origin : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Registration failed.' };
    }
    return { success: true, message: data.message, data: data.data };
  } catch (err) {
    return { success: false, error: 'Failed to submit registration request. Please try again.' };
  }
}

export async function registerFaculty(input: FacultyRegistrationInput): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}> {
  try {
    const res = await fetch(`${BASE_URL}/auth/register-faculty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...input,
        clientOrigin: typeof window !== 'undefined' ? window.location.origin : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Faculty registration failed.' };
    }
    return { success: true, message: data.message, data: data.data };
  } catch (err) {
    return { success: false, error: 'Failed to submit faculty registration request. Please try again.' };
  }
}

export async function verifyActivationToken(token: string): Promise<ActivationTokenVerifyResult> {
  try {
    const res = await fetch(`${BASE_URL}/auth/verify-activation-token?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const data = await res.json();
    return {
      valid: data.valid,
      status: data.status,
      message: data.message,
      student_name: data.student_name,
      user_name: data.user_name || data.student_name,
      email: data.email,
      role: data.role,
      faculty: data.faculty,
    };
  } catch (err) {
    return {
      valid: false,
      status: 'INVALID',
      message: 'Unable to communicate with the verification server.',
    };
  }
}

export async function activateAccount(
  token: string,
  password: string,
  confirm_password: string
): Promise<{ success: boolean; message?: string; error?: string; user?: AuthenticatedUser }> {
  try {
    const res = await fetch(`${BASE_URL}/auth/activate-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token, password, confirm_password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Activation failed.' };
    }
    return { success: true, message: data.message, user: data.user };
  } catch (err) {
    return { success: false, error: 'Connection error while activating account.' };
  }
}

export async function resendActivationLink(email: string): Promise<{ success: boolean; message?: string; error?: string; previewLink?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/auth/resend-activation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Request failed.' };
    }
    return { success: true, message: data.message, previewLink: data.previewLink };
  } catch (err) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function forgotPassword(email: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  previewLink?: string;
  resetToken?: string;
  deliveredToInbox?: boolean;
}> {
  try {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email,
        clientOrigin: typeof window !== 'undefined' ? window.location.origin : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Request failed.' };
    }
    return {
      success: true,
      message: data.message,
      previewLink: data.previewLink,
      resetToken: data.resetToken,
      deliveredToInbox: data.deliveredToInbox,
    };
  } catch (err) {
    return { success: false, error: 'Network error while requesting password reset.' };
  }
}

export async function verifyResetToken(token: string): Promise<{ valid: boolean; status: string; message: string; email?: string; name?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/auth/verify-reset-token?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return await res.json();
  } catch (err) {
    return { valid: false, status: 'INVALID', message: 'Unable to verify reset token.' };
  }
}

export async function resetPassword(
  token: string,
  password: string,
  confirm_password: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token, password, confirm_password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Password reset failed.' };
    }
    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, error: 'Failed to reset password.' };
  }
}

export async function logoutUser(): Promise<{ success: boolean }> {
  setSessionToken(null);
  try {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function fetchStudentDashboard(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/student/dashboard`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, error: 'Unable to fetch student dashboard.' };
  }
}

export async function fetchFacultyDashboard(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/faculty/dashboard`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, error: 'Unable to fetch faculty dashboard.' };
  }
}

export async function fetchAdminDashboard(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, error: 'Unable to fetch admin dashboard.' };
  }
}

export async function fetchAdminUsers(): Promise<{ success: boolean; users?: any[]; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, users: data.users };
  } catch (err) {
    return { success: false, error: 'Failed to load user records.' };
  }
}

export async function fetchAuditLogs(): Promise<{ success: boolean; logs?: SecurityAuditLog[]; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/admin/audit-logs`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, logs: data.logs };
  } catch (err) {
    return { success: false, error: 'Failed to load security audit logs.' };
  }
}

export async function fetchRecentEmails(): Promise<{ success: boolean; emails: SentEmailRecord[] }> {
  try {
    const res = await fetch(`${BASE_URL}/emails/recent`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    return { success: true, emails: data.emails || [] };
  } catch (err) {
    return { success: false, emails: [] };
  }
}

export async function runSecuritySuite(): Promise<{ success: boolean; summary?: string; tests?: any[]; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/security-test/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function runBenchmarkSuite(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/benchmark/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// SIH INTERNAL HACKATHON API CLIENT
// ==============================================================================

export async function fetchSIHInfo(): Promise<{ success: boolean; info?: SIHHackathonInfo; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/sih/info`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, info: data.info };
  } catch (err: any) {
    return { success: false, error: 'Failed to retrieve SIH hackathon information.' };
  }
}

export async function fetchMySIHSubmission(): Promise<{ success: boolean; submission?: SIHSubmission | null; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/sih/my-submission`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, submission: data.submission };
  } catch (err: any) {
    return { success: false, error: 'Failed to fetch student SIH submission.' };
  }
}

export async function submitSIHIdea(payload: SubmitIdeaPayload): Promise<{
  success: boolean;
  message?: string;
  submission?: SIHSubmission;
  error?: string;
}> {
  try {
    const res = await fetch(`${BASE_URL}/sih/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, message: data.message, submission: data.submission };
  } catch (err: any) {
    return { success: false, error: 'Network failure during idea submission. Verify file format and connectivity.' };
  }
}

export async function fetchSIHAdminOverview(): Promise<{ success: boolean; stats?: SIHAdminOverviewStats; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/sih/admin/overview`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, stats: data.stats };
  } catch (err: any) {
    return { success: false, error: 'Failed to fetch administrator SIH overview metrics.' };
  }
}

export async function fetchSIHAdminSubmissions(): Promise<{ success: boolean; submissions?: SIHSubmission[]; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/sih/admin/submissions`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, submissions: data.submissions };
  } catch (err: any) {
    return { success: false, error: 'Failed to retrieve SIH submissions list.' };
  }
}

export async function fetchSIHAdminTeachers(): Promise<{ success: boolean; teachers?: SIHTeacherSummary[]; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/sih/admin/teachers`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, teachers: data.teachers };
  } catch (err: any) {
    return { success: false, error: 'Failed to fetch available faculty members.' };
  }
}

export async function fetchFacultyAllocation(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/sih/admin/faculty-allocation`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, data: data.data };
  } catch (err: any) {
    return { success: false, error: 'Failed to fetch faculty allocation data.' };
  }
}


export async function assignSIHSubmissions(
  submission_ids: string[],
  teacher_id: string
): Promise<{ success: boolean; message?: string; updated_count?: number; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/sih/admin/assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ submission_ids, teacher_id }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, message: data.message, updated_count: data.updated_count };
  } catch (err: any) {
    return { success: false, error: 'Failed to assign submissions to teacher.' };
  }
}

export async function fetchSIHApprovedSubmissions(): Promise<{ success: boolean; submissions?: SIHSubmission[]; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/sih/admin/approved`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, submissions: data.submissions };
  } catch (err: any) {
    return { success: false, error: 'Failed to fetch approved SIH ideas.' };
  }
}

export async function exportSIHApprovedZip(submission_ids: string[]): Promise<Blob | null> {
  try {
    const res = await fetch(`${BASE_URL}/sih/admin/export/zip`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ submission_ids }),
    });
    if (!res.ok) return null;
    return await res.blob();
  } catch (err) {
    console.error('ZIP export error:', err);
    return null;
  }
}

export async function fetchSIHTeacherSubmissions(): Promise<{
  success: boolean;
  submissions?: SIHSubmission[];
  stats?: SIHTeacherOverviewStats;
  error?: string;
}> {
  try {
    const res = await fetch(`${BASE_URL}/sih/teacher/submissions`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, submissions: data.submissions, stats: data.stats };
  } catch (err: any) {
    return { success: false, error: 'Failed to fetch faculty evaluation assignments.' };
  }
}

export async function reviewSIHSubmission(payload: {
  submission_id: string;
  decision: 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
  feedback?: string;
}): Promise<{ success: boolean; message?: string; submission?: SIHSubmission; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/sih/teacher/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, message: data.message, submission: data.submission };
  } catch (err: any) {
    return { success: false, error: 'Failed to submit evaluation decision.' };
  }
}

export interface EmailConfigData {
  configured: boolean;
  provider: 'SMTP' | 'RESEND' | 'SIMULATED_LOCAL';
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpFrom: string;
  smtpSecure: boolean;
  hasPassword: boolean;
  hasResendKey: boolean;
}

export async function fetchEmailConfig(): Promise<{ success: boolean; config?: EmailConfigData; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/email/config`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const data = await res.json();
    return { success: true, config: data };
  } catch (err: any) {
    return { success: false, error: 'Failed to fetch email settings' };
  }
}

export async function updateEmailConfig(payload: {
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
  smtpSecure?: boolean;
  resendApiKey?: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/email/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to update email settings' };
    return { success: true, message: data.message };
  } catch (err: any) {
    return { success: false, error: 'Failed to update email configuration' };
  }
}

export async function sendTestVerificationEmail(to: string): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/email/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ to }),
    });
    const data = await res.json();
    if (!res.ok && !data.success) {
      return { success: false, message: data.message || 'Test email failed', error: data.error };
    }
    return { success: true, message: data.message };
  } catch (err: any) {
    return { success: false, message: 'Network error sending test email', error: err.message };
  }
}

export async function requestResendActivation(email: string): Promise<{
  success: boolean;
  message: string;
  previewLink?: string;
  deliveredToInbox?: boolean;
  error?: string;
}> {
  try {
    const res = await fetch(`${BASE_URL}/auth/resend-activation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.error || 'Failed to resend activation link.' };
    }
    return {
      success: true,
      message: data.message,
      previewLink: data.previewLink,
      deliveredToInbox: data.deliveredToInbox,
    };
  } catch (err: any) {
    return { success: false, message: 'Network communication failure. Please try again.' };
  }
}

