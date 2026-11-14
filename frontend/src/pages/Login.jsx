import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap, User, Lock, ArrowRight, CheckCircle2,
  Mail, UserPlus, LogIn, Eye, EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { registerApi } from '../api/auth';

/* ─── Shared password visibility toggle ───────────────────────── */
const PasswordInput = ({ value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder || '••••••••••••'}
        required
        className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl
                   focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
                   transition-all placeholder:text-slate-400"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

/* ─── Main Login / Register page ──────────────────────────────── */
export const Login = () => {
  const [tab, setTab] = useState('signin'); // 'signin' | 'signup'
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  /* ── Sign-in state ── */
  const [signIn, setSignIn] = useState({ email: '', password: '' });
  const [signInError, setSignInError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  /* ── Sign-up state ── */
  const [signUp, setSignUp] = useState({
    full_name: '', username: '', email: '', password: '', confirm: '', role: 'staff',
  });
  const [signUpError, setSignUpError] = useState('');
  const [signingUp, setSigningUp] = useState(false);

  /* ──────────────── handlers ──────────────── */
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!signIn.email || !signIn.password) {
      setSignInError('Please enter your email/username and password.');
      return;
    }
    setSigningIn(true);
    setSignInError('');
    try {
      await login(signIn.email, signIn.password);
      showToast('Signed in successfully!', 'success');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid credentials. Please try again.';
      setSignInError(msg);
      showToast(msg, 'error');
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (signUp.password !== signUp.confirm) {
      setSignUpError('Passwords do not match.');
      return;
    }
    if (signUp.password.length < 6) {
      setSignUpError('Password must be at least 6 characters.');
      return;
    }
    setSigningUp(true);
    setSignUpError('');
    try {
      const data = await registerApi({
        username: signUp.username,
        email: signUp.email,
        full_name: signUp.full_name,
        password: signUp.password,
        role: signUp.role,
      });
      // Auto-login after register
      await login(signUp.email, signUp.password);
      showToast(`Welcome, ${data.user.full_name}! Account created.`, 'success');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.';
      setSignUpError(msg);
      showToast(msg, 'error');
    } finally {
      setSigningUp(false);
    }
  };

  const fillDemo = (user, pass) => {
    setSignIn({ email: user, password: pass });
    setSignInError('');
  };

  /* ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-modal border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* ── Left branding panel ── */}
        <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-brand-400/20 rounded-full blur-2xl" />

          <div className="relative z-10">
            {/* Logo row */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">EduCloud</h1>
                <p className="text-xs text-brand-200">School Management Platform</p>
              </div>
            </div>

            <h2 className="text-2xl lg:text-3xl font-extrabold leading-tight text-white mb-4">
              Secure Cloud Deployment &amp; CI/CD Platform
            </h2>
            <p className="text-xs text-brand-100/90 leading-relaxed mb-8">
              Role-based attendance tracking, synthetic student management, automated CI/CD pipeline
              and PostgreSQL backup/recovery — all in one place.
            </p>

            <div className="space-y-3 text-sm text-brand-100">
              {[
                'Strict Teacher-Class Authorization',
                'Duplicate Attendance Prevention',
                'Alembic Migrations & Pytest Suite',
                'GitHub Actions CI/CD Pipeline',
              ].map(f => (
                <div key={f} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom tagline */}
          <div className="relative z-10 pt-8 border-t border-white/10 mt-8">
            <p className="text-xs text-brand-200 leading-relaxed">
              Secure · Scalable · Production-ready
            </p>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">

          {/* Tab switcher */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-7 gap-1">
            <button
              type="button"
              onClick={() => { setTab('signin'); setSignInError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === 'signin'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('signup'); setSignUpError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === 'signup'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </button>
          </div>

          {/* ── SIGN IN ── */}
          {tab === 'signin' && (
            <>
              <div className="mb-5">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h3>
                <p className="text-xs text-slate-500 mt-1">Sign in to your account to continue.</p>
              </div>

              {signInError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {signInError}
                </div>
              )}

              {/* Quick demo fill */}
              <div className="mb-5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Quick 1-Click Demo Fill
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '🛡️ Administrator', sub: 'Full system access', u: 'admin@algions.edu', p: 'Admin@123', cls: 'purple' },
                    { label: '👨‍🏫 Teacher A', sub: 'Class 10-A Assigned', u: 'teacher.a@algions.edu', p: 'Teacher@123', cls: 'blue' },
                    { label: '👩‍🏫 Teacher B', sub: 'Class 10-B Assigned', u: 'teacher.b@algions.edu', p: 'Teacher@123', cls: 'indigo' },
                    { label: '👤 Staff / Viewer', sub: 'Read-only non-teacher', u: 'staff@algions.edu', p: 'Staff@123', cls: 'amber' },
                  ].map(d => (
                    <button
                      key={d.u}
                      type="button"
                      onClick={() => fillDemo(d.u, d.p)}
                      className={`text-left p-2 rounded-xl border transition-colors text-xs
                        bg-${d.cls}-50 hover:bg-${d.cls}-100 border-${d.cls}-200`}
                    >
                      <div className={`font-semibold text-${d.cls}-900`}>{d.label}</div>
                      <div className={`text-[10px] text-${d.cls}-600`}>{d.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Username or Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={signIn.email}
                      onChange={e => setSignIn(s => ({ ...s, email: e.target.value }))}
                      placeholder="e.g. admin@algions.edu"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
                                 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                  <PasswordInput
                    value={signIn.password}
                    onChange={e => setSignIn(s => ({ ...s, password: e.target.value }))}
                  />
                </div>

                <button
                  type="submit"
                  disabled={signingIn}
                  className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-sm
                             shadow-md shadow-brand-600/20 hover:shadow-lg hover:shadow-brand-600/30 transition-all
                             flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {signingIn ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-5 text-center text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className="text-brand-600 font-semibold hover:underline"
                >
                  Create one
                </button>
              </p>
            </>
          )}

          {/* ── SIGN UP ── */}
          {tab === 'signup' && (
            <>
              <div className="mb-5">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h3>
                <p className="text-xs text-slate-500 mt-1">Register as Staff or Teacher to get started.</p>
              </div>

              {signUpError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {signUpError}
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-3.5">
                {/* Full name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={signUp.full_name}
                      onChange={e => setSignUp(s => ({ ...s, full_name: e.target.value }))}
                      placeholder="e.g. Jane Smith"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
                                 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Username</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">@</span>
                    <input
                      type="text"
                      value={signUp.username}
                      onChange={e => setSignUp(s => ({ ...s, username: e.target.value }))}
                      placeholder="e.g. jane_smith"
                      required
                      className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
                                 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={signUp.email}
                      onChange={e => setSignUp(s => ({ ...s, email: e.target.value }))}
                      placeholder="e.g. jane@school.edu"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
                                 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role</label>
                  <select
                    value={signUp.role}
                    onChange={e => setSignUp(s => ({ ...s, role: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
                               transition-all text-slate-700"
                  >
                    <option value="staff">Staff / Viewer</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                  <PasswordInput
                    value={signUp.password}
                    onChange={e => setSignUp(s => ({ ...s, password: e.target.value }))}
                    placeholder="Min. 6 characters"
                  />
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                  <PasswordInput
                    value={signUp.confirm}
                    onChange={e => setSignUp(s => ({ ...s, confirm: e.target.value }))}
                    placeholder="Re-enter password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={signingUp}
                  className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-sm
                             shadow-md shadow-brand-600/20 hover:shadow-lg hover:shadow-brand-600/30 transition-all
                             flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                >
                  {signingUp ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <UserPlus className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-5 text-center text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('signin')}
                  className="text-brand-600 font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
