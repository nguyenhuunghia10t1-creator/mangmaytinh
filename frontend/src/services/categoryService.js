import api from './api.js';

function unwrap(res) {
  return res?.data?.data ?? {};
}

export async function listCategories(q) {
  const params = {};
  if (q && q.trim().length > 0) params.q = q.trim();
  const res = await api.get('/categories', { params });
  return unwrap(res).categories ?? [];
}

export async function createCategory(payload) {
  const res = await api.post('/categories', payload);
  return unwrap(res).category ?? null;
}

export async function updateCategory(id, payload) {
  const res = await api.put(`/categories/${id}`, payload);
  return unwrap(res).category ?? null;
}

export async function deleteCategory(id) {
  await api.delete(`/categories/${id}`);
}
