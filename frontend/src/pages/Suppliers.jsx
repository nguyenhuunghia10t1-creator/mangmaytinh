import { useCallback, useEffect, useState } from 'react';
import {
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../services/supplierService.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  const [formMode, setFormMode] = useState('closed');
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchSuppliers = useCallback(async (q) => {
    setLoading(true);
    setError('');
    try {
      const data = await listSuppliers(q);
      setSuppliers(data);
    } catch (err) {
      setError(extractApiError(err, 'Không tải được danh sách nhà cung cấp'));
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers(activeQuery);
  }, [fetchSuppliers, activeQuery]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setActiveQuery(searchInput);
  }

  function handleClearSearch() {
    setSearchInput('');
    setActiveQuery('');
  }

  function openCreateForm() {
    setEditingSupplier(null);
    setFormMode('create');
  }

  function openEditForm(supplier) {
    setEditingSupplier(supplier);
    setFormMode('edit');
  }

  function closeForm() {
    setFormMode('closed');
    setEditingSupplier(null);
  }

  async function handleFormSubmit(values) {
    if (formMode === 'create') {
      await createSupplier(values);
    } else if (formMode === 'edit' && editingSupplier) {
      await updateSupplier(editingSupplier.id, values);
    }
    closeForm();
    await fetchSuppliers(activeQuery);
  }

  function askDelete(supplier) {
    setConfirmDelete(supplier);
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
      await deleteSupplier(confirmDelete.id);
      setConfirmDelete(null);
      await fetchSuppliers(activeQuery);
    } catch (err) {
      setDeleteError(extractApiError(err, 'Không xoá được nhà cung cấp'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Nhà cung cấp</h2>
          <p className="text-sm text-slate-500">
            Quản lý danh sách nhà cung cấp vật tư.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Thêm nhà cung cấp
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
          placeholder="Tìm theo tên, SĐT, email, địa chỉ…"
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

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 w-16">ID</th>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3 w-36">SĐT</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Địa chỉ</th>
              <th className="px-4 py-3 w-40">Cập nhật</th>
              <th className="px-4 py-3 w-32 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  Đang tải…
                </td>
              </tr>
            )}
            {!loading && suppliers.length === 0 && !error && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  {activeQuery
                    ? `Không có nhà cung cấp khớp với "${activeQuery}".`
                    : 'Chưa có nhà cung cấp nào. Bấm "Thêm nhà cung cấp" để tạo mới.'}
                </td>
              </tr>
            )}
            {!loading &&
              suppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{sup.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{sup.name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {sup.phone || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {sup.email || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {sup.address || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(sup.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(sup)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => askDelete(sup)}
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
        <SupplierFormModal
          mode={formMode}
          initial={editingSupplier}
          onClose={closeForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {confirmDelete && (
        <ConfirmDeleteModal
          supplier={confirmDelete}
          loading={deleting}
          error={deleteError}
          onCancel={cancelDelete}
          onConfirm={confirmDeleteAction}
        />
      )}
    </div>
  );
}

function SupplierFormModal({ mode, initial, onClose, onSubmit }) {
  const isEdit = mode === 'edit';
  const [name, setName] = useState(initial?.name ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName) {
      setFormError('Tên là bắt buộc');
      return;
    }
    if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
      setFormError('Email không hợp lệ');
      return;
    }

    const payload = {
      name: trimmedName,
      phone: trimmedPhone || null,
      email: trimmedEmail || null,
      address: trimmedAddress || null,
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setFormError(extractApiError(err, 'Không lưu được nhà cung cấp'));
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
          {isEdit ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="sup-name"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Tên <span className="text-red-500">*</span>
            </label>
            <input
              id="sup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Ví dụ: Nhà cung cấp A"
              disabled={submitting}
              required
            />
          </div>
          <div>
            <label
              htmlFor="sup-phone"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Số điện thoại
            </label>
            <input
              id="sup-phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Ví dụ: 0900000000"
              disabled={submitting}
            />
          </div>
          <div>
            <label
              htmlFor="sup-email"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="sup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Ví dụ: contact@example.com"
              disabled={submitting}
            />
          </div>
          <div>
            <label
              htmlFor="sup-address"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Địa chỉ
            </label>
            <textarea
              id="sup-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Địa chỉ (không bắt buộc)"
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

function ConfirmDeleteModal({ supplier, loading, error, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-2 text-lg font-semibold text-slate-800">Xác nhận xoá</h3>
        <p className="text-sm text-slate-600">
          Bạn có chắc muốn xoá nhà cung cấp{' '}
          <span className="font-semibold">{supplier.name}</span>?
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
