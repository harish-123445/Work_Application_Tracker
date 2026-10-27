import axios from 'axios';
import {
  Application,
  AppConfigResponse,
  KPISummary,
  FunnelStageMetric,
  StatusBreakdownItem,
  WorkModeBreakdownItem,
  WeeklyVelocityItem,
  InterviewRound,
  InterviewFeedback
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Public Configuration (Enums & Rules from config.yaml)
  getConfig: () => apiClient.get<AppConfigResponse>('/analytics/config').then(r => r.data),

  // Applications
  getApplications: (params?: { status?: string; work_mode?: string; search?: string; is_favorite?: boolean }) =>
    apiClient.get<Application[]>('/applications', { params }).then(r => r.data),

  getApplication: (id: number) =>
    apiClient.get<Application>(`/applications/${id}`).then(r => r.data),

  createApplication: (data: any) =>
    apiClient.post<Application>('/applications', data).then(r => r.data),

  updateStatus: (id: number, status: string, note?: string) =>
    apiClient.patch<Application>(`/applications/${id}/status`, { status, note }).then(r => r.data),

  updateApplication: (id: number, data: any) =>
    apiClient.put<Application>(`/applications/${id}`, data).then(r => r.data),

  deleteApplication: (id: number) =>
    apiClient.delete(`/applications/${id}`).then(r => r.data),

  // Interviews & Feedback
  addInterviewRound: (applicationId: number, data: any) =>
    apiClient.post<InterviewRound>(`/applications/${applicationId}/interviews`, data).then(r => r.data),

  updateInterviewRound: (roundId: number, data: any) =>
    apiClient.patch<InterviewRound>(`/interviews/${roundId}`, data).then(r => r.data),

  saveFeedback: (roundId: number, data: any) =>
    apiClient.post<InterviewFeedback>(`/interviews/${roundId}/feedback`, data).then(r => r.data),

  // Analytics
  getKpis: () => apiClient.get<KPISummary>('/analytics/kpis').then(r => r.data),
  getFunnel: () => apiClient.get<FunnelStageMetric[]>('/analytics/funnel').then(r => r.data),
  getStatusBreakdown: () => apiClient.get<StatusBreakdownItem[]>('/analytics/status-breakdown').then(r => r.data),
  getWorkModeBreakdown: () => apiClient.get<WorkModeBreakdownItem[]>('/analytics/work-mode-breakdown').then(r => r.data),
  getWeeklyVelocity: () => apiClient.get<WeeklyVelocityItem[]>('/analytics/weekly-velocity').then(r => r.data),

  // Data Seeder & Exports
  seedData: () => apiClient.post('/data/seed').then(r => r.data),
  getExportJsonUrl: () => `${API_BASE}/data/export/json`,
  getExportCsvUrl: () => `${API_BASE}/data/export/csv`,
};
