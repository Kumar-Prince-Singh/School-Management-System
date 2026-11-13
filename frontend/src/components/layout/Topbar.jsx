import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  User,
  Shield,
  GraduationCap,
  Eye,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Topbar = ({ onMenuClick }) => {
  const { user, logout, login } = useAuth();
  const { showToast } = useToast();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);

  const demoAccounts = [
    { name: 'Admin (Prince Kumar)', email: 'admin@algions.edu', pass: 'Admin@123', role: 'admin', icon: Shield },
    { name: 'Teacher A (Class 10-A)', email: 'teacher.a@algions.edu', pass: 'Teacher@123', role: 'teacher', icon: GraduationCap },
    { name: 'Teacher B (Class 10-B)', email: 'teacher.b@algions.edu', pass: 'Teacher@123', role: 'teacher', icon: GraduationCap },
    { name: 'Staff (Read Only)', email: 'staff@algions.edu', pass: 'Staff@123', role: 'staff', icon: Eye },
  ];

  const handleSwitchAccount = async (account) => {
    try {
      await login(account.email, account.pass);
      setShowAccountSwitcher(false);
      showToast(`Switched account to ${account.name}`, 'success');
    } catch (err) {
      showToast('Account switch failed', 'error');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'teacher':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'staff':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      {/* Left: Mobile hamburger & search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students, classes, or records..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right: Quick Switcher, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => {
              setShowAccountSwitcher(!showAccountSwitcher);
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200/80 rounded-xl hover:bg-brand-100 transition-all shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="hidden sm:inline">Role:</span>
            <span className="capitalize font-bold">{user?.role || 'Guest'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-brand-500" />
          </button>

          {showAccountSwitcher && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-modal border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Switch Demo Account</p>
                <p className="text-[11px] text-slate-500">Test multi-role RBAC permissions</p>
              </div>
              <div className="p-1.5 space-y-1">
                {demoAccounts.map((acc) => {
                  const Icon = acc.icon;
                  const isCurrent = user?.email === acc.email;
                  return (
                    <button
                      key={acc.email}
                      onClick={() => handleSwitchAccount(acc)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                        isCurrent ? 'bg-brand-50 text-brand-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg ${isCurrent ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{acc.name}</div>
                          <div className="text-[10px] text-slate-400">{acc.email}</div>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-brand-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon with popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowAccountSwitcher(false);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-brand-600 absolute top-2 right-2 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-modal border border-slate-200 p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-900">Notifications</span>
                <span className="text-[11px] font-medium text-brand-600 cursor-pointer">Mark all read</span>
              </div>
              <div className="py-2 space-y-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="font-semibold text-slate-800">Attendance Recorded</p>
                  <p className="text-slate-500 mt-0.5">Teacher A submitted morning session for Class 10-A.</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Just now</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="font-semibold text-slate-800">System Backup Verification</p>
                  <p className="text-slate-500 mt-0.5">Daily automated backup completed with zero errors.</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Card */}
        <div className="relative pl-2 border-l border-slate-200">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
              setShowAccountSwitcher(false);
            }}
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-brand-100">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {user?.full_name || 'Authenticated User'}
              </div>
              <div className="text-[10px] text-slate-500 capitalize">{user?.role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-modal border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{user?.full_name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRoleBadge(user?.role)}`}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
              <div className="p-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
