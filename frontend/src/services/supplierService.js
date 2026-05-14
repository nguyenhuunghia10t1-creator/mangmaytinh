import api from './api.js';

function unwrap(res) {
  return res?.data?.data ?? {};
}

export async function listSuppliers(q) {
  const params = {};
  if (q && q.trim().length > 0) params.q = q.trim();
  const res = await api.get('/suppliers', { params });
  return unwrap(res).suppliers ?? [];
}

export async function createSupplier(payload) {
  const res = await api.post('/suppliers', payload);
  return unwrap(res).supplier ?? null;
}

export async function updateSupplier(id, payload) {
  const res = await api.put(`/suppliers/${id}`, payload);
  return unwrap(res).supplier ?? null;
}

export async function deleteSupplier(id) {
  await api.delete(`/suppliers/${id}`);
}
