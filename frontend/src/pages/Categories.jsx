import { useCallback, useEffect, useState } from 'react';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService.js';

function extractApiError(err, fallback) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    fallback ||
    'Đã xảy ra lỗi'
  );
}

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('vi-VN');
  } catch {
    return '—';
  }
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  const [formMode, setFormMode] = useState('closed');
  const [editingCategory, setEditingCategory] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchCategories = useCallback(async (q) => {
    setLoading(true);
    setError('');
    try {
      const data = await listCategories(q);
      setCategories(data);
    } catch (err) {
      setError(extractApiError(err, 'Không tải được danh sách loại vật tư'));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories(activeQuery);
  }, [fetchCategories, activeQuery]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setActiveQuery(searchInput);
  }

  function handleClearSearch() {
    setSearchInput('');
    setActiveQuery('');
  }

  function openCreateForm() {
    setEditingCategory(null);
    setFormMode('create');
  }

  function openEditForm(category) {
    setEditingCategory(category);
    setFormMode('edit');
  }

  function closeForm() {
    setFormMode('closed');
    setEditingCategory(null);
  }

  async function handleFormSubmit(values) {
    if (formMode === 'create') {
      await createCategory(values);
    } else if (formMode === 'edit' && editingCategory) {
      await updateCategory(editingCategory.id, values);
    }
    closeForm();
    await fetchCategories(activeQuery);
  }

  function askDelete(category) {
    setConfirmDelete(category);
    setDeleteError('');
  }

  function cancelDelete() {
    if (deleting) return;
    setConfirmDelete(null);
    setDeleteError('');
  }

  async function confirmDeleteAction() {
    if (!confirmDelete) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteCategory(confirmDelete.id);
      setConfirmDelete(null);
      await fetchCategories(activeQuery);
    } catch (err) {
      setDeleteError(extractApiError(err, 'Không xoá được loại vật tư'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Loại vật tư</h2>
          <p className="text-sm text-slate-500">
            Quản lý các loại (category) dùng để phân nhóm vật tư.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Thêm loại vật tư
        </button>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-3 sm:flex-row sm:items-center"
      >
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Tìm theo tên hoặc mô tả…"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:flex-1"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-md border border-brand-600 bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Tìm
          </button>
          {activeQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Xoá lọc
            </button>
          )}
        </div>
      </form>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 w-16">ID</th>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Mô tả</th>
              <th className="px-4 py-3 w-40">Cập nhật</th>
              <th className="px-4 py-3 w-32 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Đang tải…
                </td>
              </tr>
            )}
            {!loading && categories.length === 0 && !error && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  {activeQuery
                    ? `Không có loại vật tư khớp với "${activeQuery}".`
                    : 'Chưa có loại vật tư nào. Bấm "Thêm loại vật tư" để tạo mới.'}
                </td>
              </tr>
            )}
            {!loading &&
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{cat.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{cat.name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {cat.description || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(cat.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(cat)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => askDelete(cat)}
                        className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {formMode !== 'closed' && (
        <CategoryFormModal
          mode={formMode}
          initial={editingCategory}
          onClose={closeForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {confirmDelete && (
        <ConfirmDeleteModal
          category={confirmDelete}
          loading={deleting}
          error={deleteError}
          onCancel={cancelDelete}
          onConfirm={confirmDeleteAction}
        />
      )}
    </div>
  );
}

function CategoryFormModal({ mode, initial, onClose, onSubmit }) {
  const isEdit = mode === 'edit';
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) {
      setFormError('Tên là bắt buộc');
      return;
    }
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
    };
    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setFormError(extractApiError(err, 'Không lưu được loại vật tư'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          {isEdit ? 'Sửa loại vật tư' : 'Thêm loại vật tư'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="cat-name"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Tên <span className="text-red-500">*</span>
            </label>
            <input
              id="cat-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Ví dụ: Gỗ"
              disabled={submitting}
              required
            />
          </div>
          <div>
            <label
              htmlFor="cat-description"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Mô tả
            </label>
            <textarea
              id="cat-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Mô tả ngắn (không bắt buộc)"
              disabled={submitting}
            />
          </div>

          {formError && (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ category, loading, error, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-2 text-lg font-semibold text-slate-800">Xác nhận xoá</h3>
        <p className="text-sm text-slate-600">
          Bạn có chắc muốn xoá loại vật tư{' '}
          <span className="font-semibold">{category.name}</span>?
        </p>
        {error && (
          <div
            role="alert"
            className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? 'Đang xoá…' : 'Xoá'}
          </button>
        </div>
      </div>
    </div>
  );
}
