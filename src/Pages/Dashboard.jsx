function readTheme(){try{return localStorage.getItem('workspace-theme')||'dark';}catch{return 'dark';}}
import { useEffect, useRef, useState } from 'react';
import { Routes, Route, NavLink, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import Projects from './dashboard/Projects';
import AdminFeedback from '../components/AdminFeedback';
import Overview from './dashboard/Overview';
import Reports from './dashboard/Reports';
import Analytics from './dashboard/Analytics';
import Settings from './dashboard/Settings';
import Content from './dashboard/Content';
import Audit from './dashboard/Audit';
import Certificates from './dashboard/Certificates';
import Comments from './dashboard/Comments';
import Messages from './dashboard/Messages';
import { FolderGit2, Award, MessageSquare, LogOut, LayoutDashboard, Menu, X, ArrowUpRight } from 'lucide-react';

const items = [
  ['overview', 'Overview', LayoutDashboard],
  ['reports', 'Reports', LayoutDashboard],
  ['analytics', 'Analytics', LayoutDashboard],
  ['settings', 'Settings', LayoutDashboard],
  ['content', 'Content studio', LayoutDashboard],
  ['audit', 'Audit history', LayoutDashboard],
  ['projects', 'Projects', FolderGit2],
  ['messages', 'Inbox', MessageSquare],
  ['certificates', 'Certificates', Award],
  ['comments', 'Guestbook', MessageSquare],
];

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const trigger = useRef(null);
  const drawer = useRef(null);
  const title = items.find(([path]) => location.pathname.split('/').includes(path))?.[1] || 'Overview';
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    drawer.current?.querySelector('button')?.focus();
    function keyboard(event) {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'Tab') {
        const nodes = [...drawer.current.querySelectorAll('a, button')];
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', keyboard);
    return () => { document.removeEventListener('keydown', keyboard); previous?.focus(); };
  }, [open]);
  async function logout() {
    const result = await supabase.auth.signOut();
    if (result.error) setError(result.error.message);
    else navigate('/login', { replace: true });
  }
  function navigation(mobile = false) {
    return <>
      <div className="workspace-brand"><img src="/favicon.svg" alt="" width="36" height="36"/><div><strong>Diganta</strong><span>Portfolio workspace</span></div>{mobile && <button aria-label="Close navigation" onClick={() => setOpen(false)}><X size={20}/></button>}</div>
      <p className="workspace-label">Workspace</p>
      <nav aria-label="Admin navigation">{items.map(([path, label, Icon]) => <NavLink key={path} to={`/dashboard/${path}`} onClick={() => setOpen(false)} className={({isActive}) => `workspace-nav ${isActive ? 'is-active' : ''}`}><Icon size={18}/>{label}</NavLink>)}</nav>
      <div className="workspace-sidebar-footer"><Link to="/">View website <ArrowUpRight size={16}/></Link><button onClick={logout}><LogOut size={16}/>Sign out</button></div>
    </>;
  }
  return <div className="admin-workspace workspace-shell" data-theme={readTheme()}>
    <AdminFeedback/><aside className="workspace-sidebar">{navigation()}</aside>
    {open && <div className="workspace-overlay" onClick={() => setOpen(false)}><aside ref={drawer} role="dialog" aria-modal="true" aria-label="Navigation" className="workspace-drawer" onClick={event => event.stopPropagation()}>{navigation(true)}</aside></div>}
    <div className="workspace-body"><header className="workspace-header"><div className="flex items-center gap-3"><button ref={trigger} className="workspace-menu" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}><Menu size={20}/></button><span className="text-gray-500">Workspace /</span><strong>{title}</strong></div><Link to="/" className="workspace-website">View website <ArrowUpRight size={16}/></Link></header>
      <main id="admin-main" className="workspace-main">{error && <p role="alert" className="text-red-600 mb-4">{error}</p>}<Routes>
        <Route index element={<Navigate to="overview" replace/>}/><Route path="overview" element={<Overview/>}/><Route path="reports" element={<Reports/>}/><Route path="analytics" element={<Analytics/>}/><Route path="settings" element={<Settings/>}/><Route path="content" element={<Content/>}/><Route path="audit" element={<Audit/>}/><Route path="projects" element={<Projects/>}/><Route path="messages" element={<Messages/>}/><Route path="certificates" element={<Certificates/>}/><Route path="comments" element={<Comments/>}/><Route path="*" element={<Navigate to="overview" replace/>}/>
      </Routes></main>
    </div>
  </div>;
}
