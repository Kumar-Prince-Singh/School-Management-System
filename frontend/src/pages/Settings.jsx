import React from 'react';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Key,
  Database,
  Server,
  FileText,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Settings = () => {
  const { user, login } = useAuth();
  const { showToast } = useToast();

  const demoAccounts = [
    {
      name: 'Administrator',
      email: 'admin@algions.edu',
      pass: 'Admin@123',
      role: 'admin',
      desc: 'Complete system privileges: manage students, classes, attendance, and audit logs.',
    },
    {
      name: 'Teacher A (Dr. Vikram Malhotra)',
      email: 'teacher.a@algions.edu',
      pass: 'Teacher@123',
      role: 'teacher',
      desc: 'Assigned to Class 10-A. Can only record attendance for Class 10-A.',
    },
    {
      name: 'Teacher B (Prof. Ananya Sen)',
      email: 'teacher.b@algions.edu',
      pass: 'Teacher@123',
      role: 'teacher',
      desc: 'Assigned to Class 10-B. Can only record attendance for Class 10-B.',
    },
    {
      name: 'Staff (Academic Counselor)',
      email: 'staff@algions.edu',
      pass: 'Staff@123',
      role: 'staff',
      desc: 'Read-only viewer. Attendance submission requests receive HTTP 403 Forbidden.',
    },
  ];

  const handleSwitch = async (account) => {
    try {
      await login(account.email, account.pass);
      showToast(`Switched account to ${account.name}`, 'success');
    } catch (err) {
      showToast('Account switch failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings & Reviewer Hub</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Project metadata, candidate profile, and RBAC testing switcher for ALGIONS AI LABS review.
        </p>
      </div>

      {/* Candidate Profile Card */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-800 rounded-3xl p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-black border border-white/20 shadow-inner">
            PK
          </div>
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 uppercase tracking-wide">
              Candidate Information
            </span>
            <h3 className="text-2xl font-extrabold text-white mt-1">Prince Kumar</h3>
            <p className="text-sm text-brand-100">
              Registration Number: <strong>12314718</strong> • DevOps & Cloud Engineering
            </p>
            <p className="text-xs text-brand-200 mt-0.5">ALGIONS AI LABS PRIVATE LIMITED</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/10 text-xs space-y-1">
          <p className="font-semibold text-white">Current Session:</p>
          <p className="text-brand-100 font-medium">{user?.full_name} ({user?.email})</p>
          <span className="inline-block mt-1 font-bold uppercase tracking-wider text-[10px] bg-white text-brand-700 px-2 py-0.5 rounded-full">
            Active Role: {user?.role}
          </span>
        </div>
      </div>

      {/* Demo Account Switcher Section */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900">Reviewer 1-Click Role Switcher</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Test authorization rules, teacher-class locks, and 403 Forbidden enforcement with one click:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demoAccounts.map((acc) => {
            const isActive = user?.email === acc.email;
            return (
              <div
                key={acc.email}
                className={`p-4 rounded-2xl border transition-all ${
                  isActive
                    ? 'border-brand-500 bg-brand-50/50 shadow-sm ring-1 ring-brand-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{acc.name}</h4>
                    <p className="text-xs font-mono text-slate-500">{acc.email}</p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{acc.desc}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {acc.role}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">Password: {acc.pass}</span>
                  <button
                    onClick={() => handleSwitch(acc)}
                    disabled={isActive}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-800 cursor-default'
                        : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                    }`}
                  >
                    {isActive ? 'Current Account' : 'Switch to this User'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tech Stack & Architecture Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-brand-600" />
            Backend & Infrastructure Stack
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">Framework</span>
              <span className="font-semibold text-slate-900">Python 3.11 + FastAPI</span>
            </li>
            <li className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">Database Engine</span>
              <span className="font-semibold text-slate-900">PostgreSQL + SQLAlchemy ORM</span>
            </li>
            <li className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">Database Migrations</span>
              <span className="font-semibold text-slate-900">Alembic Version Control</span>
            </li>
            <li className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">Containerization</span>
              <span className="font-semibold text-slate-900">Docker + Docker Compose</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="font-medium text-slate-500">Reverse Proxy</span>
              <span className="font-semibold text-slate-900">Nginx (HTTPS + Upstream Routing)</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-600" />
            Security & DevOps Controls
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">Authentication</span>
              <span className="font-semibold text-slate-900">JWT Bearer (HS256) + Bcrypt</span>
            </li>
            <li className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">Testing Framework</span>
              <span className="font-semibold text-slate-900">Pytest Acceptance Test Suite</span>
            </li>
            <li className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">Database Recovery</span>
              <span className="font-semibold text-slate-900">pg_dump Automated Scripts</span>
            </li>
            <li className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-medium text-slate-500">Observability</span>
              <span className="font-semibold text-slate-900">Structured Request Logs + Health Probes</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="font-medium text-slate-500">CI/CD Pipeline</span>
              <span className="font-semibold text-slate-900">GitHub Actions (Test, Lint, Docker)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
