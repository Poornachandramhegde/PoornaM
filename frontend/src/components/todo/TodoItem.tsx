import React from 'react';
import { Check, Calendar, ArrowRight, Trash2, Edit2 } from 'lucide-react';
import type { Todo } from '../../types/index.js';
import { formatDateDisplay } from '../../utils/dateUtils.js';

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (todo: Todo) => void;
  onSchedule: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todoId: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleComplete,
  onSchedule,
  onEdit,
  onDelete,
}) => {
  const isCompleted = todo.status === 'COMPLETED';

  const priorityStyles = {
    LOW: 'bg-slate-100 text-slate-600 border-slate-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
  }[todo.priority] || 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <div
      className={`group flex items-start justify-between rounded-xl border p-3.5 transition-all ${
        isCompleted
          ? 'bg-slate-50/70 border-slate-200 opacity-60'
          : 'bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:shadow'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Checkbox button */}
        <button
          onClick={() => onToggleComplete(todo)}
          title={isCompleted ? 'Mark pending' : 'Mark completed'}
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
            <span
              className={`text-sm font-medium leading-snug ${
                isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
              }`}
            >
              {todo.title}
            </span>

            {/* Priority Badge */}
            <span className={`rounded-md border px-1.5 py-0.2 text-[10px] font-semibold ${priorityStyles}`}>
              {todo.priority}
            </span>

            {/* Due date if set */}
            {todo.dueDate && (
              <span className="flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.2 text-[10px] text-slate-600">
                <Calendar className="h-2.5 w-2.5" />
                <span>Due {formatDateDisplay(todo.dueDate)}</span>
              </span>
            )}
          </div>

          {todo.description && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {todo.description}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 ml-2">
        {!isCompleted && (
          <button
            onClick={() => onSchedule(todo)}
            title="Convert to Scheduled Task"
            className="flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-200/80 px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition"
          >
            <span>Schedule</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        )}

        <button
          onClick={() => onEdit(todo)}
          title="Edit"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={() => onDelete(todo.id)}
          title="Delete"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
