// client/src/api.js
import { supabase } from './lib/supabase';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

// Robust helper to get the current Supabase access token.
// It tries supabase.auth.getSession() first, then a few common fallback storage keys.
// Returns the token string or null.
export async function getAccessToken() {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token || null;
    if (token) return token;
  } catch (err) {
    console.warn('supabase.auth.getSession() error', err);
  }

  // Fallback checks (if any earlier code stored session manually)
  try {
    const keysToTry = [
      'mcsc_supabase_session',
      'supabase.auth.token',
      'sb:session',
      'supabase-session'
    ];
    for (const k of keysToTry) {
      const raw = sessionStorage.getItem(k) || localStorage.getItem(k);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        // several shapes used historically -- try common ones
        if (parsed?.access_token) return parsed.access_token;
        if (parsed?.currentSession?.access_token) return parsed.currentSession.access_token;
        if (parsed?.persistedSession?.access_token) return parsed.persistedSession.access_token;
        if (parsed?.persistedSession?.currentSession?.access_token) return parsed.persistedSession.currentSession.access_token;
      } catch (e) {
        // ignore parse errors
      }
    }
  } catch (err) {
    console.warn('fallback session read failed', err);
  }

  return null;
}

// submitRegistration(payload, options = {})
export async function submitRegistration(payload, options = {}) {
  const body = { ...payload };
  if (options.force) body.force = true;

  const token = await getAccessToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/registration`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
  } catch (networkErr) {
    // network-level failure (DNS, refused connection)
    throw new Error('Network error: failed to reach server. Check API_BASE and server status.');
  }

  // Try parse JSON; if non-json (HTML 404 page) include text for debugging
  let data;
  try {
    data = await res.json();
  } catch (err) {
    const text = await res.text();
    if (res.status === 404) {
      throw new Error(`Not Found (404): ${text || 'endpoint not available'}`);
    }
    throw new Error(text || res.statusText || `Request failed with status ${res.status}`);
  }

  if (res.status === 409) {
    return { conflict: true, existing: data.existing, message: data.error || 'Conflict' };
  }

  if (res.status === 401) {
    // Clear message so UI can guide user to re-login
    throw new Error(data.error || 'Unauthorized. Session missing or expired. Please log in again.');
  }

  if (!res.ok) {
    const msg = data && (data.error || data.message) ? (data.error || data.message) : JSON.stringify(data);
    throw new Error(msg || res.statusText || `Request failed with status ${res.status}`);
  }

  return data;
}

// Other helpers used elsewhere in app
export async function fetchRegistrations() {
  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/registration`);
  const data = await res.json();
  return data;
}

export async function fetchMyRegistrations() {
  const token = await getAccessToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/registration/my`, { headers });
  const data = await res.json();
  return data;
}

// admin helpers preserved if you use them
export async function adminLogin(username, password) {
  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Admin login failed');
  return data;
}

export async function adminFetchRegistrations(adminToken) {
  const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/admin/registrations`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch registrations');
  return data;
}

export async function adminApproveRegistration(id, adminToken) {
  const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/admin/registrations/${id}/approve`, {
    method: 'PATCH',
    headers
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Approve failed');
  return data;
}