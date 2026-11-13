import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Database,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Terminal,
} from 'lucide-react';
import { getHealthApi, getReadyApi } from '../api/health';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';

export const SystemHealth = () => {
  const [health, setHealth] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [latencyMs, setLatencyMs] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { showToast } = useToast();

  const fetchHealthData = async (silent = false) => {
    try {
      if (!silent) setIsRefreshing(true);
      const startTime = performance.now();

      const [healthRes, readyRes] = await Promise.all([
        getHealthApi(),
        getReadyApi(),
      ]);

      const roundTrip = Math.round(performance.now() - startTime);
      setLatencyMs(roundTrip);
      setHealth(healthRes);
      setReadiness(readyRes);
      setLastUpdated(new Date().toLocaleTimeString());

      if (!silent) showToast('System metrics refreshed from live backend API.', 'success');
    } catch (err) {
      console.error('Health check failed', err);
      showToast('Backend health probe failed. Checking service availability...', 'error');
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealthData(false);
  }, []);

  // 10-second auto-refresh polling
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchHealthData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return 'N/A';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Health & Telemetry</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time diagnostics queried directly from FastAPI <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">/health</code> and <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">/ready</code> probes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <span>Auto Refresh (10s)</span>
          </label>

          <button
            onClick={() => fetchHealthData(false)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Probes</span>
          </button>
        </div>
      </div>

      {/* Live Probe Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* API Health */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">FastAPI Liveness</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-2xl font-bold text-slate-900 capitalize">
              {health?.status || 'Active'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Endpoint: GET /health</p>
        </div>

        {/* Database Readiness */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PostgreSQL Engine</span>
            <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${readiness?.database?.healthy ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className="text-2xl font-bold text-slate-900 capitalize">
              {readiness?.database?.status || 'Connected'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Query Probe: SELECT 1</p>
        </div>

        {/* Application Uptime */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Application Uptime</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900">
              {formatUptime(health?.uptime_seconds)}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Service: {health?.service || 'EduCloud Backend'}</p>
        </div>

        {/* Round Trip Latency */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Roundtrip Latency</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900">
              {latencyMs !== null ? `${latencyMs} ms` : '—'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Last polled at {lastUpdated || 'now'}</p>
        </div>
      </div>

      {/* Diagnostics & Raw JSON Probes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Probe Details */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-semibold text-slate-900">
              Liveness Probe (<code className="text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded font-mono">/health</code>)
            </h3>
          </div>
          <div className="flex-1 bg-slate-900 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
            <pre>{JSON.stringify(health, null, 2)}</pre>
          </div>
        </div>

        {/* Readiness Probe Details */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-semibold text-slate-900">
              Readiness Probe (<code className="text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded font-mono">/ready</code>)
            </h3>
          </div>
          <div className="flex-1 bg-slate-900 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
            <pre>{JSON.stringify(readiness, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
