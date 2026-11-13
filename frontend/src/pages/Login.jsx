import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Shield, User, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setErrorMsg('Please enter both username/email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await login(usernameOrEmail, password);
      showToast('Signed in successfully!', 'success');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid username or password. Please try again.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCredentials = (user, pass) => {
    setUsernameOrEmail(user);
    setPassword(pass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-modal border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Branding Side */}
        <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle geometric circles decoration */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-brand-400/20 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-brand-100 mb-6 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              ALGIONS AI LABS Internship Assessment
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">ALGIONS EduCloud</h1>
                <p className="text-xs text-brand-200">School Management Platform</p>
              </div>
            </div>

            <h2 className="text-2xl lg:text-3xl font-extrabold leading-tight text-white mb-4">
              Secure Cloud Deployment & CI/CD Platform
            </h2>
            <p className="text-xs text-brand-100/90 leading-relaxed mb-6">
              Role-based attendance tracking, synthetic student management, automated CI/CD pipeline and automated PostgreSQL backup/recovery.
            </p>

            <div className="space-y-2.5 text-xs text-brand-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Strict Teacher-Class Authorization</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Duplicate Attendance Prevention</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Alembic Migrations & Pytest Acceptance Suite</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10 mt-8">
            <p className="text-[11px] text-brand-200 uppercase font-semibold tracking-wider">Candidate Details</p>
            <p className="text-sm font-bold text-white">Prince Kumar</p>
            <p className="text-xs text-brand-200">Reg: 12314718 • DevOps & Cloud Engineering</p>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select a synthetic demo account or enter your credentials.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Quick 1-Click Demo Fillers */}
          <div className="mb-6">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Quick 1-Click Demo Fill
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@algions.edu', 'Admin@123')}
                className="text-left p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors text-xs"
              >
                <div className="font-semibold text-purple-900">🛡️ Administrator</div>
                <div className="text-[10px] text-purple-600">Full system access</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('teacher.a@algions.edu', 'Teacher@123')}
                className="text-left p-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors text-xs"
              >
                <div className="font-semibold text-blue-900">👨‍🏫 Teacher A</div>
                <div className="text-[10px] text-blue-600">Class 10-A Assigned</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('teacher.b@algions.edu', 'Teacher@123')}
                className="text-left p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors text-xs"
              >
                <div className="font-semibold text-indigo-900">👩‍🏫 Teacher B</div>
                <div className="text-[10px] text-indigo-600">Class 10-B Assigned</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('staff@algions.edu', 'Staff@123')}
                className="text-left p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors text-xs"
              >
                <div className="font-semibold text-amber-900">👤 Staff / Viewer</div>
                <div className="text-[10px] text-amber-600">Read-only non-teacher</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="e.g. admin@algions.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-brand-600/20 hover:shadow-lg hover:shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

