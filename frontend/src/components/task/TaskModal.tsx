import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertTriangle, Check, Tag } from 'lucide-react';
import { taskApi } from '../../services/api.js';
import type { ScheduledTask, Priority } from '../../types/index.js';
import { getTodayDateString } from '../../utils/dateUtils.js';

interface TaskModalProps {
  isOpen: boolean;
  task?: ScheduledTask | null;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  onClose: () => void;
  onSuccess: (task: ScheduledTask) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  task,
  initialDate,
  initialStartTime,
  initialEndTime,
  onClose,
  onSuccess,
}) => {
  const isEditing = Boolean(task?.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(initialDate || getTodayDateString());
  const [startTime, setStartTime] = useState(initialStartTime || '09:00');
  const [endTime, setEndTime] = useState(initialEndTime || '10:00');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [category, setCategory] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syncWarning, setSyncWarning] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDate(task.date);
      setStartTime(task.startTime);
      setEndTime(task.endTime);
      setPriority(task.priority);
      setCategory(task.category || '');
    } else {
      setTitle('');
      setDescription('');
      setDate(initialDate || getTodayDateString());
      setStartTime(initialStartTime || '09:00');
      setEndTime(initialEndTime || '10:00');
      setPriority('MEDIUM');
      setCategory('');
    }
    setErrorMessage(null);
    setSyncWarning(null);
  }, [task, initialDate, initialStartTime, initialEndTime, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSyncWarning(null);

    if (!title.trim()) {
      setErrorMessage('Task title is required');
      return;
    }

    if (!date) {
      setErrorMessage('Date is required');
      return;
    }

    if (!startTime || !endTime) {
      setErrorMessage('Start and end times are required');
      return;
    }

    if (startTime >= endTime) {
      setErrorMessage('End time must be after start time');
      return;
    }

    setLoading(true);
    window.dispatchEvent(new CustomEvent('poornam:sync_start'));

    try {
      if (isEditing && task) {
        const res = await taskApi.updateTask(task.id, {
          title: title.trim(),
          description: description.trim() || null,
          date,
          startTime,
          endTime,
          priority,
          category: category.trim() || null,
        });
        onSuccess(res as any);
      } else {
        const res = await taskApi.createTask({
          title: title.trim(),
          description: description.trim() || null,
          date,
          startTime,
          endTime,
          priority,
          category: category.trim() || null,
          status: 'TODO',
        });
        onSuccess(res as any);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('poornam:sync_end'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {isEditing ? 'Edit Scheduled Task' : 'Create Scheduled Task'}
            </h2>
            <p className="text-xs text-slate-500">
              Add time-bound work to your personal schedule
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {syncWarning && (
            <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
              <span>{syncWarning}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Study Linear Algebra, Project Work"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
              autoFocus
            />
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" /> Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" /> Start
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" /> End
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
              />
            </div>
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Priority
              </label>
              <div className="flex gap-2">
                {(['LOW', 'MEDIUM', 'HIGH'] as Priority[]).map((p) => {
                  const isSelected = priority === p;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`flex-1 rounded-xl py-1.5 text-xs font-medium border transition ${
                        isSelected
                          ? p === 'HIGH'
                            ? 'bg-rose-50 border-rose-300 text-rose-700 font-semibold'
                            : p === 'MEDIUM'
                            ? 'bg-amber-50 border-amber-300 text-amber-700 font-semibold'
                            : 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <Tag className="h-3 w-3 text-slate-400" /> Category (Optional)
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Academics, Project, Gym"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key notes, links, agenda..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 active:scale-[0.98] transition disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{loading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
