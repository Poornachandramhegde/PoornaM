import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { taskApi, googleApi } from '../services/api.js';
import type {
  ScheduledTask,
  GoogleCalendarEvent,
  UnifiedScheduleItem,
} from '../types/index.js';
import {
  getTodayDateString,
  addDays,
  formatDateDisplay,
  getWeekDays,
} from '../utils/dateUtils.js';
import { DayView } from '../components/calendar/DayView.js';
import { WeekView } from '../components/calendar/WeekView.js';
import { TaskModal } from '../components/task/TaskModal.js';

export const Schedule: React.FC = () => {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [currentDateStr, setCurrentDateStr] = useState<string>(getTodayDateString());

  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  const [slotStartTime, setSlotStartTime] = useState<string | undefined>();
  const [slotDate, setSlotDate] = useState<string | undefined>();

  const loadScheduleData = useCallback(async () => {
    try {
      setLoading(true);

      // Calculate time range for Google Calendar and tasks
      let startDate = currentDateStr;
      let endDate = currentDateStr;

      if (viewMode === 'week') {
        const weekDays = getWeekDays(currentDateStr);
        startDate = weekDays[0].dateStr;
        endDate = weekDays[6].dateStr;
      }

      // Fetch PoornaM tasks
      const taskPromise = taskApi.getTasks({
        startDate: viewMode === 'week' ? startDate : undefined,
        endDate: viewMode === 'week' ? endDate : undefined,
        date: viewMode === 'day' ? currentDateStr : undefined,
      });

      // Fetch Google Calendar events (start of date to end of date)
      const timeMin = new Date(`${startDate}T00:00:00`).toISOString();
      const timeMax = new Date(`${endDate}T23:59:59`).toISOString();
      const googlePromise = googleApi
        .getEvents({ timeMin, timeMax })
        .catch(() => [] as GoogleCalendarEvent[]);

      const [loadedTasks, loadedGoogleEvents] = await Promise.all([
        taskPromise,
        googlePromise,
      ]);

      setTasks(loadedTasks);
      setGoogleEvents(loadedGoogleEvents);
    } catch (err) {
      console.error('[Schedule] Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  }, [currentDateStr, viewMode]);

  useEffect(() => {
    loadScheduleData();

    const handleRefresh = () => loadScheduleData();
    window.addEventListener('poornam:refresh', handleRefresh);
    return () => window.removeEventListener('poornam:refresh', handleRefresh);
  }, [loadScheduleData]);

  // Navigate dates
  const handlePrev = () => {
    const daysToShift = viewMode === 'week' ? -7 : -1;
    setCurrentDateStr((prev) => addDays(prev, daysToShift));
  };

  const handleNext = () => {
    const daysToShift = viewMode === 'week' ? 7 : 1;
    setCurrentDateStr((prev) => addDays(prev, daysToShift));
  };

  const handleToday = () => {
    setCurrentDateStr(getTodayDateString());
  };

  // Merge tasks and Google Calendar events into unified schedule items
  const unifiedItems: UnifiedScheduleItem[] = React.useMemo(() => {
    const poornaMItems: UnifiedScheduleItem[] = tasks.map((t) => ({
      id: t.id,
      source: 'poornam',
      title: t.title,
      description: t.description,
      date: t.date,
      startTime: t.startTime,
      endTime: t.endTime,
      priority: t.priority,
      status: t.status,
      category: t.category,
      googleEventId: t.googleEventId,
      originalTask: t,
    }));

    // Filter out Google events that were created by PoornaM tasks (to prevent duplicate display)
    const existingGoogleEventIds = new Set(
      tasks.map((t) => t.googleEventId).filter(Boolean)
    );

    const externalGoogleItems: UnifiedScheduleItem[] = googleEvents
      .filter((ge) => !existingGoogleEventIds.has(ge.id))
      .map((ge) => ({
        id: ge.id,
        source: 'google',
        title: ge.title,
        description: ge.description,
        date: ge.date || currentDateStr,
        startTime: ge.startTime || '00:00',
        endTime: ge.endTime || '01:00',
        originalGoogleEvent: ge,
      }));

    return [...poornaMItems, ...externalGoogleItems];
  }, [tasks, googleEvents, currentDateStr]);

  // Task actions
  const handleCompleteTask = async (task: ScheduledTask) => {
    try {
      await taskApi.completeTask(task.id);
      loadScheduleData();
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  const handleEditTask = (task: ScheduledTask) => {
    setEditingTask(task);
    setSlotDate(task.date);
    setSlotStartTime(task.startTime);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Delete this scheduled task? (Will also sync with Google Calendar if connected)')) {
      try {
        await taskApi.deleteTask(taskId);
        loadScheduleData();
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const handleSlotClick = (startTime: string) => {
    setEditingTask(null);
    setSlotDate(currentDateStr);
    setSlotStartTime(startTime);
    setIsTaskModalOpen(true);
  };

  const handleDayAddClick = (dateStr: string) => {
    setEditingTask(null);
    setSlotDate(dateStr);
    setSlotStartTime('09:00');
    setIsTaskModalOpen(true);
  };

  const formattedHeaderDate = () => {
    if (viewMode === 'day') {
      return formatDateDisplay(currentDateStr);
    }
    const weekDays = getWeekDays(currentDateStr);
    return `${formatDateDisplay(weekDays[0].dateStr)} – ${formatDateDisplay(weekDays[6].dateStr)}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Schedule Top Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">Schedule</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Plan and review your daily and weekly time commitments
          </p>
        </div>

        {/* View Controls & Action */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Day / Week Switcher */}
          <div className="flex rounded-xl bg-slate-200/70 p-1 text-xs font-semibold">
            <button
              onClick={() => setViewMode('day')}
              className={`rounded-lg px-3 py-1.5 transition ${
                viewMode === 'day'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`rounded-lg px-3 py-1.5 transition ${
                viewMode === 'week'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Week
            </button>
          </div>

          {/* Date Navigator */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
            <button
              onClick={handlePrev}
              title="Previous"
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              onClick={handleToday}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Today
            </button>

            <button
              onClick={handleNext}
              title="Next"
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadScheduleData}
            title="Refresh schedule"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 shadow-xs transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* New Task Button */}
          <button
            onClick={() => {
              setEditingTask(null);
              setSlotDate(currentDateStr);
              setSlotStartTime('09:00');
              setIsTaskModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 active:scale-[0.98] transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Date Header Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 m-0 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-600" />
          <span>{formattedHeaderDate()}</span>
        </h2>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-800"></span>
            <span>PoornaM Task</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-500"></span>
            <span>Google Event</span>
          </div>
        </div>
      </div>

      {/* Schedule Body */}
      {viewMode === 'day' ? (
        <DayView
          currentDateStr={currentDateStr}
          items={unifiedItems}
          onCompleteTask={handleCompleteTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onSlotClick={handleSlotClick}
        />
      ) : (
        <WeekView
          currentDateStr={currentDateStr}
          items={unifiedItems}
          onCompleteTask={handleCompleteTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onDayAddClick={handleDayAddClick}
        />
      )}

      {/* Task Modal */}
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          task={editingTask}
          initialDate={slotDate || currentDateStr}
          initialStartTime={slotStartTime || '09:00'}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSuccess={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
            loadScheduleData();
          }}
        />
      )}
    </div>
  );
};
