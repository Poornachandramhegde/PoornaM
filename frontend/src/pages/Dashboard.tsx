import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Plus,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';
import { taskApi, todoApi, bucketApi } from '../services/api.js';
import type { ScheduledTask, Todo, BucketItem } from '../types/index.js';
import { getTodayDateString, formatDateDisplay, formatTimeRange } from '../utils/dateUtils.js';
import { TaskItem } from '../components/task/TaskItem.js';
import { TaskModal } from '../components/task/TaskModal.js';
import { TodoModal } from '../components/todo/TodoModal.js';
import { ScheduleTodoModal } from '../components/todo/ScheduleTodoModal.js';

export const Dashboard: React.FC = () => {
  const [todayTasks, setTodayTasks] = useState<ScheduledTask[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<ScheduledTask[]>([]);
  const [pendingTodos, setPendingTodos] = useState<Todo[]>([]);
  const [bucketPreview, setBucketPreview] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [schedulingTodo, setSchedulingTodo] = useState<Todo | null>(null);

  const todayStr = getTodayDateString();

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [allTasks, todos, buckets] = await Promise.all([
        taskApi.getTasks(),
        todoApi.getTodos({ status: 'TODO' }),
        bucketApi.getItems(),
      ]);

      // Today tasks
      const today = allTasks.filter((t) => t.date === todayStr);
      setTodayTasks(today);

      // Upcoming tasks (dates after today)
      const upcoming = allTasks
        .filter((t) => t.date > todayStr)
        .slice(0, 5);
      setUpcomingTasks(upcoming);

      // Pending todos (limit to first 6 for dashboard preview)
      setPendingTodos(todos.slice(0, 6));

      // Bucket items preview (planned or in-progress, limit 4)
      const activeBuckets = buckets
        .filter((b) => b.status !== 'COMPLETED')
        .slice(0, 4);
      setBucketPreview(activeBuckets);
    } catch (err) {
      console.error('[Dashboard] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [todayStr]);

  useEffect(() => {
    loadDashboardData();

    const handleRefresh = () => loadDashboardData();
    window.addEventListener('poornam:refresh', handleRefresh);
    return () => window.removeEventListener('poornam:refresh', handleRefresh);
  }, [loadDashboardData]);

  // Task actions
  const handleToggleTask = async (task: ScheduledTask) => {
    try {
      await taskApi.completeTask(task.id);
      loadDashboardData();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Delete this scheduled task?')) {
      try {
        await taskApi.deleteTask(taskId);
        loadDashboardData();
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    try {
      await todoApi.completeTodo(todo.id);
      loadDashboardData();
    } catch (err) {
      console.error('Failed to toggle todo:', err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {formatDateDisplay(todayStr)} · Welcome to your personal focus hub
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTodoModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-[0.98] transition"
          >
            <Plus className="h-3.5 w-3.5 text-slate-500" />
            <span>Add To-Do</span>
          </button>

          <button
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 active:scale-[0.98] transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Schedule Task</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Today's Schedule (2 cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today Section */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 m-0">Today's Schedule</h2>
                  <p className="text-xs text-slate-400">Time-blocked tasks for today</p>
                </div>
              </div>

              <Link
                to="/schedule"
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                <span>Full Schedule</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading schedule...</div>
            ) : todayTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                <p className="text-sm font-medium text-slate-700">No tasks scheduled for today</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Keep your focus sharp by time-blocking your day.
                </p>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add First Task for Today</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={handleToggleTask}
                    onEdit={(t) => {
                      setEditingTask(t);
                      setIsTaskModalOpen(true);
                    }}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Upcoming Tasks Section */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 m-0">Upcoming Work</h2>
                  <p className="text-xs text-slate-400">What lies ahead in the coming days</p>
                </div>
              </div>

              <Link
                to="/schedule"
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading...</div>
            ) : upcomingTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 italic">
                No upcoming scheduled tasks ahead.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between py-3 hover:bg-slate-50/60 px-2 rounded-lg transition"
                  >
                    <div>
                      <h3 className="text-sm font-medium text-slate-800 m-0">{task.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">
                          {formatDateDisplay(task.date)}
                        </span>
                        <span>·</span>
                        <span className="font-mono">
                          {formatTimeRange(task.startTime, task.endTime)}
                        </span>
                        {task.category && (
                          <>
                            <span>·</span>
                            <span className="text-slate-600">{task.category}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        task.priority === 'HIGH'
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : task.priority === 'MEDIUM'
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Pending To-Dos & Bucket List Preview */}
        <div className="space-y-6">
          {/* Pending To-Dos Card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckSquare className="h-4 w-4" />
                </span>
                <h2 className="text-base font-semibold text-slate-900 m-0">Pending To-Dos</h2>
              </div>

              <Link
                to="/todo"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                View all ({pendingTodos.length})
              </Link>
            </div>

            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading...</div>
            ) : pendingTodos.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-xs text-slate-500 font-medium">All caught up!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No pending to-dos right now.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="group flex items-start justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-2.5 hover:bg-white hover:border-slate-300 transition"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <button
                        onClick={() => handleToggleTodo(todo)}
                        title="Mark complete"
                        className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-slate-300 bg-white hover:border-slate-500 text-transparent"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-medium text-slate-800 truncate">
                        {todo.title}
                      </span>
                    </div>

                    <button
                      onClick={() => setSchedulingTodo(todo)}
                      title="Schedule this todo"
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 transition"
                    >
                      <span>Schedule</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Bucket List Preview */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Sparkles className="h-4 w-4" />
                </span>
                <h2 className="text-base font-semibold text-slate-900 m-0">Bucket List</h2>
              </div>

              <Link
                to="/bucket"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                View all
              </Link>
            </div>

            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading...</div>
            ) : bucketPreview.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-xs text-slate-500 font-medium">No bucket items yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Write down your long-term aspirations.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {bucketPreview.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-3 hover:bg-white hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold text-slate-900 truncate m-0">
                        {item.title}
                      </h3>
                      <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.2 text-[9px] font-semibold text-slate-600">
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    {item.category && (
                      <p className="text-[11px] text-slate-500 mt-1">{item.category}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          task={editingTask}
          initialDate={todayStr}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSuccess={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
            loadDashboardData();
          }}
        />
      )}

      {/* Todo Modal */}
      {isTodoModalOpen && (
        <TodoModal
          isOpen={isTodoModalOpen}
          onClose={() => setIsTodoModalOpen(false)}
          onSuccess={() => {
            setIsTodoModalOpen(false);
            loadDashboardData();
          }}
        />
      )}

      {/* Schedule Todo Modal */}
      {schedulingTodo && (
        <ScheduleTodoModal
          isOpen={Boolean(schedulingTodo)}
          todo={schedulingTodo}
          onClose={() => setSchedulingTodo(null)}
          onSuccess={() => {
            setSchedulingTodo(null);
            loadDashboardData();
          }}
        />
      )}
    </div>
  );
};
