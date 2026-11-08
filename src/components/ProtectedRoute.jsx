import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase, isBackendConfigured } from '../supabase';
import { requireAdmin } from '../services/backend';

export default function ProtectedRoute({children}) {
  const [allowed, setAllowed] = useState(null);
  useEffect(() => {
    let active = true;
    let revision = 0;
    let timer;
    const check = async () => {
      const current = ++revision;
      try {
        const admin = await requireAdmin(supabase);
        if (active && current === revision) setAllowed(admin);
      } catch { if (active && current === revision) setAllowed(false); }
    };
    if (!isBackendConfigured) { setAllowed(false); return; }
    check();
    const {data:{subscription}} = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') { revision++; setAllowed(false); return; }
      // Supabase auth callbacks must not await additional auth requests.
      clearTimeout(timer);
      timer = setTimeout(check,0);
    });
    const onFocus = () => check();
    window.addEventListener('focus',onFocus);
    return () => { active=false; clearTimeout(timer); subscription.unsubscribe(); window.removeEventListener('focus',onFocus); };
  }, []);
  if (allowed === null) return <div role="status" className="admin-ui min-h-screen flex items-center justify-center">Checking admin access...</div>;
  if (!allowed) return <Navigate to="/login" replace />;
  return children;
}
