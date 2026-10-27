import React, { useEffect, useState } from 'react';
import { api } from './api';
import {
  Application,
  EnumItem,
  KPISummary,
  FunnelStageMetric,
  StatusBreakdownItem,
  WorkModeBreakdownItem,
  WeeklyVelocityItem,
} from './types';
import { Navbar } from './components/common/Navbar';
import { KanbanBoard } from './components/board/KanbanBoard';
import { TableView } from './components/table/TableView';
import { AnalyticsDashboard } from './components/dashboard/AnalyticsDashboard';
import { QuickAddModal } from './components/modals/QuickAddModal';
import { ApplicationDetailDrawer } from './components/modals/ApplicationDetailDrawer';

export function App() {
  const [activeTab, setActiveTab] = useState<'board' | 'table' | 'dashboard'>('board');
  const [applications, setApplications] = useState<Application[]>([]);
  const [statuses, setStatuses] = useState<EnumItem[]>([]);
  const [workModes, setWorkModes] = useState<EnumItem[]>([]);
  const [roundTypes, setRoundTypes] = useState<EnumItem[]>([]);
  const [outcomes, setOutcomes] = useState<EnumItem[]>([]);

  // Analytics State
  const [kpis, setKpis] = useState<KPISummary | null>(null);
  const [funnel, setFunnel] = useState<FunnelStageMetric[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdownItem[]>([]);
  const [workModeBreakdown, setWorkModeBreakdown] = useState<WorkModeBreakdownItem[]>([]);
  const [weeklyVelocity, setWeeklyVelocity] = useState<WeeklyVelocityItem[]>([]);

  // Modals
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddStatus, setQuickAddStatus] = useState<string>('applied');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Loading & Notification State
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Initial Load of Config & Enums from config.yaml via backend
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const configRes = await api.getConfig();
      setStatuses(configRes.enums.application_statuses);
      setWorkModes(configRes.enums.work_modes);
      setRoundTypes(configRes.enums.interview_round_types);
      setOutcomes(configRes.enums.interview_outcomes);

      await refreshApplications();
      await refreshAnalytics();
    } catch (err) {
      console.error('Failed to load initial data:', err);
      showToast('Could not reach backend API. Ensure FastAPI server is running on :8000');
    } finally {
      setLoading(false);
    }
  };

  const refreshApplications = async () => {
    try {
      const data = await api.getApplications();
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const refreshAnalytics = async () => {
    try {
      const [k, f, sb, wb, wv] = await Promise.all([
        api.getKpis(),
        api.getFunnel(),
        api.getStatusBreakdown(),
        api.getWorkModeBreakdown(),
        api.getWeeklyVelocity(),
      ]);
      setKpis(k);
      setFunnel(f);
      setStatusBreakdown(sb);
      setWorkModeBreakdown(wb);
      setWeeklyVelocity(wv);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handlers
  const handleStatusChange = async (id: number, newStatus: string) => {
    // Optimistic UI update
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );

    try {
      await api.updateStatus(id, newStatus);
      showToast(`Updated status to ${newStatus}`);
      await refreshAnalytics();
      if (selectedApplication && selectedApplication.id === id) {
        const refreshedApp = await api.getApplication(id);
        setSelectedApplication(refreshedApp);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Status update failed.');
      await refreshApplications();
    }
  };

  const handleCreateApplication = async (formData: any) => {
    await api.createApplication(formData);
    showToast('Application logged successfully!');
    await refreshApplications();
    await refreshAnalytics();
  };

  const handleSelectApplication = async (app: Application) => {
    try {
      const detail = await api.getApplication(app.id);
      setSelectedApplication(detail);
      setIsDetailOpen(true);
    } catch (err) {
      setSelectedApplication(app);
      setIsDetailOpen(true);
    }
  };

  const handleAddRound = async (applicationId: number, roundData: any) => {
    await api.addInterviewRound(applicationId, roundData);
    showToast('Interview round added!');
    const refreshedApp = await api.getApplication(applicationId);
    setSelectedApplication(refreshedApp);
    await refreshApplications();
    await refreshAnalytics();
  };

  const handleSaveFeedback = async (roundId: number, feedbackData: any) => {
    await api.saveFeedback(roundId, feedbackData);
    showToast('STAR interview notes saved!');
    if (selectedApplication) {
      const refreshedApp = await api.getApplication(selectedApplication.id);
      setSelectedApplication(refreshedApp);
    }
  };

  const handleDeleteApplication = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      await api.deleteApplication(id);
      setIsDetailOpen(false);
      setSelectedApplication(null);
      showToast('Application deleted.');
      await refreshApplications();
      await refreshAnalytics();
    }
  };

  const handleSeedData = async () => {
    try {
      const res = await api.seedData();
      showToast(res.message);
      await refreshApplications();
      await refreshAnalytics();
    } catch (err) {
      showToast('Seeding failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-xl flex items-center space-x-2 animate-bounce">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewModal={() => {
          setQuickAddStatus('applied');
          setIsQuickAddOpen(true);
        }}
        onSeedData={handleSeedData}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Connecting to FastAPI and loading configuration...</p>
          </div>
        ) : (
          <>
            {activeTab === 'board' && (
              <KanbanBoard
                applications={applications}
                statuses={statuses}
                onStatusChange={handleStatusChange}
                onSelectApplication={handleSelectApplication}
                onQuickAdd={(statusKey) => {
                  setQuickAddStatus(statusKey);
                  setIsQuickAddOpen(true);
                }}
              />
            )}

            {activeTab === 'table' && (
              <TableView
                applications={applications}
                statuses={statuses}
                workModes={workModes}
                onSelectApplication={handleSelectApplication}
                onStatusChange={handleStatusChange}
              />
            )}

            {activeTab === 'dashboard' && (
              <AnalyticsDashboard
                kpis={kpis}
                funnel={funnel}
                statusBreakdown={statusBreakdown}
                workModeBreakdown={workModeBreakdown}
                weeklyVelocity={weeklyVelocity}
              />
            )}
          </>
        )}
      </main>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSubmit={handleCreateApplication}
        statuses={statuses}
        workModes={workModes}
        defaultStatus={quickAddStatus}
      />

      {/* Application Detail Drawer */}
      <ApplicationDetailDrawer
        application={selectedApplication}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        statuses={statuses}
        roundTypes={roundTypes}
        outcomes={outcomes}
        onStatusChange={handleStatusChange}
        onAddRound={handleAddRound}
        onSaveFeedback={handleSaveFeedback}
        onDelete={handleDeleteApplication}
      />
    </div>
  );
}

export default App;
