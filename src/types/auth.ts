// ==============================================================================
// SRM Institute of Science and Technology – Tiruchirappalli Campus
// Authentication & Identity Portal TypeScript Interfaces
// ==============================================================================

export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';

export type AccountStatus = 'PENDING_ACTIVATION' | 'ACTIVE' | 'SUSPENDED';

export type TokenStatus = 'PENDING' | 'USED' | 'EXPIRED';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  status: AccountStatus;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  register_number: string;
  department: string;
  section: string;
  year: string;
  created_at: string;
  updated_at: string;
}

export interface FacultyProfile {
  id: string;
  user_id: string;
  faculty_id: string;
  department: string;
  designation: string;
  fet_id?: string;
  research_area?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  phone?: string;
  username?: string;
  student?: StudentProfile;
  faculty?: FacultyProfile;
}

export interface StudentRegistrationInput {
  name: string;
  register_number: string;
  department: string;
  section: string;
  year: string;
  email: string;
  phone: string;
}

export interface FacultyRegistrationInput {
  name: string;
  designation: string;
  fet_id: string;
  email: string;
  phone: string;
  research_area: string;
  department?: string;
}

export interface ActivationTokenVerifyResult {
  valid: boolean;
  status: 'VALID' | 'EXPIRED' | 'USED' | 'INVALID';
  message: string;
  student_name?: string;
  user_name?: string;
  email?: string;
  role?: UserRole;
  faculty?: {
    fet_id: string;
    designation: string;
    research_area: string;
    department?: string;
  };
}

export interface SecurityAuditLog {
  id: string;
  event_type: string;
  user_id?: string;
  email_or_identifier: string;
  ip_address: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  details?: Record<string, any>;
  created_at: string;
}

export interface SentEmailRecord {
  id: string;
  to: string;
  recipient_name: string;
  subject: string;
  type: 'ACTIVATION' | 'PASSWORD_RESET' | 'SECURITY_NOTIFICATION';
  activation_token?: string;
  reset_token?: string;
  action_link?: string;
  html_preview: string;
  text_body: string;
  created_at: string;
  expires_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
