export interface EnumItem {
  key: string;
  label: string;
  color?: string;
  is_terminal?: boolean;
  order?: number;
}

export interface EnumsConfig {
  application_statuses: EnumItem[];
  work_modes: EnumItem[];
  interview_round_types: EnumItem[];
  interview_outcomes: EnumItem[];
  timeline_event_types: EnumItem[];
}

export interface AppConfigResponse {
  enums: EnumsConfig;
  analytics: {
    ghosting_threshold_days: number;
    funnel_stages: string[];
  };
}

export interface Company {
  id: number;
  name: string;
  website?: string;
  domain?: string;
  logo_url?: string;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  color_hex: string;
}

export interface InterviewFeedback {
  id: number;
  interview_round_id: number;
  star_situation?: string;
  star_task?: string;
  star_action?: string;
  star_result?: string;
  rating_score?: number;
  personal_debrief?: string;
  created_at: string;
}

export interface InterviewRound {
  id: number;
  application_id: number;
  round_number: number;
  round_type: string;
  scheduled_at?: string;
  duration_minutes: number;
  interviewer_name?: string;
  interviewer_email?: string;
  interviewer_linkedin?: string;
  outcome: string;
  preparation_notes?: string;
  completed: boolean;
  created_at: string;
  feedback?: InterviewFeedback;
}

export interface TimelineEvent {
  id: number;
  application_id: number;
  event_type: string;
  from_state?: string;
  to_state?: string;
  description?: string;
  created_at: string;
}

export interface Application {
  id: number;
  company_id: number;
  role_title: string;
  job_url?: string;
  location?: string;
  work_mode: string;
  status: string;
  salary_min?: number;
  salary_max?: number;
  currency: string;
  applied_date: string;
  resume_version?: string;
  referral_name?: string;
  referral_email?: string;
  job_description?: string;
  notes?: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  company: Company;
  tags: Tag[];
  interviews: InterviewRound[];
  timeline_events?: TimelineEvent[];
}

export interface KPISummary {
  total_applications: number;
  active_in_pipeline: number;
  offers_received: number;
  rejections: number;
  ghosted_count: number;
  response_rate_pct: number;
  interview_conversion_pct: number;
  avg_first_response_days?: number;
}

export interface FunnelStageMetric {
  stage_key: string;
  stage_label: string;
  count: number;
  conversion_from_previous_pct: number;
}

export interface StatusBreakdownItem {
  status_key: string;
  label: string;
  color: string;
  count: number;
}

export interface WorkModeBreakdownItem {
  work_mode_key: string;
  label: string;
  count: number;
}

export interface WeeklyVelocityItem {
  week_label: string;
  count: number;
}
