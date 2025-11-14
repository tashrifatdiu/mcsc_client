// client/src/apiJournal.js
// Journal-related client API helpers. Uses getAccessToken from existing api.js
import { getAccessToken } from './api';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export async function createJournal(payload) {
  const token = await getAccessToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/journal`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to save journal');
  return data;
}

export async function updateJournal(id, payload) {
  const token = await getAccessToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/journal/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to update journal');
  return data;
}

export async function fetchJournals({ limit = 20, skip = 0 } = {}) {
  // support mine flag and author filter
  const query = new URLSearchParams({ limit: String(limit), skip: String(skip) });
  if (arguments[0] && arguments[0].mine) query.set('mine', 'true');
  if (arguments[0] && arguments[0].authorId) query.set('authorId', arguments[0].authorId);

  const url = `${API_BASE.replace(/\/$/, '')}/api/journal?${query.toString()}`;
  const headers = {};
  if (arguments[0] && arguments[0].mine) {
    const token = await getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });
  const data = await res.json();
  return data;
}

export async function deleteJournal(id) {
  const token = await getAccessToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/journal/${id}`, {
    method: 'DELETE',
    headers
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to delete journal');
  return data;
}

export async function fetchJournalById(id) {
  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/journal/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch journal');
  return data;
}