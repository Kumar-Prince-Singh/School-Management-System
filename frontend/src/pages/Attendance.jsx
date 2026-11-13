import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Calendar,
  Clock,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertCircle,
  History,
  Send,
  Users,
  CheckCheck,
  Ban,
  UserCheck,
} from 'lucide-react';
import { getClassesApi } from '../api/classes';
import { getStudentsApi } from '../api/students';
import { submitAttendanceApi, getAttendanceApi } from '../api/attendance';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const Attendance = () => {
  const [activeTab, setActiveTab] = useState('record'); // 'record' | 'history'
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionName, setSessionName] = useState('Morning');
  const [classStudents, setClassStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { [studentId]: { status: 'Present'|'Absent'|'Late', remarks: '' } }
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History Tab State
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyClassId, setHistoryClassId] = useState('');
  const [historyDate, setHistoryDate] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();

  // Load classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getClassesApi();
        setClasses(res);
        if (res.length > 0) {
          // If user is a teacher, pre-select their assigned class if available
          const assigned = res.find((c) => c.teacher_id === user?.id);
          setSelectedClassId(assigned ? assigned.id : res[0].id);
        }
      } catch (err) {
        console.error('Failed to load classes', err);
        showToast('Error loading class list', 'error');
      }
    };
    fetchClasses();
  }, [user, showToast]);

  // Selected Class details
  const currentClass = classes.find((c) => c.id === parseInt(selectedClassId, 10));

  // Determine authorization to record attendance for this class
  const isAuthorized =
    user?.role === 'admin' ||
    (user?.role === 'teacher' && currentClass?.teacher_id === user?.id);

  const isStaffReadOnly = user?.role === 'staff';

  // Fetch students when selected class changes
  useEffect(() => {
    if (!selectedClassId) return;

    const fetchClassStudents = async () => {
      try {
        setIsLoadingStudents(true);
        const res = await getStudentsApi({ class_id: selectedClassId, page_size: 100 });
        setClassStudents(res.items);

        // Pre-fill all active students as 'Present' by default
        const initialMap = {};
        res.items.forEach((s) => {
          initialMap[s.id] = { status: 'Present', remarks: '' };
        });
        setAttendanceMap(initialMap);
      } catch (err) {
        console.error('Failed to load class students', err);
        showToast('Error loading enrolled students for this class', 'error');
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchClassStudents();
  }, [selectedClassId, showToast]);

  // Handle single student status toggle
  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const markAllStatus = (status) => {
    const updated = {};
    classStudents.forEach((s) => {
      updated[s.id] = { ...attendanceMap[s.id], status };
    });
    setAttendanceMap(updated);
    showToast(`Marked all students as ${status}`, 'info');
  };

  // Submit Attendance Form
  const handleSubmitAttendance = async () => {
    if (!isAuthorized) {
      showToast('You are not authorized to record attendance for this class.', 'error');
      return;
    }

    if (classStudents.length === 0) {
      showToast('No students enrolled in this class to record attendance.', 'warning');
      return;
    }

    const payload = {
      class_id: parseInt(selectedClassId, 10),
      date: attendanceDate,
      session: sessionName,
      records: classStudents.map((s) => ({
        student_id: s.id,
        status: attendanceMap[s.id]?.status || 'Present',
        remarks: attendanceMap[s.id]?.remarks || null,
      })),
    };

    try {
      setIsSubmitting(true);
      await submitAttendanceApi(payload);
      showToast(
        `Attendance successfully submitted for ${currentClass?.name} - ${currentClass?.section} (${sessionName} Session)!`,
        'success'
      );
      // Refresh history if opened
      fetchHistory();
    } catch (err) {
      const msg =
        err.response?.data?.detail || 'Failed to submit attendance. Duplicate submission detected.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch History
  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const params = {};
      if (historyClassId) params.class_id = historyClassId;
      if (historyDate) params.date = historyDate;
      const res = await getAttendanceApi(params);
      setHistoryRecords(res);
    } catch (err) {
      console.error('Failed to load history', err);
      showToast('Error loading attendance history', 'error');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, historyClassId, historyDate]);

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Attendance Management
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Role-enforced daily attendance recording with duplicate check verification.
          </p>
        </div>

        <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-sm self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('record')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'record'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck2 className="w-4 h-4" />
            Record Attendance
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            Attendance History
          </button>
        </div>
      </div>

      {activeTab === 'record' ? (
        <>
          {/* Controls Bar: Select Class, Date, Session */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Class Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Class Section
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 font-semibold"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.section} ({c.academic_year})
                  </option>
                ))}
              </select>
            </div>

            {/* Attendance Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Attendance Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* Session Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                School Session
              </label>
              <select
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 font-medium"
              >
                <option value="Morning">Morning Session</option>
                <option value="Afternoon">Afternoon Session</option>
              </select>
            </div>
          </div>

          {/* Authorization & Security Banner */}
          {!isAuthorized ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800">
              <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">Authorization Notice (RBAC Enforced):</p>
                <p className="mt-0.5 leading-relaxed">
                  {isStaffReadOnly
                    ? 'You are signed in as Staff (Read-Only). Only authorized assigned teachers or administrators are permitted to submit attendance.'
                    : `You are signed in as "${user?.full_name}". This class is assigned to "${
                        currentClass?.teacher?.full_name || 'Unassigned'
                      }". Only the assigned teacher can record attendance for this class.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-xs">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Authorized Educator: <strong>{user?.full_name}</strong> is permitted to record attendance for{' '}
                  <strong>{currentClass?.name} - {currentClass?.section}</strong>.
                </span>
              </div>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-semibold text-[10px]">
                RBAC PASSED
              </span>
            </div>
          )}

          {/* Student Roster & Quick Action Bar */}
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Enrolled Students Roster</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {classStudents.length} students enrolled in {currentClass?.name} - {currentClass?.section}
                </p>
              </div>

              {/* Quick Mass Actions */}
              {isAuthorized && classStudents.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => markAllStatus('Present')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => markAllStatus('Absent')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    All Absent
                  </button>
                </div>
              )}
            </div>

            {isLoadingStudents ? (
              <LoadingSpinner text="Fetching enrolled students..." />
            ) : classStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-6">Student</th>
                      <th className="py-3 px-6">ID Number</th>
                      <th className="py-3 px-6 text-center">Status</th>
                      <th className="py-3 px-6">Remarks (Optional)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {classStudents.map((student) => {
                      const currentStatus = attendanceMap[student.id]?.status || 'Present';
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-6 font-semibold text-slate-900">
                            {student.full_name}
                            <span className="block text-[11px] text-slate-400 font-normal">
                              {student.email}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 font-mono text-slate-600 font-medium">
                            {student.student_id}
                          </td>
                          <td className="py-3.5 px-6 text-center">
                            <div className="inline-flex rounded-xl bg-slate-100 p-1 gap-1">
                              {['Present', 'Absent', 'Late'].map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  disabled={!isAuthorized}
                                  onClick={() => handleStatusChange(student.id, st)}
                                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                    currentStatus === st
                                      ? st === 'Present'
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : st === 'Absent'
                                        ? 'bg-rose-600 text-white shadow-sm'
                                        : 'bg-amber-500 text-white shadow-sm'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-6">
                            <input
                              type="text"
                              disabled={!isAuthorized}
                              value={attendanceMap[student.id]?.remarks || ''}
                              onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                              placeholder="Reason / notes..."
                              className="w-full max-w-xs px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8">
                <EmptyState
                  title="No enrolled learners in this class"
                  description="Enrol students into this class section from the Students page."
                />
              </div>
            )}

            {/* Submit Attendance Bar */}
            {classStudents.length > 0 && (
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Total Present:{' '}
                  <span className="font-bold text-emerald-600">
                    {Object.values(attendanceMap).filter((v) => v.status === 'Present').length}
                  </span>{' '}
                  • Absent:{' '}
                  <span className="font-bold text-rose-600">
                    {Object.values(attendanceMap).filter((v) => v.status === 'Absent').length}
                  </span>{' '}
                  • Late:{' '}
                  <span className="font-bold text-amber-600">
                    {Object.values(attendanceMap).filter((v) => v.status === 'Late').length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitAttendance}
                  disabled={!isAuthorized || isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-600/20 hover:shadow-lg hover:shadow-brand-600/30 transition-all disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Attendance Record
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* History Tab */
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Historical Attendance Log</h3>
              <p className="text-xs text-slate-500 mt-0.5">Filter by class and date range</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={historyClassId}
                onChange={(e) => setHistoryClassId(e.target.value)}
                className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.section}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={historyDate}
                onChange={(e) => setHistoryDate(e.target.value)}
                className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              />
            </div>
          </div>

          {isLoadingHistory ? (
            <LoadingSpinner text="Fetching attendance history..." />
          ) : historyRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-6">Student</th>
                    <th className="py-3 px-6">Class</th>
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6">Session</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {historyRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-6 font-medium text-slate-900">{rec.student_name}</td>
                      <td className="py-3 px-6 text-slate-600">{rec.class_name}</td>
                      <td className="py-3 px-6 text-slate-600">{rec.date}</td>
                      <td className="py-3 px-6 text-slate-600">{rec.session}</td>
                      <td className="py-3 px-6">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            rec.status === 'Present'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : rec.status === 'Absent'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-slate-400">{rec.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                title="No attendance records found"
                description="There are no attendance records matching the selected filter criteria."
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

