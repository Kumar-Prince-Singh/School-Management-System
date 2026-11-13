import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck2,
  FileBarChart2,
  Activity,
  Settings,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { name: 'Overview', to: '/', icon: LayoutDashboard },
    { name: 'Students', to: '/students', icon: Users },
    { name: 'Classes', to: '/classes', icon: GraduationCap },
    { name: 'Attendance', to: '/attendance', icon: CalendarCheck2 },
    { name: 'Reports', to: '/reports', icon: FileBarChart2 },
    { name: 'System Health', to: '/health', icon: Activity },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-600/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-base leading-tight tracking-tight">
              ALGIONS <span className="text-brand-600">EduCloud</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              School Management
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20 font-semibold'
                      : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50/60'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Candidate & Assessment Attribution Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-3 rounded-xl border">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-700">ALGIONS AI LABS Assessment</span>
          </div>
          <p className="text-xs font-semibold text-brand-700 truncate">Prince Kumar</p>
          <p className="text-[11px] text-slate-500">Reg: 12314718 • DevOps</p>
        </div>
      </aside>
    </>
  );
};
