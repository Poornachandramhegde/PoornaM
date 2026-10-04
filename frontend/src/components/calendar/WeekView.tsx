import React from 'react';
import { Plus, Clock, ExternalLink, Calendar as CalendarIcon, Check } from 'lucide-react';
import type { UnifiedScheduleItem, ScheduledTask } from '../../types/index.js';
import { getWeekDays } from '../../utils/dateUtils.js';

interface WeekViewProps {
  currentDateStr: string;
  items: UnifiedScheduleItem[];
  onCompleteTask: (task: ScheduledTask) => void;
  onEditTask: (task: ScheduledTask) => void;
  onDeleteTask: (taskId: string) => void;
  onDayAddClick: (dateStr: string) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDateStr,
  items,
  onCompleteTask,
  onEditTask,
  onDayAddClick,
}) => {
  const weekDays = getWeekDays(currentDateStr);

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
      {weekDays.map(({ dateStr, label, isToday }) => {
        const dayItems = items
          .filter((item) => item.date === dateStr)
          .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

        return (
          <div
            key={dateStr}
            className={`flex flex-col rounded-2xl border transition-all ${
              isToday
                ? 'border-indigo-300 bg-indigo-50/20 shadow-sm ring-1 ring-indigo-200'
                : 'border-slate-200 bg-white shadow-xs'
            }`}
          >
            {/* Day Header */}
            <div
              className={`flex items-center justify-between border-b px-3.5 py-3 ${
                isToday
                  ? 'border-indigo-100 bg-indigo-50/60'
                  : 'border-slate-100 bg-slate-50/50'
              }`}
            >
              <div>
                <span
                  className={`text-xs font-semibold ${
                    isToday ? 'text-indigo-900 font-bold' : 'text-slate-700'
                  }`}
                >
                  {label}
                </span>
                {isToday && (
                  <span className="ml-1.5 rounded-full bg-indigo-600 px-1.5 py-0.2 text-[9px] font-semibold text-white">
                    Today
                  </span>
                )}
              </div>

              <button
                onClick={() => onDayAddClick(dateStr)}
                title={`Add task for ${label}`}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Day Items List */}
            <div className="flex-1 p-2 space-y-2 min-h-[220px]">
              {dayItems.length === 0 ? (
                <div
                  onClick={() => onDayAddClick(dateStr)}
                  className="h-full flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-4 text-center cursor-pointer hover:border-slate-300 hover:bg-slate-50/60 transition group"
                >
                  <p className="text-[11px] text-slate-400 group-hover:text-slate-600">
                    No tasks
                  </p>
                  <span className="text-[10px] text-slate-400 underline mt-0.5">
                    + Add task
                  </span>
                </div>
              ) : (
                dayItems.map((item) => {
                  if (item.source === 'poornam' && item.originalTask) {
                    const task = item.originalTask;
                    const isCompleted = task.status === 'COMPLETED';

                    return (
                      <div
                        key={`week-task-${task.id}`}
                        className={`group relative rounded-xl border p-2.5 transition ${
                          isCompleted
                            ? 'bg-slate-50 border-slate-200 opacity-60'
                            : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <button
                            onClick={() => onCompleteTask(task)}
                            className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition ${
                              isCompleted
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 hover:border-slate-500 bg-white text-transparent'
                            }`}
                          >
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </button>

                          <div className="min-w-0 flex-1">
                            <p
                              onClick={() => onEditTask(task)}
                              className={`text-xs font-semibold truncate cursor-pointer hover:text-indigo-600 ${
                                isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                              }`}
                            >
                              {task.title}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono mt-0.5">
                              <Clock className="h-2.5 w-2.5 text-slate-400" />
                              <span>{task.startTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Google Calendar item in week view
                  return (
                    <div
                      key={`week-google-${item.id}`}
                      className="rounded-xl border border-sky-200 bg-sky-50/70 p-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 truncate font-semibold text-sky-900 text-[11px]">
                          <CalendarIcon className="h-2.5 w-2.5 flex-shrink-0 text-sky-700" />
                          <span className="truncate">{item.title}</span>
                        </div>
                        {item.originalGoogleEvent?.htmlLink && (
                          <a
                            href={item.originalGoogleEvent.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-700 hover:text-sky-900"
                            title="Open Google Calendar"
                          >
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-[10px] text-sky-800 font-mono mt-0.5">
                        {item.startTime} - {item.endTime}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
