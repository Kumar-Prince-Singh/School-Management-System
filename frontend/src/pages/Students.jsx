import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import {
  getStudentsApi,
  createStudentApi,
  updateStudentApi,
  deleteStudentApi,
} from '../api/students';
import { getClassesApi } from '../api/classes';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    student_id: '',
    full_name: '',
    email: '',
    phone: '',
    class_id: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState({});

  const { user } = useAuth();
  const { showToast } = useToast();

  const isTeacherOrAdmin = user?.role === 'admin' || user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';

  // Load classes for dropdown
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

  // Fetch paginated students
  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        page_size: pageSize,
      };
      if (search.trim()) params.search = search.trim();
      if (selectedClass) params.class_id = selectedClass;

      const res = await getStudentsApi(params);
      setStudents(res.items);
      setTotal(res.total);
      setTotalPages(res.pages);
    } catch (err) {
      console.error('Failed to load students', err);
      showToast('Error loading student records', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, search, selectedClass, showToast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const validateForm = () => {
    const errors = {};
    if (!formData.student_id.trim()) errors.student_id = 'Student ID is required.';
    if (!formData.full_name.trim()) errors.full_name = 'Full name is required.';
    if (!formData.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required.';
    if (!formData.class_id) errors.class_id = 'Please assign a class.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData({
      student_id: `STU-2025-${String(Math.floor(Math.random() * 900) + 100)}`,
      full_name: '',
      email: '',
      phone: '+91 98765 ',
      class_id: classes[0]?.id || '',
      enrollment_date: new Date().toISOString().split('T')[0],
      status: 'Active',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      student_id: student.student_id,
      full_name: student.full_name,
      email: student.email,
      phone: student.phone,
      class_id: student.class_id,
      enrollment_date: student.enrollment_date,
      status: student.status,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenView = (student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleOpenDelete = (student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await createStudentApi({
        ...formData,
        class_id: parseInt(formData.class_id, 10),
      });
      showToast(`Student ${formData.full_name} enrolled successfully!`, 'success');
      setIsAddModalOpen(false);
      fetchStudents();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create student.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await updateStudentApi(selectedStudent.id, {
        ...formData,
        class_id: parseInt(formData.class_id, 10),
      });
      showToast(`Student ${formData.full_name} updated successfully!`, 'success');
      setIsEditModalOpen(false);
      fetchStudents();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update student.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsSubmitting(true);
      await deleteStudentApi(selectedStudent.id);
      showToast(`Student ${selectedStudent.full_name} deleted.`, 'success');
      setIsDeleteDialogOpen(false);
      fetchStudents();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete student.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Student Directory</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage enrolled students, academic class assignments, and student status.
          </p>
        </div>

        {isTeacherOrAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add New Student
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by student name, ID or email..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-48 py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700 font-medium"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.section}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner text="Loading student database records..." />
        ) : students.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-6">Student Info</th>
                    <th className="py-3 px-6">Student ID</th>
                    <th className="py-3 px-6">Class Assigned</th>
                    <th className="py-3 px-6">Contact Details</th>
                    <th className="py-3 px-6">Enrollment Date</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center shrink-0">
                            {student.full_name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900">{student.full_name}</span>
                            <span className="block text-[11px] text-slate-400">{student.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 font-mono text-slate-600 font-medium">
                        {student.student_id}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                          <GraduationCap className="w-3.5 h-3.5 text-brand-600" />
                          {student.class_assigned
                            ? `${student.class_assigned.name} - ${student.class_assigned.section}`
                            : 'Unassigned'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {student.phone}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">{student.enrollment_date}</td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            student.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenView(student)}
                            title="View Student"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isTeacherOrAdmin && (
                            <button
                              onClick={() => handleOpenEdit(student)}
                              title="Edit Student"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleOpenDelete(student)}
                              title="Delete Student"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={total}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        ) : (
          <div className="p-8">
            <EmptyState
              title="No students found"
              description="No students match the applied search keywords or class filters."
              actionLabel={isTeacherOrAdmin ? "Add New Student" : undefined}
              onAction={isTeacherOrAdmin ? handleOpenAdd : undefined}
            />
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? "Enrol New Student" : "Update Student Details"}
      >
        <form onSubmit={isAddModalOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student ID *
              </label>
              <input
                type="text"
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                placeholder="STU-2025-001"
                className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                  formErrors.student_id ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {formErrors.student_id && (
                <span className="text-[10px] text-rose-500 mt-1 block">{formErrors.student_id}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Aarav Sharma"
                className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                  formErrors.full_name ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {formErrors.full_name && (
                <span className="text-[10px] text-rose-500 mt-1 block">{formErrors.full_name}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@algions.edu"
                className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                  formErrors.email ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {formErrors.email && (
                <span className="text-[10px] text-rose-500 mt-1 block">{formErrors.email}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                  formErrors.phone ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {formErrors.phone && (
                <span className="text-[10px] text-rose-500 mt-1 block">{formErrors.phone}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Class *
              </label>
              <select
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                  formErrors.class_id ? 'border-rose-400' : 'border-slate-200'
                }`}
              >
                <option value="">Select a class...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.section} ({c.academic_year})
                  </option>
                ))}
              </select>
              {formErrors.class_id && (
                <span className="text-[10px] text-rose-500 mt-1 block">{formErrors.class_id}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isAddModalOpen ? 'Save Student' : 'Update Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Student Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Student Profile"
        maxWidth="max-w-md"
      >
        {selectedStudent && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-brand-50/50 rounded-2xl border border-brand-100">
              <div className="w-12 h-12 rounded-full bg-brand-600 text-white font-bold text-base flex items-center justify-center">
                {selectedStudent.full_name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{selectedStudent.full_name}</h4>
                <p className="text-slate-500 font-mono text-[11px]">{selectedStudent.student_id}</p>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 mt-1">
                  {selectedStudent.status}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Class:</span>
                <span className="font-semibold text-slate-800">
                  {selectedStudent.class_assigned
                    ? `${selectedStudent.class_assigned.name} - ${selectedStudent.class_assigned.section}`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-slate-800">{selectedStudent.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Phone:</span>
                <span className="font-semibold text-slate-800">{selectedStudent.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Enrollment Date:</span>
                <span className="font-semibold text-slate-800">{selectedStudent.enrollment_date}</span>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Student Record"
        message={`Are you sure you want to permanently delete student "${selectedStudent?.full_name}" (${selectedStudent?.student_id})? This will also remove associated attendance records.`}
        confirmText="Confirm Delete"
        confirmVariant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};
