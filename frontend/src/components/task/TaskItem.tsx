import React from 'react';
import { Check, Clock, Calendar, Edit2, Trash2 } from 'lucide-react';
import type { ScheduledTask } from '../../types/index.js';
import { formatTimeRange } from '../../utils/dateUtils.js';

interface TaskItemProps {
  task: ScheduledTask;
  onComplete: (task: ScheduledTask) => void;
  onEdit: (task: ScheduledTask) => void;
  onDelete: (taskId: string) => void;
  compact?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onComplete,
  onEdit,
  onDelete,
  compact = false,
}) => {
  const isCompleted = task.status === 'COMPLETED';

  const priorityStyles = {
    LOW: 'bg-slate-100 text-slate-600 border-slate-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
  }[task.priority] || 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <div
      className={`group relative flex items-start justify-between rounded-xl border p-3.5 transition-all ${
        isCompleted
          ? 'bg-slate-50/70 border-slate-200 opacity-60'
          : 'bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:shadow'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Checkbox button */}
        <button
          onClick={() => onComplete(task)}
          title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg border transition ${
            isCompleted
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-slate-300 hover:border-slate-500 bg-white text-transparent hover:text-slate-300'
          }`}
        >
          <Check className="h-3 w-3 stroke-[2.5]" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`text-sm font-medium leading-snug ${
                isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
              }`}
            >
              {task.title}
            </h3>

            {/* Priority Badge */}
            <span className={`rounded-md border px-1.5 py-0.2 text-[10px] font-semibold ${priorityStyles}`}>
              {task.priority}
            </span>

            {/* Category */}
            {task.category && (
              <span className="rounded-md bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 text-[10px] font-medium text-indigo-700">
                {task.category}
              </span>
            )}

            {/* Google Sync Badge */}
            {task.googleEventId && (
              <span
                title="Synced with Google Calendar"
                className="flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 px-1.5 py-0.2 text-[10px] font-medium text-blue-700"
              >
                <Calendar className="h-2.5 w-2.5" />
                <span>Google</span>
              </span>
            )}
          </div>

          {/* Time range */}
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Clock className="h-3 w-3 text-slate-400" />
            <span>{formatTimeRange(task.startTime, task.endTime)}</span>
          </div>

          {/* Description if present and not compact */}
          {!compact && task.description && (
            <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity ml-2">
        <button
          onClick={() => onEdit(task)}
          title="Edit Task"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          title="Delete Task"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
