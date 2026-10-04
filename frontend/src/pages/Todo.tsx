import React, { useState, useEffect, useCallback } from 'react';
import { Plus, CheckSquare } from 'lucide-react';
import { todoApi } from '../services/api.js';
import type { Todo as TodoType } from '../types/index.js';
import { TodoItem } from '../components/todo/TodoItem.js';
import { TodoModal } from '../components/todo/TodoModal.js';
import { ScheduleTodoModal } from '../components/todo/ScheduleTodoModal.js';

export const Todo: React.FC = () => {
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('PENDING');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoType | null>(null);
  const [schedulingTodo, setSchedulingTodo] = useState<TodoType | null>(null);

  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await todoApi.getTodos();
      setTodos(data);
    } catch (err) {
      console.error('[TodoPage] Error loading todos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();

    const handleRefresh = () => loadTodos();
    window.addEventListener('poornam:refresh', handleRefresh);
    return () => window.removeEventListener('poornam:refresh', handleRefresh);
  }, [loadTodos]);

  const handleToggleComplete = async (todo: TodoType) => {
    try {
      await todoApi.completeTodo(todo.id);
      loadTodos();
    } catch (err) {
      console.error('Failed to toggle todo:', err);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (confirm('Delete this to-do item?')) {
      try {
        await todoApi.deleteTodo(todoId);
        loadTodos();
      } catch (err) {
        console.error('Failed to delete todo:', err);
      }
    }
  };

  const handleEditTodo = (todo: TodoType) => {
    setEditingTodo(todo);
    setIsTodoModalOpen(true);
  };

  // Filtered lists
  const pendingTodos = todos.filter((t) => t.status === 'TODO');
  const completedTodos = todos.filter((t) => t.status === 'COMPLETED');

  const visibleTodos =
    filter === 'PENDING'
      ? pendingTodos
      : filter === 'COMPLETED'
      ? completedTodos
      : todos;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">To-Do List</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tasks to get done without a fixed schedule. Schedule them when you are ready.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTodo(null);
            setIsTodoModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 active:scale-[0.98] transition"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add To-Do</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-xl bg-slate-200/70 p-1 text-xs font-semibold">
          <button
            onClick={() => setFilter('PENDING')}
            className={`rounded-lg px-3 py-1.5 transition ${
              filter === 'PENDING'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({pendingTodos.length})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`rounded-lg px-3 py-1.5 transition ${
              filter === 'COMPLETED'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({completedTodos.length})
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`rounded-lg px-3 py-1.5 transition ${
              filter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({todos.length})
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading to-dos...</div>
        ) : visibleTodos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
            <CheckSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No {filter.toLowerCase()} to-dos</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Capture your thoughts and tasks here before scheduling them.
            </p>
            <button
              onClick={() => {
                setEditingTodo(null);
                setIsTodoModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New To-Do</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggleComplete={handleToggleComplete}
                onSchedule={(t) => setSchedulingTodo(t)}
                onEdit={handleEditTodo}
                onDelete={handleDeleteTodo}
              />
            ))}
          </div>
        )}
      </div>

      {/* Todo Modal */}
      {isTodoModalOpen && (
        <TodoModal
          isOpen={isTodoModalOpen}
          todo={editingTodo}
          onClose={() => {
            setIsTodoModalOpen(false);
            setEditingTodo(null);
          }}
          onSuccess={() => {
            setIsTodoModalOpen(false);
            setEditingTodo(null);
            loadTodos();
          }}
        />
      )}

      {/* Schedule Modal */}
      {schedulingTodo && (
        <ScheduleTodoModal
          isOpen={Boolean(schedulingTodo)}
          todo={schedulingTodo}
          onClose={() => setSchedulingTodo(null)}
          onSuccess={() => {
            setSchedulingTodo(null);
            loadTodos();
          }}
        />
      )}
    </div>
  );
};
