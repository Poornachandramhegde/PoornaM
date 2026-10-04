import React from 'react';
import { Calendar, Tag, Edit2, Trash2, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import type { BucketItem, BucketStatus } from '../../types/index.js';
import { formatDateDisplay } from '../../utils/dateUtils.js';

interface BucketCardProps {
  item: BucketItem;
  onEdit: (item: BucketItem) => void;
  onDelete: (itemId: string) => void;
  onStatusChange: (itemId: string, status: BucketStatus) => void;
}

export const BucketCard: React.FC<BucketCardProps> = ({
  item,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const statusConfig = {
    PLANNED: {
      label: 'Planned',
      style: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Clock,
    },
    IN_PROGRESS: {
      label: 'In Progress',
      style: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Sparkles,
    },
    COMPLETED: {
      label: 'Completed',
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    },
  }[item.status] || {
    label: item.status,
    style: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
  };

  const StatusIcon = statusConfig.icon;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig.style}`}
            >
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </span>

            {item.category && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                <Tag className="h-2.5 w-2.5 text-slate-400" />
                {item.category}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(item)}
              title="Edit Goal"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              title="Delete Goal"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          className={`text-base font-semibold text-slate-900 leading-snug mb-2 ${
            item.status === 'COMPLETED' ? 'line-through text-slate-400' : ''
          }`}
        >
          {item.title}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
            {item.description}
          </p>
        )}
      </div>

      {/* Card Footer: Target Date & Status Quick Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="text-xs text-slate-400 flex items-center gap-1">
          {item.targetDate ? (
            <>
              <Calendar className="h-3 w-3 text-slate-400" />
              <span>Target: {formatDateDisplay(item.targetDate)}</span>
            </>
          ) : (
            <span className="text-[11px]">No target date</span>
          )}
        </div>

        {/* Status Dropdown / Quick switcher */}
        <select
          value={item.status}
          onChange={(e) => onStatusChange(item.id, e.target.value as BucketStatus)}
          className="rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-1 text-xs font-medium text-slate-700 focus:border-slate-800 focus:outline-none"
        >
          <option value="PLANNED">Planned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>
    </div>
  );
};
