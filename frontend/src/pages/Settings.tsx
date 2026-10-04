import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Unlink,
  Info,
  Check,
} from 'lucide-react';
import { googleApi } from '../services/api.js';
import type { GoogleCalendarStatus } from '../types/index.js';

export const Settings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<GoogleCalendarStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const googleConnectedParam = searchParams.get('google');
  const googleErrorParam = searchParams.get('google_error');

  useEffect(() => {
    if (googleConnectedParam === 'connected') {
      setToastMessage({
        type: 'success',
        text: 'Google Calendar successfully connected! Scheduled tasks will now automatically sync.',
      });
      searchParams.delete('google');
      setSearchParams(searchParams, { replace: true });
    } else if (googleErrorParam) {
      setToastMessage({
        type: 'error',
        text: `Failed to connect Google Calendar: ${decodeURIComponent(googleErrorParam)}`,
      });
      searchParams.delete('google_error');
      setSearchParams(searchParams, { replace: true });
    }
  }, [googleConnectedParam, googleErrorParam, searchParams, setSearchParams]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const data = await googleApi.getStatus();
      setStatus(data);
    } catch (err) {
      console.error('[Settings] Error fetching status:', err);
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleConnect = () => {
    window.location.href = '/api/google/auth';
  };

  const handleDisconnect = async () => {
    if (confirm('Disconnect Google Calendar? PoornaM will no longer sync events with Google.')) {
      try {
        setActionLoading(true);
        await googleApi.disconnect();
        setToastMessage({
          type: 'success',
          text: 'Google Calendar disconnected.',
        });
        loadStatus();
        window.dispatchEvent(new CustomEvent('poornam:refresh'));
      } catch (err: any) {
        setToastMessage({
          type: 'error',
          text: err.message || 'Failed to disconnect Google Calendar',
        });
      } finally {
        setActionLoading(false);
      }
    }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Integrations and personal workspace preferences
        </p>
      </div>

      {/* Notifications / Alerts */}
      {toastMessage && (
        <div
          className={`flex items-start gap-3 rounded-2xl p-4 border text-xs ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1 font-medium">{toastMessage.text}</div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Google Calendar Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        {/* Card Title & Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-sky-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 m-0">Google Calendar</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Two-way calendar synchronization
              </p>
            </div>
          </div>

          {!loading && (
            <div>
              {status?.connected ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>Connected</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                  <span>Not connected</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content based on status */}
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Checking Google Calendar connection...
          </div>
        ) : status?.connected ? (
          /* Connected State: Clean details + Disconnect button only */
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-500 font-medium">Google Account</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {status.email || 'Connected'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 font-medium">Calendar</span>
                <span className="font-semibold text-slate-800">
                  {status.calendarId === 'primary' ? 'Primary' : status.calendarId || 'Primary'}
                </span>
              </div>
            </div>

            {/* Sync Confirmation Note */}
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3">
              <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>Scheduled tasks automatically sync with Google Calendar.</span>
            </div>

            {/* Disconnect Action */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleDisconnect}
                disabled={actionLoading}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition active:scale-[0.98] disabled:opacity-50"
              >
                <Unlink className="h-3.5 w-3.5" />
                <span>{actionLoading ? 'Disconnecting...' : 'Disconnect'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Disconnected State: Clear prompt + Connect button */
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed m-0">
              Connect your Google Calendar to automatically sync scheduled PoornaM tasks.
            </p>

            <div className="pt-1 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                One-time connection. Tokens persist safely in local SQLite.
              </span>

              <button
                onClick={handleConnect}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition active:scale-[0.98]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Connect Google Calendar</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* OAuth Setup Guide info card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-xs text-slate-600 space-y-2.5">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <Info className="h-4 w-4 text-slate-500" />
          <span>OAuth Environment Configuration</span>
        </div>
        <p className="leading-relaxed">
          Google Calendar credentials are read securely from backend environment variables:
        </p>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 font-mono text-[11px] text-slate-700 space-y-1">
          <div>GOOGLE_REDIRECT_URI: <span className="text-slate-900 font-semibold">http://localhost:5000/api/google/callback</span></div>
          <div>Development: <span className="text-slate-500">http://localhost:5173</span> | Production: <span className="text-slate-500">https://your-domain.com</span></div>
        </div>
      </div>
    </div>
  );
};
