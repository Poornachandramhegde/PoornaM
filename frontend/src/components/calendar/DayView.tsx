import React from 'react';
import { Plus, Clock, ExternalLink, Calendar as CalendarIcon } from 'lucide-react';
import type { UnifiedScheduleItem, ScheduledTask } from '../../types/index.js';
import { TaskItem } from '../task/TaskItem.js';
import { formatTimeRange } from '../../utils/dateUtils.js';

interface DayViewProps {
  currentDateStr: string;
  items: UnifiedScheduleItem[];
  onCompleteTask: (task: ScheduledTask) => void;
  onEditTask: (task: ScheduledTask) => void;
  onDeleteTask: (taskId: string) => void;
  onSlotClick: (startTime: string) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDateStr,
  items,
  onCompleteTask,
  onEditTask,
  onDeleteTask,
  onSlotClick,
}) => {
  // Generate hours from 06:00 to 23:00 for clean vertical timeline
  const hours = Array.from({ length: 18 }, (_, i) => {
    const hour = i + 6;
    return `${String(hour).padStart(2, '0')}:00`;
  });

  // Group items by their start hour (e.g. "09:00" -> "09")
  const getItemsForHour = (hourStr: string) => {
    const hourPrefix = hourStr.substring(0, 2);
    return items.filter((item) => {
      if (item.date !== currentDateStr) return false;
      const itemHour = (item.startTime || '00:00').substring(0, 2);
      return itemHour === hourPrefix;
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="divide-y divide-slate-100">
        {hours.map((hourStr) => {
          const hourItems = getItemsForHour(hourStr);

          return (
            <div
              key={hourStr}
              className="group flex flex-col sm:flex-row items-stretch min-h-[72px] hover:bg-slate-50/50 transition-colors"
            >
              {/* Time Gutter */}
              <div className="w-24 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100 p-3 sm:text-right flex sm:flex-col justify-between items-center sm:items-end">
                <span className="font-mono text-xs font-semibold text-slate-700">
                  {hourStr}
                </span>
                <button
                  onClick={() => onSlotClick(hourStr)}
                  title={`Add task at ${hourStr}`}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-800 transition rounded p-0.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Tasks / Google Events Content */}
              <div className="flex-1 p-2.5 space-y-2">
                {hourItems.length === 0 ? (
                  <div
                    onClick={() => onSlotClick(hourStr)}
                    className="h-full w-full rounded-lg border border-dashed border-transparent group-hover:border-slate-200 group-hover:bg-slate-50/80 cursor-pointer flex items-center px-3 text-[11px] text-slate-400 opacity-0 group-hover:opacity-100 transition"
                  >
                    + Schedule at {hourStr}
                  </div>
                ) : (
                  hourItems.map((item) => {
                    if (item.source === 'poornam' && item.originalTask) {
                      return (
                        <TaskItem
                          key={`task-${item.id}`}
                          task={item.originalTask}
                          onComplete={onCompleteTask}
                          onEdit={onEditTask}
                          onDelete={onDeleteTask}
                        />
                      );
                    }

                    // Google Calendar Event
                    return (
                      <div
                        key={`google-${item.id}`}
                        className="flex items-start justify-between rounded-xl border border-sky-200 bg-sky-50/60 p-3.5 shadow-xs"
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                            <CalendarIcon className="h-3 w-3" />
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-sky-950 truncate">
                                {item.title}
                              </h3>
                              <span className="rounded-md bg-sky-100 border border-sky-300 px-1.5 py-0.2 text-[10px] font-semibold text-sky-800">
                                Google Calendar
                              </span>
                            </div>

                            <div className="mt-1 flex items-center gap-1.5 text-xs text-sky-800 font-mono">
                              <Clock className="h-3 w-3 text-sky-600" />
                              <span>{formatTimeRange(item.startTime, item.endTime)}</span>
                            </div>

                            {item.description && (
                              <p className="mt-1 text-xs text-sky-800/80 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {item.originalGoogleEvent?.htmlLink && (
                          <a
                            href={item.originalGoogleEvent.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-1.5 text-sky-700 hover:bg-sky-100 transition"
                            title="Open in Google Calendar"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
