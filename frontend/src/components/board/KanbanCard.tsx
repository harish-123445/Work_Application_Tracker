import React from 'react';
import { Application } from '../../types';
import { Calendar, MessageSquare, Star, ArrowUpRight } from 'lucide-react';

interface KanbanCardProps {
  application: Application;
  onClick: () => void;
  isDragging?: boolean;
}

// Consistent curated vibrant color palette based on company initial
const avatarColors = [
  { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  { bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  { bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  { bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
];

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
};

export const KanbanCard: React.FC<KanbanCardProps> = ({
  application,
  onClick,
  isDragging
}) => {
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    if (max) return `Up to ${fmt(max)}`;
    return null;
  };

  const salaryDisplay = formatSalary(application.salary_min, application.salary_max);
  const interviewCount = application.interviews ? application.interviews.length : 0;
  const companyName = application.company?.name || 'Company';
  const companyInitial = companyName.charAt(0).toUpperCase();
  const avatarStyle = getAvatarColor(companyName);

  return (
    <div
      onClick={onClick}
      className={`group bg-white rounded-xl border p-3.5 cursor-pointer select-none transition-all duration-150 ${
        isDragging
          ? 'border-indigo-400 shadow-lg ring-2 ring-indigo-500/20'
          : 'border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      {/* Top Header: Company Avatar/Name + Work Mode Pill */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2 min-w-0">
          <div className={`w-6 h-6 rounded-lg border flex items-center justify-center text-[11px] font-bold shadow-2xs flex-shrink-0 ${avatarStyle.bg}`}>
            {companyInitial}
          </div>
          <span className="text-xs font-bold text-slate-900 truncate tracking-tight">
            {companyName}
          </span>
          {application.job_url && (
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center space-x-1.5 flex-shrink-0">
          {application.is_favorite && (
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          )}
          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100/90 border border-slate-200 px-2 py-0.5 rounded-full capitalize">
            {application.work_mode}
          </span>
        </div>
      </div>

      {/* Role Title */}
      <h3 className="text-[13px] font-semibold text-slate-900 leading-snug mb-2.5 group-hover:text-indigo-600 transition-colors">
        {application.role_title}
      </h3>

      {/* Tags with punchy pastel styling */}
      {application.tags && application.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {application.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50/80 text-indigo-700 border border-indigo-100"
            >
              {tag.name}
            </span>
          ))}
          {application.tags.length > 3 && (
            <span className="text-[10px] text-slate-400 self-center font-medium">
              +{application.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Bottom Metadata Line */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <div className="flex items-center space-x-1 text-slate-500">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>{application.applied_date}</span>
        </div>

        <div className="flex items-center space-x-2">
          {interviewCount > 0 && (
            <div className="flex items-center space-x-1 text-indigo-700 bg-indigo-50 border border-indigo-100/80 px-1.5 py-0.5 rounded-md text-[10px] font-bold">
              <MessageSquare className="w-3 h-3 text-indigo-500" />
              <span>{interviewCount} {interviewCount === 1 ? 'round' : 'rounds'}</span>
            </div>
          )}

          {salaryDisplay && (
            <div className="flex items-center text-emerald-700 bg-emerald-50 border border-emerald-100/80 px-1.5 py-0.5 rounded-md text-[10px] font-bold">
              <span>{salaryDisplay}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
