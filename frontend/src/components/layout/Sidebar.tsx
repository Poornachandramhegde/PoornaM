import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Sparkles,
  Settings as SettingsIcon,
} from 'lucide-react';

interface SidebarProps {
  counts?: {
    todayTasks?: number;
    pendingTodos?: number;
    bucketItems?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ counts }) => {
  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/schedule',
      label: 'Schedule',
      icon: CalendarDays,
      badge: counts?.todayTasks ? counts.todayTasks : null,
    },
    {
      to: '/todo',
      label: 'To-Do',
      icon: CheckSquare,
      badge: counts?.pendingTodos ? counts.pendingTodos : null,
    },
    {
      to: '/bucket',
      label: 'Bucket List',
      icon: Sparkles,
      badge: counts?.bucketItems ? counts.bucketItems : null,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: SettingsIcon,
      badge: null,
    },
  ];

  return (
    <aside className="w-full md:w-60 md:min-h-[calc(100vh-61px)] flex-shrink-0 border-r border-slate-200 bg-white/80 p-4">
      <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && item.badge > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        isActive
                          ? 'bg-slate-800 text-slate-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Helpful philosophy note in sidebar footer */}
      <div className="hidden md:block mt-8 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs text-slate-500">
        <p className="font-semibold text-slate-700 mb-1">PoornaM Workflow</p>
        <p className="leading-relaxed">
          1. Think & capture in <span className="font-medium text-slate-800">To-Do</span>.<br />
          2. Time-block in <span className="font-medium text-slate-800">Schedule</span>.<br />
          3. Long-term aspirations in <span className="font-medium text-slate-800">Bucket List</span>.
        </p>
      </div>
    </aside>
  );
};
