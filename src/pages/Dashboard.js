import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { fetchMyRegistrations } from '../api';
import '../index.css';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        const supUser = data?.user ?? null;
        setUser(supUser);

        // fetch saved profile from backend (as before)
        if (supUser && supUser.id) {
          try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:5000'}/api/auth/profile?supabaseId=${encodeURIComponent(supUser.id)}`);
            if (res.ok) {
              const d = await res.json();
              setProfile(d.profile);
            } else {
              setProfile(null);
            }
          } catch (err) {
            setProfile(null);
          }
        }

        // fetch user's registrations
        if (supUser && supUser.id) {
          const regsRes = await fetchMyRegistrations();
          if (regsRes && regsRes.registrations) setRegistrations(regsRes.registrations);
        }
      } catch (err) {
        console.warn('Failed to get user/profile', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        (async () => {
          try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:5000'}/api/auth/profile?supabaseId=${encodeURIComponent(session.user.id)}`);
            if (res.ok) {
              const d = await res.json();
              setProfile(d.profile);
            } else {
              setProfile(null);
            }
            const regsRes = await fetchMyRegistrations();
            if (regsRes && regsRes.registrations) setRegistrations(regsRes.registrations);
          } catch (err) {
            setProfile(null);
            setRegistrations([]);
          }
        })();
      } else {
        setProfile(null);
        setRegistrations([]);
      }
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

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      try {
        localStorage.removeItem('mcsc_user');
        localStorage.removeItem('mcsc_token');
        sessionStorage.removeItem('mcsc_user');
        sessionStorage.removeItem('mcsc_supabase_session');
      } catch (err) {}
      setProfile(null);
      setRegistrations([]);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  }

  if (loading) {
    return (
      <div className="card" style={{ maxWidth: 900, margin: '20px auto' }}>
        <h2>Dashboard</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card" style={{ maxWidth: 900, margin: '20px auto' }}>
        <h2>Dashboard</h2>
        <p>You are not signed in.</p>
        <div style={{ marginTop: 12 }}>
          <button onClick={() => navigate('/login')}>Go to login</button>
        </div>
      </div>
    );
  }

  const createdAt = profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : '—';

  return (
    <div className="card" style={{ maxWidth: 1000, margin: '20px auto' }}>
      <h2 style={{ marginTop: 0 }}>Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card" style={{ padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>Profile</h3>
          <div style={{ marginTop: 8 }}>
            <div><strong>Full name:</strong> {profile?.name ?? user.user_metadata?.full_name ?? '—'}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Class:</strong> {profile?.class ?? '—'}</div>
            <div><strong>Department:</strong> {profile?.department ?? '—'}</div>
            <div><strong>Version:</strong> {profile?.version ?? '—'}</div>
            <div><strong>Section:</strong> {profile?.section ?? '—'}</div>
            <div><strong>WhatsApp:</strong> {profile?.whatsapp ?? '—'}</div>
            <div><strong>Created:</strong> {createdAt}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>Actions</h3>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-primary" onClick={() => navigate('/registration-request')}>New Registration</button>
            <button className="btn btn-ghost" onClick={() => navigate('/admin-verify')}>View registrations</button>
            <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Your registration requests</h3>
        {registrations.length === 0 ? (
          <p>No registration requests found.</p>
        ) : (
          <div className="table-wrap">
            <table className="reg-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Class</th>
                  <th>Department</th>
                  <th>Section</th>
                  <th>Campus</th>
                  <th>Version</th>
                  <th>Building</th>
                  <th>Contact</th>
                  <th>Approved</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(r => (
                  <tr key={r._id}>
                    <td>{r.code}</td>
                    <td>{r.class}</td>
                    <td>{r.department}</td>
                    <td>{r.section}</td>
                    <td>{r.campus}</td>
                    <td>{r.version}</td>
                    <td>{r.building}</td>
                    <td>{r.contactNumber}</td>
                    <td>{r.approved ? 'Club member' : 'Membership pending'}</td>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}