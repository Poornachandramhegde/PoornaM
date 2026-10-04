import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, AlertTriangle, Check, Sparkles } from 'lucide-react';
import { bucketApi } from '../../services/api.js';
import type { BucketItem, BucketStatus } from '../../types/index.js';

interface BucketModalProps {
  isOpen: boolean;
  item?: BucketItem | null;
  onClose: () => void;
  onSuccess: (item: BucketItem) => void;
}

export const BucketModal: React.FC<BucketModalProps> = ({
  isOpen,
  item,
  onClose,
  onSuccess,
}) => {
  const isEditing = Boolean(item?.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState<BucketStatus>('PLANNED');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || '');
      setCategory(item.category || '');
      setTargetDate(item.targetDate || '');
      setStatus(item.status);
    } else {
      setTitle('');
      setDescription('');
      setCategory('');
      setTargetDate('');
      setStatus('PLANNED');
    }
    setErrorMessage(null);
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Goal title is required');
      return;
    }

    setLoading(true);

    try {
      if (isEditing && item) {
        const res = await bucketApi.updateItem(item.id, {
          title: title.trim(),
          description: description.trim() || null,
          category: category.trim() || null,
          targetDate: targetDate || null,
          status,
        });
        onSuccess(res as any);
      } else {
        const res = await bucketApi.createItem({
          title: title.trim(),
          description: description.trim() || null,
          category: category.trim() || null,
          targetDate: targetDate || null,
          status,
        });
        onSuccess(res as any);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save bucket item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {isEditing ? 'Edit Bucket Item' : 'New Bucket Goal'}
              </h2>
              <p className="text-xs text-slate-500">Long-term aspiration or milestone</p>
            </div>
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
              Goal / Aspiration <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Learn State Space Models, Publish research paper"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
              autoFocus
            />
          </div>

          {/* Category & Target Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <Tag className="h-3 w-3 text-slate-400" /> Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Research, Tech, Personal"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" /> Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Status
            </label>
            <div className="flex gap-2">
              {(['PLANNED', 'IN_PROGRESS', 'COMPLETED'] as BucketStatus[]).map((s) => {
                const isSelected = status === s;
                const labels: Record<BucketStatus, string> = {
                  PLANNED: 'Planned',
                  IN_PROGRESS: 'In Progress',
                  COMPLETED: 'Completed',
                };
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`flex-1 rounded-xl py-1.5 text-xs font-medium border transition ${
                      isSelected
                        ? s === 'COMPLETED'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold'
                          : s === 'IN_PROGRESS'
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                          : 'bg-slate-100 border-slate-300 text-slate-800 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {labels[s]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Notes & Motivation (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why this matters, resources, or milestones..."
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
              <span>{loading ? 'Saving...' : isEditing ? 'Update Goal' : 'Save Goal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
