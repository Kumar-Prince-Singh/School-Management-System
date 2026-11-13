import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  UserCheck,
  Users,
  Edit2,
  Trash2,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  getClassesApi,
  createClassApi,
  updateClassApi,
  deleteClassApi,
} from '../api/classes';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    section: '',
    academic_year: '2025-2026',
    teacher_id: '',
  });

  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'admin';

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const res = await getClassesApi({ search: search.trim() || undefined });
      setClasses(res);
    } catch (err) {
      console.error('Failed to load classes', err);
      showToast('Could not fetch classes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [search]);

  const handleOpenAdd = () => {
    setFormData({
      name: 'Class 12',
      section: 'A',
      academic_year: '2025-2026',
      teacher_id: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cls) => {
    setSelectedClass(cls);
    setFormData({
      name: cls.name,
      section: cls.section,
      academic_year: cls.academic_year,
      teacher_id: cls.teacher_id ? String(cls.teacher_id) : '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (cls) => {
    setSelectedClass(cls);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createClassApi({
        name: formData.name,
        section: formData.section,
        academic_year: formData.academic_year,
        teacher_id: formData.teacher_id ? parseInt(formData.teacher_id, 10) : null,
      });
      showToast(`Class "${formData.name} - ${formData.section}" created!`, 'success');
      setIsAddModalOpen(false);
      fetchClasses();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create class.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await updateClassApi(selectedClass.id, {
        name: formData.name,
        section: formData.section,
        academic_year: formData.academic_year,
        teacher_id: formData.teacher_id ? parseInt(formData.teacher_id, 10) : null,
      });
      showToast('Class updated successfully!', 'success');
      setIsEditModalOpen(false);
      fetchClasses();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update class.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsSubmitting(true);
      await deleteClassApi(selectedClass.id);
      showToast('Class deleted.', 'success');
      setIsDeleteDialogOpen(false);
      fetchClasses();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete class.';
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Class Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure sections, academic years, and educator class assignments.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add New Class
          </button>
        )}
      </div>

      {/* Search Header */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-100 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search class or section..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Class Cards Grid */}
      {isLoading ? (
        <LoadingSpinner text="Loading classes..." />
      ) : classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(cls)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(cls)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {cls.name} <span className="text-brand-600 font-extrabold">- {cls.section}</span>
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Academic Year: {cls.academic_year}</span>
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-brand-500" />
                      Assigned Teacher:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {cls.teacher ? cls.teacher.full_name : <span className="text-amber-600">Unassigned</span>}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-500" />
                      Enrolled Learners:
                    </span>
                    <span className="font-bold text-slate-900 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      {cls.student_count} students
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No classes registered"
          description="Create classes to organize students and assign authorized educators."
          actionLabel={isAdmin ? "Create First Class" : undefined}
          onAction={isAdmin ? handleOpenAdd : undefined}
        />
      )}

      {/* Add / Edit Class Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? "Register New Class" : "Edit Class Settings"}
      >
        <form onSubmit={isAddModalOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Class 10"
                required
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Section *</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                placeholder="A"
                required
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year *</label>
            <input
              type="text"
              value={formData.academic_year}
              onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
              placeholder="2025-2026"
              required
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Teacher ID (Optional)
            </label>
            <input
              type="number"
              value={formData.teacher_id}
              onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
              placeholder="Teacher ID (e.g. 2 for Teacher A, 3 for Teacher B)"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Tip: ID 2 = Dr. Vikram Malhotra (Teacher A), ID 3 = Prof. Ananya Sen (Teacher B).
            </span>
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
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all"
            >
              {isSubmitting ? 'Saving...' : isAddModalOpen ? 'Create Class' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Class Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Class"
        message={`Are you sure you want to delete "${selectedClass?.name} - ${selectedClass?.section}"? All associated student records and attendance will be removed.`}
        confirmText="Delete Class"
        confirmVariant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};

