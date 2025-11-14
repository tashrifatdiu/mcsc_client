import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export default function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(data?.user ?? null);
      } catch (err) {
        console.warn('useAuth getUser failed', err);
      }
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
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

  return user;
}
