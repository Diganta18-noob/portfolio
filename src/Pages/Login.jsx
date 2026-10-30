import { useState } from 'react'
import { supabase, isBackendConfigured, backendSetupMessage } from "../supabase";
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn, Sparkles, Eye, EyeOff } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-700" />
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/15 rounded-2xl p-8 space-y-7">

            {/* Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/25">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-indigo-300 text-xs font-medium">Admin Portal</span>
              </div>
              <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
              <p className="text-gray-400 text-sm">Sign in to manage your portfolio</p>
            </div>

            {!isBackendConfigured && <p role="status" className="text-amber-200 text-sm rounded-xl bg-amber-500/10 p-4">Admin login needs your Supabase project. {backendSetupMessage} Run supabase/setup.sql and create an admin profile using BACKEND-SETUP.md.</p>}
            {errorMessage && <p role="alert" className="text-red-300 text-sm">{errorMessage}</p>}
            <a href="/" className="text-sm text-indigo-300 hover:underline">Back to portfolio</a>
            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="admin-email" className="text-xs text-gray-400 uppercase tracking-wider">Email</label>
                <div className="flex items-center bg-white/8 border border-white/15 rounded-xl overflow-hidden focus-within:border-indigo-500/60 transition-colors">
                  <Mail className="w-4 h-4 text-gray-500 ml-4 shrink-0" />
                  <input
                    id="admin-email" autoComplete="username" type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent px-3 py-3 text-gray-100 placeholder-gray-500 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="admin-password" className="text-xs text-gray-400 uppercase tracking-wider">Password</label>
                <div className="flex items-center bg-white/8 border border-white/15 rounded-xl overflow-hidden focus-within:border-indigo-500/60 transition-colors">
                  <Lock className="w-4 h-4 text-gray-500 ml-4 shrink-0" />
                  <input
                    id="admin-password" autoComplete="current-password" type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full bg-transparent px-3 py-3 text-gray-100 placeholder-gray-500 text-sm outline-none"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(prev => !prev)}
                    className="mr-4 shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading || !isBackendConfigured} className="relative group/btn w-full mt-1">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-70 blur group-hover/btn:opacity-100 transition duration-300" />
                <div className="relative h-11 bg-[#030014] rounded-xl border border-white/10 flex items-center justify-center gap-2 overflow-hidden">
                  <div className="absolute inset-0 scale-x-0 group-hover/btn:scale-x-100 origin-left transition-transform duration-500 bg-gradient-to-r from-[#4f52c9]/20 to-[#8644c5]/20" />
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="relative text-sm font-medium text-white">Sign In</span>
                      <LogIn className="relative w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}