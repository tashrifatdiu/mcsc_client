import React, { useState, useEffect } from 'react';
import { submitRegistration } from '../api';
import '../index.css';
import { supabase } from '../lib/supabase';

// helpers to generate sections (same as before)
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

// Building options kept same as before (if applicable)
const buildingOptions = [
  'main building',
  'building 22',
  'building 27',
  'building 07',
  'project 01',
  'project 02',
  'project 03',
  'project 04',
  'project 05',
  'project 06',
  'project 07'
];

const RegistrationRequest = () => {
  const [user, setUser] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(data?.user ?? null);
      } catch (err) {
        setUser(null);
      } finally {
        if (mounted) setAuthLoaded(true);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      if (sub && typeof sub.subscription?.unsubscribe === 'function') {
        sub.subscription.unsubscribe();
      } else if (sub?.unsubscribe) {
        sub.unsubscribe();
      }
    };
  }, []);

  // form state and logic (same as previously implemented)
  const [form, setForm] = useState({
    name: '',
    code: '',
    class: '9',
    section: 'a boys',
    campus: 'main campus',
    version: 'english',
    department: 'science',
    building: 'main building',
    contactNumber: ''
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [duplicate, setDuplicate] = useState(null);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function doSubmit(force = false) {
    setStatus(null);
    setLoading(true);
    try {
      const ret = await submitRegistration(form, { force });
      if (ret.conflict) {
        setDuplicate(ret.existing);
        setStatus({ type: 'error', message: 'A registration with this code already exists.' });
      } else {
        setStatus({ type: 'success', message: 'Registration submitted successfully. Approved: false' });
        setDuplicate(null);
        setForm({
          name: '',
          code: '',
          class: '9',
          section: 'a boys',
          campus: 'main campus',
          version: 'english',
          department: 'science',
          building: 'main building',
          contactNumber: ''
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      setStatus({ type: 'error', message: err.message || 'Network or server error' });
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.code || !form.section || !form.contactNumber || !form.department || !form.building) {
      setStatus({ type: 'error', message: 'Please fill required fields.' });
      return;
    }
    await doSubmit(false);
  }

  async function onForceCreate() {
    await doSubmit(true);
  }

  // If auth not loaded yet show nothing / loader
  if (!authLoaded) {
    return <div className="card" style={{ maxWidth: 900, margin: '20px auto' }}><p>Loading...</p></div>;
  }

  // If not logged in, show a prompt to log in (hide form)
  if (!user) {
    return (
      <div className="card form-card" style={{ maxWidth: 700, margin: '20px auto' }}>
        <h2>Registration Request</h2>
        <p>You must be logged in to submit a registration request.</p>
        <div style={{ marginTop: 12 }}>
          <a className="btn btn-ghost" href="/login">Log in</a>
        </div>
      </div>
    );
  }

  return (
    <div className="card form-card">
      <h2>Registration Request</h2>

      <form onSubmit={onSubmit} className="form-grid" noValidate>
        <label>
          Name *
          <input name="name" value={form.name} onChange={onChange} required />
        </label>

        <label>
          Code *
          <input name="code" value={form.code} onChange={onChange} required />
        </label>

        <label>
          Class *
          <select name="class" value={form.class} onChange={onChange}>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
          </select>
        </label>

        <label>
          Department *
          <select name="department" value={form.department} onChange={onChange}>
            <option value="science">Science</option>
            <option value="bst">BST</option>
            <option value="arts">Arts</option>
          </select>
        </label>

        <label>
          Section *
          <select name="section" value={form.section} onChange={onChange}>
            <optgroup label="Boys">
              {boys.map((s) => <option key={s} value={s}>{s}</option>)}
            </optgroup>
            <optgroup label="Girls">
              {girls.map((s) => <option key={s} value={s}>{s}</option>)}
            </optgroup>
          </select>
        </label>

        <label>
          Campus *
          <select name="campus" value={form.campus} onChange={onChange}>
            <option value="main campus">Main Campus</option>
            <option value="permanent campus">Permanent Campus</option>
          </select>
        </label>

        <label>
          Version *
          <select name="version" value={form.version} onChange={onChange}>
            <option value="english">English</option>
            <option value="bangla">Bangla</option>
          </select>
        </label>

        <label>
          Building *
          <select name="building" value={form.building} onChange={onChange}>
            {buildingOptions.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </label>

        <label className="full">
          Contact Number *
          <input name="contactNumber" value={form.contactNumber} onChange={onChange} required />
        </label>

        <div className="actions full">
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Submitting...' : 'Submit Registration'}</button>
        </div>
      </form>

      {status && (
        <div className={`status ${status.type === 'error' ? 'error' : 'success'}`} style={{ marginTop: 12 }}>
          {status.message}
        </div>
      )}

      {duplicate && (
        <div className="card" style={{ marginTop: 14, border: '1px solid #fee2e2' }}>
          <h3 style={{ marginTop: 0 }}>Code collision — matching registration found</h3>
          <p style={{ margin: '6px 0' }}>A registration with the same code number already exists. Details:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div><strong>Name:</strong> {duplicate.name}</div>
            <div><strong>Code:</strong> {duplicate.code}</div>
            <div><strong>Class:</strong> {duplicate.class}</div>
            <div><strong>Department:</strong> {duplicate.department}</div>
            <div><strong>Section:</strong> {duplicate.section}</div>
            <div><strong>Campus:</strong> {duplicate.campus}</div>
            <div><strong>Version:</strong> {duplicate.version}</div>
            <div><strong>Building:</strong> {duplicate.building}</div>
            <div><strong>Contact:</strong> {duplicate.contactNumber}</div>
            <div><strong>Approved:</strong> {duplicate.approved ? 'Yes' : 'No'}</div>
            <div><strong>Submitted At:</strong> {new Date(duplicate.createdAt).toLocaleString()}</div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => { setDuplicate(null); setStatus(null); }}>Cancel</button>
            <button className="btn btn-danger" onClick={onForceCreate}>Create duplicate anyway</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationRequest;