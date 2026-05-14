import { useCallback, useEffect, useState } from 'react';
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../services/userService.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const ROLES = [
  { value: 'staff', label: 'Nhân viên' },
  { value: 'admin', label: 'Quản trị' },
];

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

function roleLabel(role) {
  return ROLES.find((item) => item.value === role)?.label ?? role ?? '—';
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  const [formMode, setFormMode] = useState('closed');
  const [editingUser, setEditingUser] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const isKnownNonAdmin = currentUser?.role && currentUser.role !== 'admin';

  const fetchUsers = useCallback(
    async (q) => {
      if (isKnownNonAdmin) {
        setUsers([]);
        setError('Bạn cần quyền admin để quản lý nhân sự');
        return;
      }

      setLoading(true);
      setError('');
      try {
        const data = await listUsers(q);
        setUsers(data);
      } catch (err) {
        setError(extractApiError(err, 'Không tải được danh sách nhân sự'));
        setUsers([]);
      } finally {
        setLoading(false);
      }
    },
    [isKnownNonAdmin]
  );

  useEffect(() => {
    fetchUsers(activeQuery);
  }, [fetchUsers, activeQuery]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setActiveQuery(searchInput);
  }

  function handleClearSearch() {
    setSearchInput('');
    setActiveQuery('');
  }

  function openCreateForm() {
    setEditingUser(null);
    setFormMode('create');
  }

  function openEditForm(nextUser) {
    setEditingUser(nextUser);
    setFormMode('edit');
  }

  function closeForm() {
    setFormMode('closed');
    setEditingUser(null);
  }

  async function handleFormSubmit(values) {
    if (formMode === 'create') {
      await createUser(values);
    } else if (formMode === 'edit' && editingUser) {
      await updateUser(editingUser.id, values);
    }
    closeForm();
    await fetchUsers(activeQuery);
  }

  function askDelete(nextUser) {
    setConfirmDelete(nextUser);
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
      await deleteUser(confirmDelete.id);
      setConfirmDelete(null);
      await fetchUsers(activeQuery);
    } catch (err) {
      setDeleteError(extractApiError(err, 'Không xoá được nhân sự'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Nhân sự</h2>
          <p className="text-sm text-slate-500">
            Quản lý tài khoản đăng nhập và phân quyền cơ bản.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          disabled={isKnownNonAdmin}
          className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          + Thêm nhân sự
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
          placeholder="Tìm theo họ tên hoặc username..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:flex-1"
          disabled={isKnownNonAdmin}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isKnownNonAdmin}
            className="rounded-md border border-brand-600 bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
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
          className={`rounded-md border px-3 py-2 text-sm ${
            isKnownNonAdmin
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="min-w-[760px] divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-16 px-4 py-3">ID</th>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Username</th>
              <th className="w-32 px-4 py-3">Vai trò</th>
              <th className="w-40 px-4 py-3">Cập nhật</th>
              <th className="w-32 px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && !error && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  {activeQuery
                    ? `Không có nhân sự khớp với "${activeQuery}".`
                    : 'Chưa có nhân sự nào. Bấm "Thêm nhân sự" để tạo mới.'}
                </td>
              </tr>
            )}
            {!loading &&
              users.map((item) => {
                const isSelf = currentUser?.id === item.id;
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{item.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{item.fullName}</div>
                      {isSelf && <div className="text-xs text-slate-500">Tài khoản hiện tại</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.username}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-600">
                        {roleLabel(item.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(item.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(item)}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => askDelete(item)}
                          disabled={isSelf}
                          title={isSelf ? 'Không thể xoá tài khoản đang đăng nhập' : undefined}
                          className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {formMode !== 'closed' && (
        <UserFormModal
          mode={formMode}
          initial={editingUser}
          onClose={closeForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {confirmDelete && (
        <ConfirmDeleteModal
          user={confirmDelete}
          loading={deleting}
          error={deleteError}
          onCancel={cancelDelete}
          onConfirm={confirmDeleteAction}
        />
      )}
    </div>
  );
}

function UserFormModal({ mode, initial, onClose, onSubmit }) {
  const isEdit = mode === 'edit';
  const [fullName, setFullName] = useState(initial?.fullName ?? '');
  const [username, setUsername] = useState(initial?.username ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initial?.role ?? 'staff');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    const trimmedFullName = fullName.trim();
    const trimmedUsername = username.trim();

    if (!trimmedFullName) {
      setFormError('Họ tên là bắt buộc');
      return;
    }
    if (!trimmedUsername) {
      setFormError('Username là bắt buộc');
      return;
    }
    if (!isEdit && password.length < 6) {
      setFormError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (isEdit && password && password.length < 6) {
      setFormError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (role !== 'admin' && role !== 'staff') {
      setFormError('Vai trò không hợp lệ');
      return;
    }

    const payload = {
      fullName: trimmedFullName,
      username: trimmedUsername,
      role,
    };
    if (!isEdit || password) {
      payload.password = password;
    }

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setFormError(extractApiError(err, 'Không lưu được nhân sự'));
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
          {isEdit ? 'Sửa nhân sự' : 'Thêm nhân sự'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="user-full-name" className="mb-1 block text-sm font-medium text-slate-700">
              Họ tên <span className="text-red-500">*</span>
            </label>
            <input
              id="user-full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Ví dụ: Nguyễn Văn A"
              disabled={submitting}
              required
            />
          </div>

          <div>
            <label htmlFor="user-username" className="mb-1 block text-sm font-medium text-slate-700">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              id="user-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Ví dụ: staff1"
              disabled={submitting}
              required
            />
          </div>

          <div>
            <label htmlFor="user-password" className="mb-1 block text-sm font-medium text-slate-700">
              {isEdit ? 'Mật khẩu mới' : 'Mật khẩu'} {!isEdit && <span className="text-red-500">*</span>}
            </label>
            <input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder={isEdit ? 'Để trống nếu không đổi' : 'Tối thiểu 6 ký tự'}
              disabled={submitting}
              required={!isEdit}
            />
          </div>

          <div>
            <label htmlFor="user-role" className="mb-1 block text-sm font-medium text-slate-700">
              Vai trò <span className="text-red-500">*</span>
            </label>
            <select
              id="user-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              disabled={submitting}
              required
            >
              {ROLES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
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
              {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ user, loading, error, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-2 text-lg font-semibold text-slate-800">Xác nhận xoá</h3>
        <p className="text-sm text-slate-600">
          Bạn có chắc muốn xoá nhân sự <span className="font-semibold">{user.fullName}</span>?
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
            {loading ? 'Đang xoá...' : 'Xoá'}
          </button>
        </div>
      </div>
    </div>
  );
}
