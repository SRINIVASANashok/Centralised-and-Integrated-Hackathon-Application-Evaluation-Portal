-- ==============================================================================
-- SRM Institute of Science and Technology – Tiruchirappalli Campus
-- SIH Internal Hackathon & YUVA Mega-Thon Idea Management Schema
-- ==============================================================================

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE sih_submission_status AS ENUM (
        'NOT_SUBMITTED',
        'SUBMITTED',
        'ASSIGNED_TO_TEACHER',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sih_category AS ENUM ('Software', 'Hardware', 'Both');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. SIH SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.sih_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    student_phone VARCHAR(50) NOT NULL,
    register_number VARCHAR(50) NOT NULL,
    department VARCHAR(150) NOT NULL,
    section VARCHAR(50) NOT NULL,
    year VARCHAR(50) NOT NULL,
    team_id VARCHAR(100) NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    team_members TEXT,
    problem_statement_id VARCHAR(50) NOT NULL,
    problem_statement_title VARCHAR(255) NOT NULL,
    theme VARCHAR(150) NOT NULL,
    category sih_category NOT NULL DEFAULT 'Software',
    idea_title VARCHAR(255) NOT NULL,
    one_line_pitch TEXT,
    pdf_filename VARCHAR(255) NOT NULL,
    pdf_file_size INT NOT NULL,
    pdf_data_base64 TEXT NOT NULL,
    status sih_submission_status NOT NULL DEFAULT 'SUBMITTED',
    assigned_teacher_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    assigned_teacher_name VARCHAR(255),
    assigned_teacher_dept VARCHAR(150),
    assigned_at TIMESTAMPTZ,
    reviewed_by_teacher_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    reviewed_by_teacher_name VARCHAR(255),
    review_decision VARCHAR(50),
    rejection_reason TEXT,
    review_feedback TEXT,
    reviewed_at TIMESTAMPTZ,
    submission_version INT NOT NULL DEFAULT 1,
    is_resubmission BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SIH SUBMISSION HISTORY TABLE (Preserves past versions on rejection/resubmission)
CREATE TABLE IF NOT EXISTS public.sih_submission_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.sih_submissions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    version INT NOT NULL,
    pdf_filename VARCHAR(255) NOT NULL,
    pdf_file_size INT NOT NULL,
    pdf_data_base64 TEXT NOT NULL,
    status sih_submission_status NOT NULL,
    rejection_reason TEXT,
    reviewed_by_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.sih_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sih_submission_history ENABLE ROW LEVEL SECURITY;
