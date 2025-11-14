// client/src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';
import { supabase } from '../lib/supabase';

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'error'|'success', message }
  const [showPassword, setShowPassword] = useState(false);

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setStatus(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    if (!validateEmail(form.email)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    if (!form.password) {
      setStatus({ type: 'error', message: 'Please enter your password.' });
      return;
    }

    setLoading(true);
    try {
      // signInWithPassword returns { data, error }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password
      });

      if (error) {
        setStatus({ type: 'error', message: error.message || 'Login failed' });
      } else {
        // data may contain session and user
        setStatus({ type: 'success', message: 'Logged in successfully.' });

        // Supabase stores session automatically in localStorage by default.
        // But we still allow a "remember" behavior: if remember==false, move token to sessionStorage.
        try {
          const session = data?.session;
          const user = data?.user;
          if (session && !form.remember) {
            // copy supabase token into sessionStorage and remove from localStorage to avoid persistent login
            // Supabase SDK already writes to localStorage; we move the raw session to sessionStorage to emulate "remember me" behavior.
            const raw = JSON.stringify(session);
            sessionStorage.setItem('mcsc_supabase_session', raw);
            // Optionally remove localStorage supabase data keys so session won't persist across browser restarts.
            // Be cautious: the SDK may overwrite these keys later. This is a lightweight approach.
            // localStorage keys used by Supabase typically start with 'sb-' — we won't remove them automatically.
            // For a robust remember-me, you'd handle session persistence server-side.
            sessionStorage.setItem('mcsc_user', JSON.stringify(user || {}));
          } else if (session && form.remember) {
            localStorage.setItem('mcsc_user', JSON.stringify(user || {}));
          }
        } catch (err) {
          console.warn('Storage handling failed:', err);
        }

        // Redirect to admin-verify (or home)
        setTimeout(() => navigate('/admin-verify', { replace: true }), 700);
      }
    } catch (err) {
      console.error('Login error:', err);
      setStatus({ type: 'error', message: 'Network or server error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card form-card" style={{ maxWidth: 520, margin: '28px auto' }}>
      <h2 style={{ marginTop: 0 }}>Log in</h2>

      <form onSubmit={handleSubmit} className="form-grid" noValidate>
        <label className="full">
          Email address
          <input
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label className="full">
          Password
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="Your password"
              type={showPassword ? 'text' : 'password'}
              style={{ flex: 1 }}
              autoComplete="current-password"
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

        <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
          <input
            name="remember"
            type="checkbox"
            checked={form.remember}
            onChange={onChange}
            style={{ margin: 0 }}
          />
          <span style={{ fontSize: 14, color: '#475569' }}>Remember me</span>
        </label>

        <div className="full" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/signup" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: 14 }}>Create account</Link>
          <Link to="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: 14 }}>Forgot password?</Link>
        </div>

        <div className="actions full" style={{ marginTop: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </div>
      </form>

      {status && (
        <div className={`status ${status.type === 'error' ? 'error' : 'success'}`} style={{ marginTop: 12 }}>
          {status.message}
        </div>
      )}
    </div>
  );
}