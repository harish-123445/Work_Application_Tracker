import React from 'react';
import {
  KPISummary,
  FunnelStageMetric,
  StatusBreakdownItem,
  WorkModeBreakdownItem,
  WeeklyVelocityItem,
} from '../../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { TrendingUp, Target, Award, AlertTriangle, Layers, Send } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsDashboardProps {
  kpis: KPISummary | null;
  funnel: FunnelStageMetric[];
  statusBreakdown: StatusBreakdownItem[];
  workModeBreakdown: WorkModeBreakdownItem[];
  weeklyVelocity: WeeklyVelocityItem[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  kpis,
  funnel,
  statusBreakdown,
  workModeBreakdown,
  weeklyVelocity,
}) => {
  // Chart Colors & Styling Tokens for Light Theme
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#475569',
          font: { family: 'Inter', size: 12 },
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        titleColor: '#ffffff',
        bodyColor: '#f1f5f9',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.04)' },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.04)' },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
      },
    },
  };

  // Funnel Bar Chart Data
  const funnelData = {
    labels: funnel.map((f) => f.stage_label),
    datasets: [
      {
        label: 'Candidate Volume',
        data: funnel.map((f) => f.count),
        backgroundColor: [
          'rgba(14, 165, 233, 0.85)',
          'rgba(99, 102, 241, 0.85)',
          'rgba(168, 85, 247, 0.85)',
          'rgba(236, 72, 153, 0.85)',
          'rgba(16, 185, 129, 0.9)',
        ],
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
      },
    ],
  };

  // Velocity Line Chart Data
  const velocityData = {
    labels: weeklyVelocity.map((w) => w.week_label),
    datasets: [
      {
        fill: true,
        label: 'Applications Submitted',
        data: weeklyVelocity.map((w) => w.count),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.35,
        pointBackgroundColor: '#4f46e5',
        pointBorderColor: '#ffffff',
        pointRadius: 4,
      },
    ],
  };

  // Status Donut Chart Data
  const statusData = {
    labels: statusBreakdown.map((s) => s.label),
    datasets: [
      {
        data: statusBreakdown.map((s) => s.count),
        backgroundColor: statusBreakdown.map((s) => s.color),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  // Work Mode Donut Chart Data
  const workModeData = {
    labels: workModeBreakdown.map((w) => w.label),
    datasets: [
      {
        data: workModeBreakdown.map((w) => w.count),
        backgroundColor: ['#0ea5e9', '#6366f1', '#10b981'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-6 pb-12">
      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applications */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pipeline</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {kpis ? kpis.total_applications : 0}
            </h3>
            <p className="text-xs text-indigo-600 font-medium mt-0.5">
              {kpis ? kpis.active_in_pipeline : 0} active in progress
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Response Rate */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Response Rate</p>
            <h3 className="text-2xl font-bold text-sky-600 mt-1">
              {kpis ? `${kpis.response_rate_pct}%` : '0%'}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Avg {kpis?.avg_first_response_days ? `${kpis.avg_first_response_days} days` : 'N/A'} to contact
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Offer Conversion */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Offers Received</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              {kpis ? kpis.offers_received : 0}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {kpis ? `${kpis.interview_conversion_pct}%` : '0%'} interview conversion
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Ghosted / Inactive Alert */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ghosted / Overdue</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">
              {kpis ? kpis.ghosted_count : 0}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">&gt; 14 days without response</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Drop-off Bar Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Application Funnel Conversion</h3>
              <p className="text-xs text-slate-500">Progression from initial submission to offer</p>
            </div>
            <Target className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="h-64">
            <Bar data={funnelData} options={chartOptions} />
          </div>
        </div>

        {/* Weekly Velocity Line Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Submission Velocity</h3>
              <p className="text-xs text-slate-500">Applications submitted per week over the past 8 weeks</p>
            </div>
            <Send className="w-5 h-5 text-sky-600" />
          </div>
          <div className="h-64">
            <Line data={velocityData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Secondary Distribution Donuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Breakdown Donut */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Status Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Current stage distribution across all logged applications</p>
          <div className="h-60 flex items-center justify-center">
            <Doughnut
              data={statusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right', labels: { color: '#475569', font: { size: 11, family: 'Inter' } } },
                },
              }}
            />
          </div>
        </div>

        {/* Work Mode Breakdown Donut */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Work Mode Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Remote vs. Hybrid vs. On-site preferences</p>
          <div className="h-60 flex items-center justify-center">
            <Doughnut
              data={workModeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right', labels: { color: '#475569', font: { size: 11, family: 'Inter' } } },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
