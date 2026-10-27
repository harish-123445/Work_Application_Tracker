import React, { useState } from 'react';
import { Application, EnumItem } from '../../types';
import { Search, ArrowUpDown, Star } from 'lucide-react';

interface TableViewProps {
  applications: Application[];
  statuses: EnumItem[];
  workModes: EnumItem[];
  onSelectApplication: (app: Application) => void;
  onStatusChange: (id: number, newStatus: string) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  applications,
  statuses,
  workModes,
  onSelectApplication,
  onStatusChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workModeFilter, setWorkModeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'applied_date' | 'company' | 'role_title'>('applied_date');
  const [sortAsc, setSortAsc] = useState(false);

  // Status and WorkMode maps for quick lookup
  const statusMap = new Map(statuses.map((s) => [s.key, s]));
  const workModeMap = new Map(workModes.map((w) => [w.key, w]));

  const filtered = applications.filter((app) => {
    const matchesSearch =
      searchTerm === '' ||
      app.role_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.location && app.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.notes && app.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesWorkMode = workModeFilter === 'all' || app.work_mode === workModeFilter;

    return matchesSearch && matchesStatus && matchesWorkMode;
  });

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'applied_date') {
      comparison = new Date(b.applied_date).getTime() - new Date(a.applied_date).getTime();
    } else if (sortField === 'company') {
      comparison = (a.company?.name || '').localeCompare(b.company?.name || '');
    } else if (sortField === 'role_title') {
      comparison = a.role_title.localeCompare(b.role_title);
    }
    return sortAsc ? -comparison : comparison;
  });

  const toggleSort = (field: 'applied_date' | 'company' | 'role_title') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, title, or notes..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="all">All Statuses</option>
            {statuses.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Work Mode Filter */}
          <select
            value={workModeFilter}
            onChange={(e) => setWorkModeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="all">All Work Modes</option>
            {workModes.map((w) => (
              <option key={w.key} value={w.key}>
                {w.label}
              </option>
            ))}
          </select>

          <span className="text-xs text-slate-500 font-medium ml-2">
            Showing {sorted.length} of {applications.length}
          </span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold text-xs tracking-wider uppercase">
                <th
                  onClick={() => toggleSort('company')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Company</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('role_title')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Role Title</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Work Mode</th>
                <th className="py-3.5 px-4">Tags</th>
                <th
                  onClick={() => toggleSort('applied_date')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Applied Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Rounds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sorted.map((app) => {
                const statusMeta = statusMap.get(app.status);
                const workModeMeta = workModeMap.get(app.work_mode);

                return (
                  <tr
                    key={app.id}
                    onClick={() => onSelectApplication(app)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    {/* Company */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 uppercase">
                          {app.company?.name ? app.company.name.charAt(0) : 'C'}
                        </div>
                        <span>{app.company?.name}</span>
                        {app.is_favorite && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                      </div>
                    </td>

                    {/* Role Title */}
                    <td className="py-3.5 px-4 font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {app.role_title}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={app.status}
                        onChange={(e) => onStatusChange(app.id, e.target.value)}
                        className="bg-slate-50 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                        style={{ color: statusMeta?.color || '#334155' }}
                      >
                        {statuses.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Work Mode */}
                    <td className="py-3.5 px-4 text-xs capitalize text-slate-500 font-medium">
                      {workModeMeta?.label || app.work_mode}
                    </td>

                    {/* Tags */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {app.tags?.map((t) => (
                          <span
                            key={t.id}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Applied Date */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                      {app.applied_date}
                    </td>

                    {/* Rounds */}
                    <td className="py-3.5 px-4 text-right font-semibold text-xs text-indigo-600">
                      {app.interviews?.length ? `${app.interviews.length} rounds` : '—'}
                    </td>
                  </tr>
                );
              })}

              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-medium text-sm">
                    No matching applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
