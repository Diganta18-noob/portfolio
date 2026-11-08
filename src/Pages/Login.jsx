import { useState } from 'react'
import { supabase, isBackendConfigured, backendSetupMessage } from "../supabase";
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn, ArrowLeft, Eye, EyeOff } from 'lucide-react'

import { requireAdmin } from '../services/backend';

export default function Login() {
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isBackendConfigured || loading) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const { error } = await supabase.auth.signInWithPassword({email:email.trim(), password});
      if (error) throw error;
      if (!await requireAdmin(supabase)) {
        await supabase.auth.signOut();
        throw new Error('Access denied. Your account needs an admin profile.');
      }
      navigate('/dashboard', {replace:true});
    } catch (error) {
      setErrorMessage(error.message || 'Unable to sign in. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="admin-ui admin-login">
      <div className="admin-login-card">
        <div className="admin-brand admin-login-brand">
          <span className="admin-monogram">DB</span>
          <span><strong>Portfolio manager</strong><small>Diganta Biswas</small></span>
        </div>
        <div className="admin-panel admin-login-panel">
          <header><h1>Admin sign in</h1><p>Manage your projects, messages and portfolio content</p></header>
          {!isBackendConfigured && <p role="status" className="text-amber-200 text-sm mb-6">Admin login needs your Supabase project. {backendSetupMessage} Run supabase/setup.sql and create an admin profile using BACKEND-SETUP.md.</p>}
          {errorMessage && <p role="alert" className="text-red-300 text-sm mb-6">{errorMessage}</p>}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="admin-email">Email</label>
              <div className="admin-login-field"><Mail aria-hidden="true" />
                <input id="admin-email" autoComplete="username" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div>
              <label htmlFor="admin-password">Password</label>
              <div className="admin-login-field"><Lock aria-hidden="true" />
                <input id="admin-password" autoComplete="current-password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(prev => !prev)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            <button type="submit" disabled={loading || !isBackendConfigured} className="admin-primary w-full">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</> : <>Sign in<LogIn size={16} aria-hidden="true" /></>}
            </button>
          </form>
        </div>
        <a href="/" className="admin-login-back"><ArrowLeft size={16} aria-hidden="true" />Back to portfolio</a>
      </div>
    </div>
  )
}
