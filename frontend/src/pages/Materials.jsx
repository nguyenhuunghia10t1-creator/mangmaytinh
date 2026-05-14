import { useCallback, useEffect, useState } from 'react';
import {
  listMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from '../services/materialService.js';
import { listCategories } from '../services/categoryService.js';
import { listSuppliers } from '../services/supplierService.js';

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

function formatNumber(value) {
  if (value === null || typeof value === 'undefined' || value === '') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return new Intl.NumberFormat('vi-VN').format(n);
}

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [error, setError] = useState('');
  const [optionsError, setOptionsError] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    q: '',
    categoryId: '',
    supplierId: '',
  });

  const [formMode, setFormMode] = useState('closed');
  const [editingMaterial, setEditingMaterial] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchMaterials = useCallback(async (filters) => {
    setLoading(true);
    setError('');
    try {
      const data = await listMaterials(filters);
      setMaterials(data);
    } catch (err) {
      setError(extractApiError(err, 'Không tải được danh sách vật tư'));
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOptions = useCallback(async () => {
    setOptionsLoading(true);
    setOptionsError('');
    try {
      const [nextCategories, nextSuppliers] = await Promise.all([
        listCategories(),
        listSuppliers(),
      ]);
      setCategories(nextCategories);
      setSuppliers(nextSuppliers);
    } catch (err) {
      setOptionsError(extractApiError(err, 'Không tải được loại vật tư hoặc nhà cung cấp'));
      setCategories([]);
      setSuppliers([]);
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  useEffect(() => {
    fetchMaterials(activeFilters);
  }, [fetchMaterials, activeFilters]);

  function handleFilterSubmit(e) {
    e.preventDefault();
    setActiveFilters({
      q: searchInput,
      categoryId: categoryFilter,
      supplierId: supplierFilter,
    });
  }

  function handleClearFilters() {
    setSearchInput('');
    setCategoryFilter('');
    setSupplierFilter('');
    setActiveFilters({ q: '', categoryId: '', supplierId: '' });
  }

  function openCreateForm() {
    setEditingMaterial(null);
    setFormMode('create');
  }

  function openEditForm(material) {
    setEditingMaterial(material);
    setFormMode('edit');
  }

  function closeForm() {
    setFormMode('closed');
    setEditingMaterial(null);
  }

  async function handleFormSubmit(values) {
    if (formMode === 'create') {
      await createMaterial(values);
    } else if (formMode === 'edit' && editingMaterial) {
      await updateMaterial(editingMaterial.id, values);
    }
    closeForm();
    await fetchMaterials(activeFilters);
  }

  function askDelete(material) {
    setConfirmDelete(material);
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
      await deleteMaterial(confirmDelete.id);
      setConfirmDelete(null);
      await fetchMaterials(activeFilters);
    } catch (err) {
      setDeleteError(extractApiError(err, 'Không xoá được vật tư'));
    } finally {
      setDeleting(false);
    }
  }

  const hasActiveFilters =
    activeFilters.q || activeFilters.categoryId || activeFilters.supplierId;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Vật tư</h2>
          <p className="text-sm text-slate-500">
            Quản lý danh sách vật tư, tồn kho, giá nhập và giá bán.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Thêm vật tư
        </button>
      </div>

      <form
        onSubmit={handleFilterSubmit}
        className="grid gap-2 rounded-md border border-slate-200 bg-white p-3 lg:grid-cols-[1fr_220px_220px_auto]"
      >
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Tìm theo tên hoặc mô tả..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          disabled={optionsLoading}
        >
          <option value="">Tất cả loại</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          disabled={optionsLoading}
        >
          <option value="">Tất cả nhà cung cấp</option>
          {suppliers.map((sup) => (
            <option key={sup.id} value={sup.id}>
              {sup.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-md border border-brand-600 bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Lọc
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Xoá lọc
            </button>
          )}
        </div>
      </form>

      {optionsError && (
        <div
          role="alert"
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
        >
          {optionsError}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="min-w-[1050px] divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-16 px-4 py-3">ID</th>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Loại</th>
              <th className="px-4 py-3">Nhà cung cấp</th>
              <th className="w-24 px-4 py-3 text-right">SL</th>
              <th className="w-24 px-4 py-3">Đơn vị</th>
              <th className="w-32 px-4 py-3 text-right">Giá nhập</th>
              <th className="w-32 px-4 py-3 text-right">Giá bán</th>
              <th className="w-40 px-4 py-3">Cập nhật</th>
              <th className="w-32 px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-slate-500">
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading && materials.length === 0 && !error && (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-slate-500">
                  {hasActiveFilters
                    ? 'Không có vật tư khớp với bộ lọc hiện tại.'
                    : 'Chưa có vật tư nào. Bấm "Thêm vật tư" để tạo mới.'}
                </td>
              </tr>
            )}
            {!loading &&
              materials.map((mat) => (
                <tr key={mat.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{mat.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{mat.name}</div>
                    {mat.description && (
                      <div className="mt-0.5 max-w-xs truncate text-xs text-slate-500">
                        {mat.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {mat.category?.name || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {mat.supplier?.name || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {formatNumber(mat.quantity)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{mat.unit}</td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {formatNumber(mat.importPrice)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {formatNumber(mat.sellPrice)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(mat.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(mat)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => askDelete(mat)}
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
        <MaterialFormModal
          mode={formMode}
          initial={editingMaterial}
          categories={categories}
          suppliers={suppliers}
          optionsLoading={optionsLoading}
          onClose={closeForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {confirmDelete && (
        <ConfirmDeleteModal
          material={confirmDelete}
          loading={deleting}
          error={deleteError}
          onCancel={cancelDelete}
          onConfirm={confirmDeleteAction}
        />
      )}
    </div>
  );
}

function MaterialFormModal({
  mode,
  initial,
  categories,
  suppliers,
  optionsLoading,
  onClose,
  onSubmit,
}) {
  const isEdit = mode === 'edit';
  const [name, setName] = useState(initial?.name ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ? String(initial.categoryId) : '');
  const [supplierId, setSupplierId] = useState(initial?.supplierId ? String(initial.supplierId) : '');
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? 0));
  const [unit, setUnit] = useState(initial?.unit ?? '');
  const [importPrice, setImportPrice] = useState(String(initial?.importPrice ?? 0));
  const [sellPrice, setSellPrice] = useState(String(initial?.sellPrice ?? 0));
  const [description, setDescription] = useState(initial?.description ?? '');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  function validateUrl(value) {
    if (!value) return true;
    try {
      const u = new URL(value);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    const trimmedName = name.trim();
    const trimmedUnit = unit.trim();
    const trimmedDescription = description.trim();
    const trimmedImageUrl = imageUrl.trim();
    const nextCategoryId = Number(categoryId);
    const nextSupplierId = Number(supplierId);
    const nextQuantity = Number(quantity);
    const nextImportPrice = Number(importPrice);
    const nextSellPrice = Number(sellPrice);

    if (!trimmedName) {
      setFormError('Tên vật tư là bắt buộc');
      return;
    }
    if (!Number.isInteger(nextCategoryId) || nextCategoryId <= 0) {
      setFormError('Vui lòng chọn loại vật tư');
      return;
    }
    if (!Number.isInteger(nextSupplierId) || nextSupplierId <= 0) {
      setFormError('Vui lòng chọn nhà cung cấp');
      return;
    }
    if (!trimmedUnit) {
      setFormError('Đơn vị là bắt buộc');
      return;
    }
    if (!Number.isInteger(nextQuantity) || nextQuantity < 0) {
      setFormError('Số lượng phải là số nguyên không âm');
      return;
    }
    if (!Number.isFinite(nextImportPrice) || nextImportPrice < 0) {
      setFormError('Giá nhập phải là số không âm');
      return;
    }
    if (!Number.isFinite(nextSellPrice) || nextSellPrice < 0) {
      setFormError('Giá bán phải là số không âm');
      return;
    }
    if (trimmedImageUrl && !validateUrl(trimmedImageUrl)) {
      setFormError('URL hình ảnh không hợp lệ');
      return;
    }

    const payload = {
      name: trimmedName,
      categoryId: nextCategoryId,
      supplierId: nextSupplierId,
      quantity: nextQuantity,
      unit: trimmedUnit,
      importPrice: nextImportPrice,
      sellPrice: nextSellPrice,
      description: trimmedDescription || null,
      imageUrl: trimmedImageUrl || null,
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setFormError(extractApiError(err, 'Không lưu được vật tư'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          {isEdit ? 'Sửa vật tư' : 'Thêm vật tư'}
        </h3>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2" noValidate>
          <div className="md:col-span-2">
            <label htmlFor="mat-name" className="mb-1 block text-sm font-medium text-slate-700">
              Tên vật tư <span className="text-red-500">*</span>
            </label>
            <input
              id="mat-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Ví dụ: Gỗ MDF"
              disabled={submitting}
              required
            />
          </div>

          <div>
            <label htmlFor="mat-category" className="mb-1 block text-sm font-medium text-slate-700">
              Loại vật tư <span className="text-red-500">*</span>
            </label>
            <select
              id="mat-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              disabled={submitting || optionsLoading}
              required
            >
              <option value="">Chọn loại vật tư</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mat-supplier" className="mb-1 block text-sm font-medium text-slate-700">
              Nhà cung cấp <span className="text-red-500">*</span>
            </label>
            <select
              id="mat-supplier"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              disabled={submitting || optionsLoading}
              required
            >
              <option value="">Chọn nhà cung cấp</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mat-quantity" className="mb-1 block text-sm font-medium text-slate-700">
              Số lượng <span className="text-red-500">*</span>
            </label>
            <input
              id="mat-quantity"
              type="number"
              min="0"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              disabled={submitting}
              required
            />
          </div>

          <div>
            <label htmlFor="mat-unit" className="mb-1 block text-sm font-medium text-slate-700">
              Đơn vị <span className="text-red-500">*</span>
            </label>
            <input
              id="mat-unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Ví dụ: tấm, mét, cái"
              disabled={submitting}
              required
            />
          </div>

          <div>
            <label htmlFor="mat-import-price" className="mb-1 block text-sm font-medium text-slate-700">
              Giá nhập
            </label>
            <input
              id="mat-import-price"
              type="number"
              min="0"
              step="0.01"
              value={importPrice}
              onChange={(e) => setImportPrice(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="mat-sell-price" className="mb-1 block text-sm font-medium text-slate-700">
              Giá bán
            </label>
            <input
              id="mat-sell-price"
              type="number"
              min="0"
              step="0.01"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              disabled={submitting}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="mat-image-url" className="mb-1 block text-sm font-medium text-slate-700">
              URL hình ảnh
            </label>
            <input
              id="mat-image-url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="https://example.com/image.jpg"
              disabled={submitting}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="mat-description" className="mb-1 block text-sm font-medium text-slate-700">
              Mô tả
            </label>
            <textarea
              id="mat-description"
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
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2"
            >
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 md:col-span-2">
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

function ConfirmDeleteModal({ material, loading, error, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-2 text-lg font-semibold text-slate-800">Xác nhận xoá</h3>
        <p className="text-sm text-slate-600">
          Bạn có chắc muốn xoá vật tư <span className="font-semibold">{material.name}</span>?
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
