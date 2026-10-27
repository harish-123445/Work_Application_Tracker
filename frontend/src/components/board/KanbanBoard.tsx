import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Application, EnumItem } from '../../types';
import { KanbanCard } from './KanbanCard';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
  applications: Application[];
  statuses: EnumItem[];
  onStatusChange: (applicationId: number, newStatus: string) => void;
  onSelectApplication: (app: Application) => void;
  onQuickAdd: (statusKey: string) => void;
}

// Punchy status-specific accent tokens (Linear & Stripe style)
const statusThemes: Record<string, { accentBg: string; badge: string; border: string }> = {
  wishlist: {
    accentBg: 'bg-slate-500',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    border: 'border-t-slate-400',
  },
  applied: {
    accentBg: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    border: 'border-t-blue-500',
  },
  screening: {
    accentBg: 'bg-indigo-500',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    border: 'border-t-indigo-500',
  },
  technical: {
    accentBg: 'bg-violet-500',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
    border: 'border-t-violet-500',
  },
  final_round: {
    accentBg: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    border: 'border-t-amber-500',
  },
  offer: {
    accentBg: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    border: 'border-t-emerald-500',
  },
  rejected: {
    accentBg: 'bg-rose-500',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    border: 'border-t-rose-400',
  },
  ghosted: {
    accentBg: 'bg-zinc-400',
    badge: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    border: 'border-t-zinc-400',
  },
  withdrawn: {
    accentBg: 'bg-orange-400',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    border: 'border-t-orange-400',
  },
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  applications,
  statuses,
  onStatusChange,
  onSelectApplication,
  onQuickAdd,
}) => {
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const appId = parseInt(draggableId, 10);
    const newStatus = destination.droppableId;
    onStatusChange(appId, newStatus);
  };

  // Group applications by status key
  const groupedApps: { [key: string]: Application[] } = {};
  statuses.forEach((status) => {
    groupedApps[status.key] = [];
  });

  applications.forEach((app) => {
    if (groupedApps[app.status]) {
      groupedApps[app.status].push(app);
    } else {
      groupedApps[app.status] = [app];
    }
  });

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 select-none items-start">
        {statuses.map((status) => {
          const appsInColumn = groupedApps[status.key] || [];
          const theme = statusThemes[status.key] || {
            accentBg: 'bg-blue-500',
            badge: 'bg-blue-50 text-blue-700 border-blue-200',
            border: 'border-t-blue-500',
          };

          return (
            <div
              key={status.key}
              className={`flex-shrink-0 w-[304px] flex flex-col bg-[#f8fafc] border border-slate-200/90 border-t-[3px] ${theme.border} rounded-xl p-3 shadow-2xs`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 py-1 mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${theme.accentBg}`} />
                  <span className="text-[13px] font-bold text-slate-800 tracking-tight">
                    {status.label}
                  </span>
                  <span className={`text-[11px] font-bold border px-2 py-0.2 rounded-full shadow-2xs ${theme.badge}`}>
                    {appsInColumn.length}
                  </span>
                </div>

                <button
                  onClick={() => onQuickAdd(status.key)}
                  title={`Add application to ${status.label}`}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Droppable Column */}
              <Droppable droppableId={status.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 rounded-lg transition-colors overflow-y-auto min-h-[140px] max-h-[calc(100vh-210px)] pr-0.5 space-y-2 ${
                      snapshot.isDraggingOver ? 'bg-slate-200/50 ring-1 ring-slate-300' : ''
                    }`}
                  >
                    {appsInColumn.map((app, index) => (
                      <Draggable key={app.id.toString()} draggableId={app.id.toString()} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                          >
                            <KanbanCard
                              application={app}
                              isDragging={dragSnapshot.isDragging}
                              onClick={() => onSelectApplication(app)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {appsInColumn.length === 0 && !snapshot.isDraggingOver && (
                      <button
                        onClick={() => onQuickAdd(status.key)}
                        className="w-full py-7 border border-dashed border-slate-300 rounded-lg text-slate-400 hover:text-slate-700 hover:border-slate-400 text-xs font-semibold bg-white/70 hover:bg-white transition-all flex items-center justify-center space-x-1.5 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5 text-slate-400" />
                        <span>Add application</span>
                      </button>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
