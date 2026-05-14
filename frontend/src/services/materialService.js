import api from './api.js';

function unwrap(res) {
  return res?.data?.data ?? {};
}

export async function listMaterials(filters = {}) {
  const params = {};
  if (filters.q && filters.q.trim().length > 0) params.q = filters.q.trim();
  if (filters.categoryId) params.categoryId = filters.categoryId;
  if (filters.supplierId) params.supplierId = filters.supplierId;
  const res = await api.get('/materials', { params });
  return unwrap(res).materials ?? [];
}

export async function createMaterial(payload) {
  const res = await api.post('/materials', payload);
  return unwrap(res).material ?? null;
}

export async function updateMaterial(id, payload) {
  const res = await api.put(`/materials/${id}`, payload);
  return unwrap(res).material ?? null;
}

export async function deleteMaterial(id) {
  await api.delete(`/materials/${id}`);
}
