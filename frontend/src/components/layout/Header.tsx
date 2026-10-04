import React, { useEffect, useState } from 'react';
import { Calendar, Plus, RefreshCw } from 'lucide-react';
import { googleApi } from '../../services/api.js';
import type { GoogleCalendarStatus } from '../../types/index.js';

interface HeaderProps {
  onOpenCreateTask?: () => void;
  onOpenCreateTodo?: () => void;
}

type HeaderSyncState = 'connected' | 'syncing' | 'offline' | 'required';

export const Header: React.FC<HeaderProps> = ({ onOpenCreateTask }) => {
  const [googleStatus, setGoogleStatus] = useState<GoogleCalendarStatus | null>(null);
  const [syncState, setSyncState] = useState<HeaderSyncState>('required');

  const checkStatus = () => {
    googleApi.getStatus()
      .then((data) => {
        setGoogleStatus(data);
        if (data.connected) {
          setSyncState('connected');
        } else {
          setSyncState('required');
        }
      })
      .catch(() => {
        setGoogleStatus({ connected: false });
        setSyncState('offline');
      });
  };

  useEffect(() => {
    checkStatus();

    // Listen to refresh or sync events
    const handleRefresh = () => checkStatus();
    const handleSyncStart = () => setSyncState('syncing');
    const handleSyncEnd = () => checkStatus();

    window.addEventListener('poornam:refresh', handleRefresh);
    window.addEventListener('poornam:sync_start', handleSyncStart);
    window.addEventListener('poornam:sync_end', handleSyncEnd);

    return () => {
      window.removeEventListener('poornam:refresh', handleRefresh);
      window.removeEventListener('poornam:sync_start', handleSyncStart);
      window.removeEventListener('poornam:sync_end', handleSyncEnd);
    };
  }, []);

  const stateConfig = {
    connected: {
      label: 'Google Connected',
      pillClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      dotClass: 'bg-emerald-500',
      tooltip: `Connected to Google Calendar (${googleStatus?.email || 'Primary'})`,
      icon: Calendar,
    },
    syncing: {
      label: 'Google Syncing',
      pillClass: 'border-indigo-200 bg-indigo-50 text-indigo-700',
      dotClass: 'bg-indigo-500 animate-pulse',
      tooltip: 'Synchronizing with Google Calendar...',
      icon: RefreshCw,
    },
    required: {
      label: 'Google Connection Required',
      pillClass: 'border-slate-200 bg-slate-50 text-slate-600',
      dotClass: 'bg-slate-400',
      tooltip: 'Connect Google Calendar in Settings to enable automatic syncing',
      icon: Calendar,
    },
    offline: {
      label: 'Google Offline',
      pillClass: 'border-amber-200 bg-amber-50 text-amber-700',
      dotClass: 'bg-amber-500',
      tooltip: 'Unable to reach backend service',
      icon: Calendar,
    },
  }[syncState];

  const StateIcon = stateConfig.icon;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-3.5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm ring-1 ring-slate-900/10">
          <span className="font-semibold text-lg tracking-tight">P</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 m-0">PoornaM</h1>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              Personal
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">Schedule & Work Manager</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Google Calendar status pill */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${stateConfig.pillClass}`}
          title={stateConfig.tooltip}
        >
          <StateIcon className={`h-3.5 w-3.5 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">{stateConfig.label}</span>
          <span className={`h-1.5 w-1.5 rounded-full ${stateConfig.dotClass}`}></span>
        </div>

        {/* Global Quick Action Button */}
        {onOpenCreateTask && (
          <button
            onClick={onOpenCreateTask}
            id="quick-add-task-btn"
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        )}

        {/* User profile identifier */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
            {googleStatus?.email ? googleStatus.email.charAt(0).toUpperCase() : 'P'}
          </div>
          <span className="text-xs font-medium text-slate-700 hidden lg:inline max-w-[140px] truncate">
            {googleStatus?.email || 'My Workspace'}
          </span>
        </div>
      </div>
    </header>
  );
};
