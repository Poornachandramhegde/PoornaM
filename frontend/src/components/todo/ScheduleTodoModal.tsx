import React, { useState } from 'react';
import { X, Calendar, Clock, AlertTriangle, Check, ArrowRight } from 'lucide-react';
import { todoApi } from '../../services/api.js';
import type { Todo, Priority } from '../../types/index.js';
import { getTodayDateString } from '../../utils/dateUtils.js';

interface ScheduleTodoModalProps {
  isOpen: boolean;
  todo: Todo | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ScheduleTodoModal: React.FC<ScheduleTodoModalProps> = ({
  isOpen,
  todo,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !todo) return null;

  const [date, setDate] = useState(todo.dueDate || getTodayDateString());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [priority, setPriority] = useState<Priority>(todo.priority || 'MEDIUM');
  const [category, setCategory] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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
      await todoApi.scheduleTodo(todo.id, {
        date,
        startTime,
        endTime,
        priority,
        category: category.trim() || null,
      });
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to schedule to-do');
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('poornam:sync_end'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <ArrowRight className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Schedule To-Do</h2>
              <p className="text-xs text-slate-500">Allocate a date & time slot in your schedule</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Todo Preview */}
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
            <p className="text-xs text-slate-500 font-medium mb-0.5">To-Do Item</p>
            <p className="text-sm font-semibold text-slate-800">{todo.title}</p>
            {todo.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{todo.description}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-400" /> Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
            />
          </div>

          {/* Start & End Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" /> Start Time <span className="text-rose-500">*</span>
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
                <Clock className="h-3 w-3 text-slate-400" /> End Time <span className="text-rose-500">*</span>
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

          {/* Priority */}
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

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Category (Optional)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Research, College, Project"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
            />
          </div>

          {/* Footer */}
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
              <span>{loading ? 'Scheduling...' : 'Confirm & Add to Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
