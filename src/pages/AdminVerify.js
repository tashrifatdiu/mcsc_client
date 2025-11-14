import React, { useEffect, useState } from 'react';
import { adminLogin, adminFetchRegistrations, adminApproveRegistration } from '../api';
import '../index.css';

const LOCAL_TOKEN_KEY = 'mcsc_admin_token';
const LOCAL_ADMIN_KEY = 'mcsc_admin_info';

const AdminVerify = () => {
  const [adminInfo, setAdminInfo] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_ADMIN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(LOCAL_TOKEN_KEY) || null);

  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [regs, setRegs] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (token) loadRegs();
    // eslint-disable-next-line
  }, [token]);

  async function loadRegs() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await adminFetchRegistrations(token);
      if (res && res.registrations) {
        setRegs(res.registrations);
      } else {
        setRegs([]);
        setMessage('No registrations or failed to load');
      }
    } catch (err) {
      console.error('Failed to load admin registrations', err);
      setMessage(err.message || 'Failed to load');
      setRegs([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setMessage(null);
    if (!credentials.username || !credentials.password) {
      setMessage('Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      const res = await adminLogin(credentials.username, credentials.password);
      // res: { token, admin: { username, building } }
      setToken(res.token);
      setAdminInfo(res.admin);
      localStorage.setItem(LOCAL_TOKEN_KEY, res.token);
      localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(res.admin));
      setCredentials({ username: '', password: '' });
      setMessage('Logged in as ' + res.admin.username);
      await loadRegs();
    } catch (err) {
      console.error('Admin login failed', err);
      setMessage(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setToken(null);
    setAdminInfo(null);
    setRegs([]);
    localStorage.removeItem(LOCAL_TOKEN_KEY);
    localStorage.removeItem(LOCAL_ADMIN_KEY);
    setMessage('Logged out');
  }

  async function onApprove(id) {
    setMessage(null);
    try {
      const res = await adminApproveRegistration(id, token);
      setMessage('Approved');
      // refresh list
      await loadRegs();
    } catch (err) {
      console.error('Approve failed', err);
      setMessage(err.message || 'Approve failed');
    }
  }

  if (!token || !adminInfo) {
    return (
      <div className="card form-card" style={{ maxWidth: 520, margin: '20px auto' }}>
        <h2>Admin Login — Approve registrations for your building</h2>
        <form onSubmit={handleLogin} className="form-grid" style={{ gap: 10 }}>
          <label className="full">
            Username
            <input name="username" value={credentials.username} onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))} required />
          </label>

          <label className="full">
            Password
            <input type="password" name="password" value={credentials.password} onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))} required />
          </label>

          <div className="actions full">
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          </div>
        </form>

        {message && <div className="status" style={{ marginTop: 12 }}>{message}</div>}
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 1000, margin: '20px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ marginTop: 0 }}>Admin Verify — {adminInfo.username} ({adminInfo.building})</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {message && <div className="status" style={{ marginBottom: 12 }}>{message}</div>}

      {loading ? <div>Loading...</div> : (
        <div className="table-wrap">
          <table className="reg-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Class</th>
                <th>Department</th>
                <th>Section</th>
                <th>Campus</th>
                <th>Version</th>
                <th>Building</th>
                <th>Contact</th>
                <th>Approved</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {regs.map(r => (
                <tr key={r._id}>
                  <td>{r.name}</td>
                  <td>{r.code}</td>
                  <td>{r.class}</td>
                  <td>{r.department}</td>
                  <td>{r.section}</td>
                  <td>{r.campus}</td>
                  <td>{r.version}</td>
                  <td>{r.building}</td>
                  <td>{r.contactNumber}</td>
                  <td>{r.approved ? 'Yes' : 'No'}</td>
                  <td>
                    {!r.approved && <button className="btn btn-primary" onClick={() => onApprove(r._id)}>Approve</button>}
                  </td>
                </tr>
              ))}
              {regs.length === 0 && <tr><td colSpan="11">No registrations found for your building</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminVerify;