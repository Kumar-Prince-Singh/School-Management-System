import React, { useState, useEffect } from 'react';
import {
  FileBarChart2,
  Calendar,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  XCircle,
  Percent,
  TrendingUp,
} from 'lucide-react';
import { getAttendanceReportApi } from '../api/attendance';
import { getClassesApi } from '../api/classes';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

export const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getClassesApi();
        setClasses(res);
      } catch (err) {
        console.error('Failed to load classes', err);
      }
    };
    fetchClasses();
  }, []);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (selectedClassId) params.class_id = selectedClassId;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await getAttendanceReportApi(params);
      setReportData(res);
    } catch (err) {
      console.error('Failed to load report', err);
      showToast('Could not load attendance reports', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedClassId, startDate, endDate]);

  const handleExportCSV = () => {
    if (!reportData || !reportData.records.length) {
      showToast('No records to export', 'warning');
      return;
    }

    const headers = ['Date', 'Class Name', 'Session', 'Total Students', 'Present', 'Absent', 'Late', 'Attendance Rate %'];
    const rows = reportData.records.map((r) => [
      r.date,
      `"${r.class_name}"`,
      r.session,
      r.total_students,
      r.present_count,
      r.absent_count,
      r.late_count,
      r.attendance_rate,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance report exported as CSV.', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Reports</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Aggregated analytics, class-wise performance, and compliance metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-brand-600" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Filter by Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - {c.section}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      {reportData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100">
            <span className="text-xs font-medium text-slate-500">Total Entries Recorded</span>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {reportData.summary.total_records}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Aggregated instances</span>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100">
            <span className="text-xs font-medium text-slate-500">Total Present Marks</span>
            <div className="mt-2 text-2xl font-bold text-emerald-600">
              {reportData.summary.total_present}
            </div>
            <span className="text-[11px] text-emerald-500 mt-1 block">Attended sessions</span>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100">
            <span className="text-xs font-medium text-slate-500">Total Absent Marks</span>
            <div className="mt-2 text-2xl font-bold text-rose-600">
              {reportData.summary.total_absent}
            </div>
            <span className="text-[11px] text-rose-400 mt-1 block">Unattended / excused</span>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100">
            <span className="text-xs font-medium text-slate-500">Overall Attendance Rate</span>
            <div className="mt-2 text-2xl font-bold text-brand-600">
              {reportData.summary.overall_attendance_rate}%
            </div>
            <span className="text-[11px] text-brand-400 mt-1 block">Weighted institutional average</span>
          </div>
        </div>
      )}

      {/* Report Records Table */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">Detailed Session Breakdown</h3>
          <p className="text-xs text-slate-500 mt-0.5">Aggregated metrics per class session and date</p>
        </div>

        {isLoading ? (
          <LoadingSpinner text="Computing attendance statistics..." />
        ) : reportData?.records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Class Section</th>
                  <th className="py-3 px-6">Session</th>
                  <th className="py-3 px-6 text-center">Total Students</th>
                  <th className="py-3 px-6 text-center text-emerald-600">Present</th>
                  <th className="py-3 px-6 text-center text-rose-600">Absent</th>
                  <th className="py-3 px-6 text-center text-amber-600">Late</th>
                  <th className="py-3 px-6 text-right">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {reportData.records.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-slate-900">{r.date}</td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">{r.class_name}</td>
                    <td className="py-3.5 px-6 text-slate-600">{r.session}</td>
                    <td className="py-3.5 px-6 text-center font-medium text-slate-700">{r.total_students}</td>
                    <td className="py-3.5 px-6 text-center font-bold text-emerald-600">{r.present_count}</td>
                    <td className="py-3.5 px-6 text-center font-bold text-rose-600">{r.absent_count}</td>
                    <td className="py-3.5 px-6 text-center font-bold text-amber-600">{r.late_count}</td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full font-bold bg-brand-50 text-brand-700 border border-brand-200">
                        {r.attendance_rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              title="No report records available"
              description="No attendance data matches the chosen date range or class filter."
            />
          </div>
        )}
      </div>
    </div>
  );
};
