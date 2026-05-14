import { useCallback, useEffect, useMemo, useState } from 'react';
import { listMaterials } from '../services/materialService.js';
import { listCategories } from '../services/categoryService.js';
import { listSuppliers } from '../services/supplierService.js';
import { listUsers } from '../services/userService.js';
import { useAuth } from '../contexts/AuthContext.jsx';

function extractApiError(err, fallback) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    fallback ||
    'Đã xảy ra lỗi'
  );
}

function formatCount(value) {
  if (value === null || typeof value === 'undefined') return '—';
  return new Intl.NumberFormat('vi-VN').format(value);
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    materials: null,
    categories: null,
    suppliers: null,
    users: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const canLoadUsers = user?.role === 'admin';

  const loadStats = useCallback(async () => {
    setLoading(true);
    setErrors({});

    const nextStats = {
      materials: null,
      categories: null,
      suppliers: null,
      users: canLoadUsers ? null : undefined,
    };
    const nextErrors = {};

    const [materialsResult, categoriesResult, suppliersResult, usersResult] =
      await Promise.allSettled([
        listMaterials(),
        listCategories(),
        listSuppliers(),
        canLoadUsers ? listUsers() : Promise.resolve(null),
      ]);

    if (materialsResult.status === 'fulfilled') {
      nextStats.materials = materialsResult.value.length;
    } else {
      nextErrors.materials = extractApiError(
        materialsResult.reason,
        'Không tải được số lượng vật tư'
      );
    }

    if (categoriesResult.status === 'fulfilled') {
      nextStats.categories = categoriesResult.value.length;
    } else {
      nextErrors.categories = extractApiError(
        categoriesResult.reason,
        'Không tải được số lượng loại vật tư'
      );
    }

    if (suppliersResult.status === 'fulfilled') {
      nextStats.suppliers = suppliersResult.value.length;
    } else {
      nextErrors.suppliers = extractApiError(
        suppliersResult.reason,
        'Không tải được số lượng nhà cung cấp'
      );
    }

    if (canLoadUsers) {
      if (usersResult.status === 'fulfilled') {
        nextStats.users = usersResult.value.length;
      } else {
        nextErrors.users = extractApiError(
          usersResult.reason,
          'Không tải được số lượng nhân sự'
        );
      }
    }

    setStats(nextStats);
    setErrors(nextErrors);
    setLoading(false);
  }, [canLoadUsers]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const statCards = useMemo(
    () => [
      {
        key: 'materials',
        label: 'Vật tư',
        value: stats.materials,
        helper: 'Tổng số vật tư đang quản lý',
      },
      {
        key: 'categories',
        label: 'Loại vật tư',
        value: stats.categories,
        helper: 'Tổng nhóm phân loại vật tư',
      },
      {
        key: 'suppliers',
        label: 'Nhà cung cấp',
        value: stats.suppliers,
        helper: 'Tổng nhà cung cấp đã lưu',
      },
      {
        key: 'users',
        label: 'Nhân sự',
        value: stats.users,
        helper: canLoadUsers ? 'Tổng tài khoản trong hệ thống' : 'Chỉ admin xem được',
      },
    ],
    [canLoadUsers, stats]
  );

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Dashboard</h2>
          <p className="text-sm text-slate-500">
            Tổng quan nhanh từ các API quản lý vật tư, loại vật tư, nhà cung cấp và nhân sự.
          </p>
        </div>
        <button
          type="button"
          onClick={loadStats}
          disabled={loading}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
        >
          {loading ? 'Đang tải...' : 'Tải lại'}
        </button>
      </div>

      {hasErrors && (
        <div
          role="alert"
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
        >
          Một số số liệu chưa tải được. Nếu máy chưa có SQL Server thì đây là blocker môi trường.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.key} className="rounded-lg bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {loading ? '...' : formatCount(card.value)}
                </p>
              </div>
              <span className="rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
                {card.key === 'users' && !canLoadUsers ? 'Admin' : 'Live'}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-500">{card.helper}</p>
            {errors[card.key] && (
              <p className="mt-2 text-xs text-red-600">{errors[card.key]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-800">Trạng thái dữ liệu</h3>
        <p className="mt-1 text-sm text-slate-500">
          Dashboard hiện dùng trực tiếp các API danh sách đã có để đếm số lượng. Khi chạy trên
          máy có SQL Server và đăng nhập thành công, các số liệu sẽ tự cập nhật theo dữ liệu thật.
        </p>
      </div>
    </div>
  );
}
