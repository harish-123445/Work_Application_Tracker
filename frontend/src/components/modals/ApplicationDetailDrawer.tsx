import React, { useState } from 'react';
import { Application, EnumItem } from '../../types';
import { X, ExternalLink, Calendar, Trash2, Plus, User } from 'lucide-react';

interface ApplicationDetailDrawerProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  statuses: EnumItem[];
  roundTypes: EnumItem[];
  outcomes: EnumItem[];
  onStatusChange: (id: number, status: string) => void;
  onAddRound: (applicationId: number, data: any) => Promise<void>;
  onSaveFeedback: (roundId: number, data: any) => Promise<void>;
  onDelete: (id: number) => void;
}

export const ApplicationDetailDrawer: React.FC<ApplicationDetailDrawerProps> = ({
  application,
  isOpen,
  onClose,
  statuses,
  roundTypes,
  onStatusChange,
  onAddRound,
  onSaveFeedback,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'interviews' | 'timeline'>('overview');
  const [isAddingRound, setIsAddingRound] = useState(false);
  const [newRoundType, setNewRoundType] = useState('technical_coding');
  const [newInterviewerName, setNewInterviewerName] = useState('');

  // Selected Round for STAR feedback modal
  const [selectedRoundForSTAR, setSelectedRoundForSTAR] = useState<any | null>(null);
  const [starSituation, setStarSituation] = useState('');
  const [starTask, setStarTask] = useState('');
  const [starAction, setStarAction] = useState('');
  const [starResult, setStarResult] = useState('');

  if (!isOpen || !application) return null;

  const handleCreateRound = async () => {
    const nextRoundNumber = (application.interviews?.length || 0) + 1;
    await onAddRound(application.id, {
      round_number: nextRoundNumber,
      round_type: newRoundType,
      interviewer_name: newInterviewerName || undefined,
    });
    setIsAddingRound(false);
    setNewInterviewerName('');
  };

  const handleOpenSTAR = (round: any) => {
    setSelectedRoundForSTAR(round);
    setStarSituation(round.feedback?.star_situation || '');
    setStarTask(round.feedback?.star_task || '');
    setStarAction(round.feedback?.star_action || '');
    setStarResult(round.feedback?.star_result || '');
  };

  const handleSaveSTAR = async () => {
    if (!selectedRoundForSTAR) return;
    await onSaveFeedback(selectedRoundForSTAR.id, {
      star_situation: starSituation,
      star_task: starTask,
      star_action: starAction,
      star_result: starResult,
    });
    setSelectedRoundForSTAR(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white border-l border-slate-200 shadow-2xl h-full flex flex-col z-50">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-white">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-indigo-50 rounded-[10px] flex items-center justify-center text-indigo-700 font-bold text-base uppercase">
                {application.company?.name ? application.company.name.charAt(0) : 'C'}
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{application.role_title}</h2>
                {application.job_url && (
                  <a
                    href={application.job_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <p className="text-sm font-semibold text-indigo-600 mt-0.5">{application.company?.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDelete(application.id)}
              title="Delete application"
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Status:</span>
            <select
              value={application.status}
              onChange={(e) => onStatusChange(application.id, e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs font-semibold text-slate-800 shadow-xs focus:outline-none focus:border-indigo-500"
            >
              {statuses.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>Applied on {application.applied_date}</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 px-6 bg-white">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('interviews')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'interviews'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Interviews & STAR Hub</span>
            <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded-full text-[10px] font-bold border border-indigo-100">
              {application.interviews?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'timeline'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Audit Timeline
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Key Attributes Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Work Mode</span>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5 capitalize">{application.work_mode}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Location</span>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{application.location || 'Not specified'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Salary Range</span>
                  <p className="text-sm font-semibold text-emerald-700 mt-0.5">
                    {application.salary_min || application.salary_max
                      ? `$${application.salary_min || 0} - $${application.salary_max || 0}`
                      : 'Unspecified'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Resume Tag</span>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{application.resume_version || 'Default'}</p>
                </div>
              </div>

              {/* Tags */}
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {application.tags?.map((t) => (
                    <span
                      key={t.id}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100"
                    >
                      {t.name}
                    </span>
                  ))}
                  {(!application.tags || application.tags.length === 0) && (
                    <span className="text-xs text-slate-400 italic">No tags assigned</span>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Notes</span>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {application.notes || 'No notes logged for this application yet.'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERVIEWS & STAR METHOD */}
          {activeTab === 'interviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Interview Rounds</h3>
                  <p className="text-xs text-slate-500">Track each round with STAR preparation answers</p>
                </div>
                <button
                  onClick={() => setIsAddingRound(!isAddingRound)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm shadow-indigo-600/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Round</span>
                </button>
              </div>

              {/* Quick Add Round Inline Form */}
              {isAddingRound && (
                <div className="rounded-xl p-4 border border-indigo-200 bg-indigo-50/50 space-y-3">
                  <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Schedule New Round</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Round Type</label>
                      <select
                        value={newRoundType}
                        onChange={(e) => setNewRoundType(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      >
                        {roundTypes.map((r) => (
                          <option key={r.key} value={r.key}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Interviewer Name</label>
                      <input
                        type="text"
                        value={newInterviewerName}
                        onChange={(e) => setNewInterviewerName(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={() => setIsAddingRound(false)}
                      className="px-3 py-1 text-xs text-slate-500 hover:text-slate-800 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateRound}
                      className="px-4 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white"
                    >
                      Save Round
                    </button>
                  </div>
                </div>
              )}

              {/* Rounds List */}
              <div className="space-y-3">
                {application.interviews?.map((round) => (
                  <div
                    key={round.id}
                    className="bg-white rounded-xl p-4 border border-slate-200 hover:border-indigo-300 shadow-2xs transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold flex items-center justify-center">
                          {round.round_number}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900 capitalize">
                          {roundTypes.find((r) => r.key === round.round_type)?.label || round.round_type}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleOpenSTAR(round)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg transition-all"
                      >
                        {round.feedback ? 'Edit STAR Prep' : '+ Add STAR Prep'}
                      </button>
                    </div>

                    {round.interviewer_name && (
                      <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Interviewer: {round.interviewer_name}</span>
                      </div>
                    )}

                    {round.feedback && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                        {round.feedback.star_situation && (
                          <p>
                            <span className="font-bold text-indigo-700">Situation:</span>{' '}
                            {round.feedback.star_situation}
                          </p>
                        )}
                        {round.feedback.star_action && (
                          <p>
                            <span className="font-bold text-sky-700">Action:</span> {round.feedback.star_action}
                          </p>
                        )}
                        {round.feedback.star_result && (
                          <p>
                            <span className="font-bold text-emerald-700">Result:</span> {round.feedback.star_result}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {(!application.interviews || application.interviews.length === 0) && (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium">
                    No interview rounds scheduled yet.
                  </div>
                )}
              </div>

              {/* STAR Method Form Modal */}
              {selectedRoundForSTAR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                  <div className="bg-white w-full max-w-lg rounded-2xl p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          STAR Method Prep: Round {selectedRoundForSTAR.round_number}
                        </h3>
                        <p className="text-xs text-slate-500">Structured responses for behavioral questions</p>
                      </div>
                      <button onClick={() => setSelectedRoundForSTAR(null)}>
                        <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
                      </button>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Situation (What was the context?)
                      </label>
                      <textarea
                        rows={2}
                        value={starSituation}
                        onChange={(e) => setStarSituation(e.target.value)}
                        placeholder="Context of the challenge..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Task (What was your responsibility?)
                      </label>
                      <textarea
                        rows={2}
                        value={starTask}
                        onChange={(e) => setStarTask(e.target.value)}
                        placeholder="Your goal or deliverable..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Action (What specific steps did you take?)
                      </label>
                      <textarea
                        rows={3}
                        value={starAction}
                        onChange={(e) => setStarAction(e.target.value)}
                        placeholder="Architectural or leadership steps..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Result (What was the tangible outcome/metrics?)
                      </label>
                      <textarea
                        rows={2}
                        value={starResult}
                        onChange={(e) => setStarResult(e.target.value)}
                        placeholder="e.g. 40% latency reduction, delivered on time..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedRoundForSTAR(null)}
                        className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveSTAR}
                        className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white shadow-md shadow-indigo-600/30"
                      >
                        Save STAR Feedback
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TIMELINE AUDIT TRAIL */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Transition History</h3>
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {application.timeline_events?.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 relative pl-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-white mt-1 flex-shrink-0" />
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900 capitalize">{event.event_type.replace('_', ' ')}</span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(event.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{event.description}</p>
                    </div>
                  </div>
                ))}

                {(!application.timeline_events || application.timeline_events.length === 0) && (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium">
                    No timeline events recorded yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
