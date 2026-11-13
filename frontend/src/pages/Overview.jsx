import React, { useEffect, useState } from 'react';
import {
  Users,
  GraduationCap,
  CalendarCheck2,
  Percent,
  Activity,
  UserCheck,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  getDashboardStatsApi,
  getAttendanceChartApi,
  getClassDistributionApi,
  getRecentActivityApi,
  getRecentAttendanceApi,
} from '../api/dashboard';
import { StatCard } from '../components/cards/StatCard';
import { ChartCard } from '../components/cards/ChartCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

export const Overview = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [classDist, setClassDist] = useState([]);
  const [activities, setActivities] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [statsRes, chartRes, distRes, actRes, attRes] = await Promise.all([
          getDashboardStatsApi(),
          getAttendanceChartApi(),
          getClassDistributionApi(),
          getRecentActivityApi(6),
          getRecentAttendanceApi(6),
        ]);
        setStats(statsRes);
        setChartData(chartRes);
        setClassDist(distRes);
        setActivities(actRes);
        setRecentAttendance(attRes);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        showToast('Could not fetch real-time dashboard data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [showToast]);

  if (isLoading) {
    return <LoadingSpinner text="Fetching live dashboard metrics from API..." size="lg" />;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Absent':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Late':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome & System Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time analytics and attendance intelligence for school administration.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-700">
            <span
              className={`w-2 h-2 rounded-full ${
                stats?.system_status === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500'
              } animate-pulse`}
            />
            <span>System Status:</span>
            <span
              className={
                stats?.system_status === 'Healthy' ? 'text-emerald-600 font-bold' : 'text-amber-600'
              }
            >
              {stats?.system_status || 'Operational'}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={stats?.total_students ?? 0}
          subtitle="Enrolled active learners"
          icon={Users}
          color="purple"
          trend={{ value: '+100% active', isPositive: true }}
        />
        <StatCard
          title="Total Classes"
          value={stats?.total_classes ?? 0}
          subtitle="Active academic sections"
          icon={GraduationCap}
          color="blue"
        />
        <StatCard
          title="Attendance Today"
          value={stats?.attendance_today ?? 0}
          subtitle="Recorded attendance events"
          icon={CalendarCheck2}
          color="emerald"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats?.attendance_percentage ?? 0}%`}
          subtitle="Overall present percentage"
          icon={Percent}
          color="amber"
          trend={{ value: 'Real-time', isPositive: true }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Attendance Statistics Trend"
            subtitle="Daily breakdown of Present, Absent, and Late attendance records"
          >
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={290}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="present"
                    name="Present"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPresent)"
                  />
                  <Area
                    type="monotone"
                    dataKey="absent"
                    name="Absent"
                    stroke="#EF4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAbsent)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No attendance trend records" description="Record attendance to see statistical graphs." />
            )}
          </ChartCard>
        </div>

        {/* Class Distribution Bar Chart */}
        <div>
          <ChartCard
            title="Class-wise Distribution"
            subtitle="Enrolled student volume per class"
          >
            {classDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={classDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="class_name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="student_count" name="Students" fill="#542C83" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No class data" description="Classes will appear here once registered." />
            )}
          </ChartCard>
        </div>
      </div>

      {/* Two Column Section: Recent Attendance Records & Recent Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Attendance Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Recent Attendance Records</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live records submitted by assigned educators</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {recentAttendance.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-6">Student</th>
                    <th className="py-3 px-6">Class</th>
                    <th className="py-3 px-6">Date & Session</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {recentAttendance.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-slate-900">
                        {item.student_name}
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {item.student_code}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 font-medium">{item.class_name}</td>
                      <td className="py-3.5 px-6 text-slate-600">
                        {item.date}
                        <span className="block text-[11px] text-slate-400">{item.session}</span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500">{item.recorded_by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6">
                <EmptyState title="No recent attendance entries" description="Submit attendance from the Attendance tab." />
              </div>
            )}
          </div>
        </div>

        {/* Recent Audit Activities Feed */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Recent Activities</h3>
            <p className="text-xs text-slate-500 mt-0.5">Audit log of system events</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[360px] pr-1">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs pb-3 border-b border-slate-50 last:border-0">
                  <div className="p-2 rounded-xl bg-purple-50 text-brand-600 shrink-0 mt-0.5">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      {act.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">
                      {act.details || `Performed by ${act.username}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span>User: {act.username}</span>
                      <span>•</span>
                      <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No recent activity" description="Audit logs will appear as actions are performed." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
