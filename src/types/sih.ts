// ==============================================================================
// SRM IST Tiruchirappalli SIH Internal Hackathon TypeScript Interfaces
// ==============================================================================

export type SIHSubmissionStatus =
  | 'NOT_SUBMITTED'
  | 'SUBMITTED'
  | 'ASSIGNED_TO_TEACHER'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export type PSCategory = 'Software' | 'Hardware' | 'Both';

export interface SIHSubmission {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  register_number: string;
  department: string;
  section: string;
  year: string;
  team_id: string;
  team_name: string;
  team_members?: string;
  problem_statement_id: string;
  problem_statement_title: string;
  theme: string;
  category: PSCategory;
  idea_title: string;
  one_line_pitch?: string;
  pdf_filename: string;
  pdf_file_size: number;
  status: SIHSubmissionStatus;
  assigned_teacher_id?: string | null;
  assigned_teacher_name?: string | null;
  assigned_teacher_dept?: string | null;
  assigned_at?: string | null;
  reviewed_by_teacher_id?: string | null;
  reviewed_by_teacher_name?: string | null;
  review_decision?: 'APPROVED' | 'REJECTED' | null;
  rejection_reason?: string | null;
  review_feedback?: string | null;
  reviewed_at?: string | null;
  submission_version: number;
  is_resubmission: boolean;
  history?: SIHSubmissionHistoryEntry[];
  created_at: string;
  updated_at: string;
}

export interface SIHSubmissionHistoryEntry {
  id: string;
  submission_id: string;
  version: number;
  pdf_filename: string;
  status: SIHSubmissionStatus;
  rejection_reason?: string | null;
  reviewed_by_name?: string | null;
  created_at: string;
}

export interface SIHTeacherSummary {
  id: string;
  user_id: string;
  name: string;
  email: string;
  faculty_id: string;
  department: string;
  designation: string;
  assigned_count: number;
  pending_count: number;
  completed_count: number;
}

export interface SIHAdminOverviewStats {
  total_students: number;
  total_submissions: number;
  pending_submissions: number;
  assigned_submissions: number;
  under_review: number;
  approved_ideas: number;
  rejected_ideas: number;
}

export interface SIHTeacherOverviewStats {
  total_assigned: number;
  pending_review: number;
  approved: number;
  rejected: number;
}

export interface SIHTemplateSlide {
  slide_number: number;
  title: string;
  description: string;
  pointers: string[];
  tips?: string;
}

export interface SIHHackathonInfo {
  title: string;
  subtitle: string;
  organizer: string;
  campus: string;
  registration_deadline: string;
  evaluation_deadline: string;
  rules: string[];
  themes: string[];
  tracks: string[];
  template_slides: SIHTemplateSlide[];
}

export interface SubmitIdeaPayload {
  idea_title: string;
  problem_statement_id: string;
  problem_statement_title: string;
  theme: string;
  category: PSCategory;
  team_id: string;
  team_name: string;
  team_members?: string;
  one_line_pitch?: string;
  pdf_filename: string;
  pdf_data_base64: string; // Base64 data URL or raw base64
}
