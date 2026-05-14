import api from './api.js';

function unwrap(res) {
  return res?.data?.data ?? {};
}

export async function listUsers(q) {
  const params = {};
  if (q && q.trim().length > 0) params.q = q.trim();
  const res = await api.get('/users', { params });
  return unwrap(res).users ?? [];
}

export async function createUser(payload) {
  const res = await api.post('/users', payload);
  return unwrap(res).user ?? null;
}

export async function updateUser(id, payload) {
  const res = await api.put(`/users/${id}`, payload);
  return unwrap(res).user ?? null;
}

export async function deleteUser(id) {
  await api.delete(`/users/${id}`);
}
