import React, { useState } from 'react';
import '../index.css';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0..4
}

// Reuse the same section generator used in RegistrationRequest
function generateLetterPairs() {
  const letters = [];
  for (let i = 0; i < 26; i++) letters.push(String.fromCharCode(97 + i));
  const doubles = [];
  for (let i = 0; i < 26; i++) {
    for (let j = 0; j < 26; j++) {
      doubles.push(String.fromCharCode(97 + i) + String.fromCharCode(97 + j));
    }
  }
  return { letters, doubles };
}
const { letters, doubles } = generateLetterPairs();
const buildSectionOptions = () => {
  const boys = [];
  const girls = [];
  letters.forEach(l => {
    boys.push(`${l} boys`);
    girls.push(`${l} girls`);
  });
  doubles.forEach(d => {
    boys.push(`${d} boys`);
    girls.push(`${d} girls`);
  });
  return { boys, girls };
};
const { boys, girls } = buildSectionOptions();

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    class: '9',
    department: 'science',
    version: 'english',
    whatsapp: '',
    section: 'a boys'
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'error'|'success', message }
  const [showPassword, setShowPassword] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setStatus(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    // Client-side validation
    if (!form.name.trim()) { setStatus({ type: 'error', message: 'Please enter your name.' }); return; }
    if (!validateEmail(form.email)) { setStatus({ type: 'error', message: 'Please enter a valid email address.' }); return; }
    if (form.password.length < 8) { setStatus({ type: 'error', message: 'Password must be at least 8 characters.' }); return; }
    if (form.password !== form.confirmPassword) { setStatus({ type: 'error', message: 'Passwords do not match.' }); return; }
    if (!form.whatsapp.trim()) { setStatus({ type: 'error', message: 'Please enter your WhatsApp number.' }); return; }

    setLoading(true);

    try {
      // Create Supabase user
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: {
            full_name: form.name.trim()
          }
        }
      });

      if (error) {
        setStatus({ type: 'error', message: error.message || 'Signup failed' });
        setLoading(false);
        return;
      }

      // data.user may be present when signUp completes immediately (no email confirmation),
      // otherwise Supabase will send an email; in either case we still save profile tied to supabaseId if available.
      const supabaseId = data?.user?.id || (data?.user ?? data)?.id || null;

      // If supabase returned a user id, send profile to backend. If it didn't (email confirm flow),
      // user won't have an id yet; you might decide to wait until confirmation or handle later via webhook.
      if (supabaseId) {
        const profileRes = await fetch(`${API_BASE}/api/auth/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supabaseId,
            email: form.email.trim().toLowerCase(),
            name: form.name.trim(),
            class: form.class,
            department: form.department,
            version: form.version,
            whatsapp: form.whatsapp.trim(),
            section: form.section
          })
        });

        const profileData = await profileRes.json();
        if (!profileRes.ok) {
          setStatus({ type: 'error', message: profileData.error || 'Failed to save profile' });
          setLoading(false);
          return;
        }
      } else {
        // Supabase requires email confirmation — still inform user
        // You may want to save a pending profile server-side via email as key — left as future step
      }

      const successMsg = supabaseId ? 'Account created and profile saved.' : 'Account created. Please check your email to confirm and then login.';
      setStatus({ type: 'success', message: successMsg });

      // Clear sensitive fields
      setForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        class: '9',
        department: 'science',
        version: 'english',
        whatsapp: '',
        section: 'a boys'
      });

      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      console.error('Signup error:', err);
      setStatus({ type: 'error', message: 'Network or server error' });
    } finally {
      setLoading(false);
    }
  }

  const strength = passwordStrength(form.password);
  const strengthLabels = ['Very weak', 'Weak', 'Okay', 'Good', 'Strong'];
  const strengthColors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#0ea5a0'];

  return (
    <div className="card form-card" style={{ maxWidth: 720, margin: '20px auto' }}>
      <h2 style={{ marginTop: 0 }}>Create an account</h2>

      <form onSubmit={handleSubmit} className="form-grid" noValidate>
        <label className="full">
          Full name
          <input name="name" value={form.name} onChange={onChange} placeholder="Your full name" autoComplete="name" required />
        </label>

        <label className="full">
          Email address
          <input name="email" value={form.email} onChange={onChange} placeholder="you@example.com" type="email" autoComplete="email" required />
        </label>

        <label>
          Class
          <select name="class" value={form.class} onChange={onChange}>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
          </select>
        </label>

        <label>
          Department
          <select name="department" value={form.department} onChange={onChange}>
            <option value="science">Science</option>
            <option value="bst">BST</option>
            <option value="arts">Arts</option>
          </select>
        </label>

        <label>
          Version
          <select name="version" value={form.version} onChange={onChange}>
            <option value="english">English</option>
            <option value="bangla">Bangla</option>
          </select>
        </label>

        <label>
          Section
          <select name="section" value={form.section} onChange={onChange}>
            <optgroup label="Boys">
              {boys.map(s => <option key={s} value={s}>{s}</option>)}
            </optgroup>
            <optgroup label="Girls">
              {girls.map(s => <option key={s} value={s}>{s}</option>)}
            </optgroup>
          </select>
        </label>

        <label className="full">
          WhatsApp number
          <input name="whatsapp" value={form.whatsapp} onChange={onChange} placeholder="e.g., 01XXXXXXXXX" required />
        </label>

        <label className="full">
          Password
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="At least 8 characters"
              type={showPassword ? 'text' : 'password'}
              style={{ flex: 1 }}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              className="btn btn-ghost"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <label className="full">
          Confirm password
          <input name="confirmPassword" value={form.confirmPassword} onChange={onChange} placeholder="Re-enter your password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required />
        </label>

        <div className="full" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <small style={{ color: '#475569' }}>Password strength: <strong>{strengthLabels[strength]}</strong></small>
            <small style={{ color: '#94a3b8' }}>Use a mix of letters, numbers, and symbols.</small>
          </div>
          <div style={{ height: 8, background: '#eef2f7', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(strength / 4) * 100}%`, background: strengthColors[strength], transition: 'width .2s ease' }} />
          </div>
        </div>

        <div className="actions full" style={{ marginTop: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        </div>
      </form>

      {status && <div className={`status ${status.type === 'error' ? 'error' : 'success'}`} style={{ marginTop: 12 }}>{status.message}</div>}

      <div style={{ marginTop: 12, color: '#475569', fontSize: 13 }}>
        By creating an account you agree to our terms. Already have an account? <a href="/login">Log in</a>
      </div>
    </div>
  );
}