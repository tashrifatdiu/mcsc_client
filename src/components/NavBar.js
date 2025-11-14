import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';
import { supabase } from '../lib/supabase';

const NavBar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Load current user on mount and subscribe to auth changes
  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(data?.user ?? null);
      } catch (err) {
        console.warn('Failed to get supabase user', err);
      }
    }

    loadUser();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      // unsubscribe
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
      // Remove any local storage you used for session copies
      try {
        localStorage.removeItem('mcsc_user');
        localStorage.removeItem('mcsc_token');
        sessionStorage.removeItem('mcsc_user');
        sessionStorage.removeItem('mcsc_supabase_session');
      } catch (err) {
        // ignore
      }
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  }

  return (
    <nav className="site-nav">
      <div className="brand">Milestone College Science Club</div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/journal">Journal</Link>
        <Link to="/journal/gallery">Gallery</Link>
        <Link to="/club">Club</Link>
        <Link to="/olympiad">Olympiad</Link>
        <Link to="/registration-request">Registration Request</Link>
        <Link to="/admin-verify">Admin Verify</Link>
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/signup">Sign Up</Link>}
        {user && <Link to="/dashboard">Dashboard</Link>}
      </div>

      <div style={{ marginLeft: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
        {user ? (
          <>
            <div style={{ 
              color: 'var(--primary)', 
              fontSize: 14,
              textShadow: 'var(--primary-glow)'
            }}>
              {user.user_metadata?.full_name
                ? user.user_metadata.full_name
                : (user.email || user.id)}
            </div>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
};

export default NavBar;