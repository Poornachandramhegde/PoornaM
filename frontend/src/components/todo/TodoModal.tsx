import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertTriangle, Check } from 'lucide-react';
import { todoApi } from '../../services/api.js';
import type { Todo, Priority } from '../../types/index.js';

interface TodoModalProps {
  isOpen: boolean;
  todo?: Todo | null;
  onClose: () => void;
  onSuccess: (todo: Todo) => void;
}

export const TodoModal: React.FC<TodoModalProps> = ({
  isOpen,
  todo,
  onClose,
  onSuccess,
}) => {
  const isEditing = Boolean(todo?.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setDueDate(todo.dueDate || '');
      setPriority(todo.priority);
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('MEDIUM');
    }
    setErrorMessage(null);
  }, [todo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Title is required');
      return;
    }

    setLoading(true);

    try {
      if (isEditing && todo) {
        const res = await todoApi.updateTodo(todo.id, {
          title: title.trim(),
          description: description.trim() || null,
          dueDate: dueDate || null,
          priority,
        });
        onSuccess(res as any);
      } else {
        const res = await todoApi.createTodo({
          title: title.trim(),
          description: description.trim() || null,
          dueDate: dueDate || null,
          priority,
        });
        onSuccess(res as any);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save todo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {isEditing ? 'Edit To-Do' : 'Add To-Do'}
            </h2>
            <p className="text-xs text-slate-500">Capture a task without a fixed time slot</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMessage}</span>
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
              placeholder="e.g. Read research paper, Buy notebook"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
              autoFocus
            />
          </div>

          {/* Due date & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" /> Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Priority
              </label>
              <div className="flex gap-1.5">
                {(['LOW', 'MEDIUM', 'HIGH'] as Priority[]).map((p) => {
                  const isSelected = priority === p;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`flex-1 rounded-xl py-2 text-xs font-medium border transition ${
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
              placeholder="Additional details or links..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 resize-none"
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
              <span>{loading ? 'Saving...' : isEditing ? 'Update To-Do' : 'Add To-Do'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
