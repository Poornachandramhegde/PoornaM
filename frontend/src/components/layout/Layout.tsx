import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import { TaskModal } from '../task/TaskModal.js';
import type { ScheduledTask } from '../../types/index.js';

export const Layout: React.FC = () => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);

  const handleOpenCreateTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleTaskSaved = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    // Dispatch custom event to notify current active page to refresh data
    window.dispatchEvent(new CustomEvent('poornam:refresh'));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Header onOpenCreateTask={handleOpenCreateTask} />
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          task={editingTask}
          onClose={() => setIsTaskModalOpen(false)}
          onSuccess={handleTaskSaved}
        />
      )}
    </div>
  );
};
