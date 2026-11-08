import CommandPalette from '../components/CommandPalette';
import AnalystWorkspace from './dashboard/AnalystWorkspace';
import AdminSessionObserver from '../components/AdminSessionObserver';
import AdminFeedback from '../components/AdminFeedback';
import { useEffect, useRef, useState } from 'react'
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Projects from './dashboard/Projects'
import Certificates from './dashboard/Certificates'
import Comments from './dashboard/Comments'
import Messages from './dashboard/Messages'
import { FolderGit2, Award, MessageSquare, LogOut, LayoutDashboard, Menu, X, ArrowUpRight, ChevronRight } from 'lucide-react'

const NAV_ITEMS = [
  { to: 'analytics', label: 'Analytics studio', icon: LayoutDashboard },
  { to: 'messages', label: 'Private messages', icon: MessageSquare },
  { to: 'projects', label: 'Projects', icon: FolderGit2 },
  { to: 'certificates', label: 'Certificates', icon: Award },
  { to: 'comments', label: 'Comments', icon: MessageSquare },
]

export default function Dashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const update = () => { setDesktop(media.matches); setSidebarOpen(false) }
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const menuButton = useRef(null)
  const sidebar = useRef(null)
  const current = NAV_ITEMS.find(item => location.pathname.split('/')[2] === item.to)
  const closeSidebar = () => { setSidebarOpen(false); menuButton.current?.focus() }

  useEffect(() => {
    if (!sidebarOpen) return
    const nav = sidebar.current
    nav?.querySelector('button')?.focus()
    function keydown(event) {
      if (event.key === 'Escape') { setSidebarOpen(false); menuButton.current?.focus() }
      if (event.key === 'Tab') {
        const controls = [...nav.querySelectorAll('a,button')].filter(element => element.getClientRects().length)
        const first = controls[0], last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', keydown)
    return () => document.removeEventListener('keydown', keydown)
  }, [sidebarOpen])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      navigate('/login', { replace: true })
    } catch (error) { setError(error.message) }
  }

  return (
    <div className="admin-ui admin-shell">
      {sidebarOpen && <div className="admin-drawer-overlay lg:hidden" onClick={closeSidebar} aria-hidden="true" />}
      <aside ref={sidebar} inert={!desktop && !sidebarOpen ? '' : undefined} id="admin-navigation" aria-label="Workspace navigation" className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar-content">
          <button className="admin-drawer-close" aria-label="Close navigation" onClick={closeSidebar}><X size={16} /></button>
          <Link to="/dashboard/projects" className="admin-brand" onClick={() => setSidebarOpen(false)}>
            <span className="admin-monogram">DB</span>
            <span><strong>Portfolio manager</strong><small>Diganta Biswas</small></span>
          </Link>
          <nav className="admin-nav" aria-label="Admin pages">
            <p className="admin-nav-label">Workspace</p>
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setSidebarOpen(false)} aria-current={current?.to === to ? 'page' : undefined} className="admin-nav-link">
                <Icon aria-hidden="true" />{label}
              </Link>
            ))}
          </nav>
          <div className="admin-sidebar-footer">
            <button onClick={handleLogout} className="admin-nav-link"><LogOut aria-hidden="true" />Sign out</button>
            <div className="admin-owner"><span>DB</span><span>Portfolio administration</span></div>
          </div>
        </div>
      </aside>
      <div className="admin-main-column" inert={sidebarOpen ? '' : undefined}>
        <header className="admin-toolbar">
          <div className="admin-breadcrumb">
            <button ref={menuButton} className="admin-menu-toggle" aria-label="Open navigation" aria-expanded={sidebarOpen} aria-controls="admin-navigation" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
            <span className="admin-workspace-label">Workspace</span><ChevronRight className="admin-workspace-label" size={14} aria-hidden="true" />
            <strong>{current?.label || 'Projects'}</strong>
          </div>
          <div className="admin-toolbar-actions">
            <CommandPalette />
            <Link to="/" className="admin-portfolio-link" aria-label="View portfolio"><span>View portfolio</span><ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        </header>
        <main className="admin-content" id="admin-main">
          <div className="admin-content-inner">
            {error && <p role="alert" className="text-red-300 mb-6">{error}</p>}
            <AdminSessionObserver /><AdminFeedback />
            <Routes>
              <Route path="analytics" element={<AnalystWorkspace />} />
              <Route index element={<Navigate to="projects" replace />} />
              <Route path="projects" element={<Projects />} />
              <Route path="certificates" element={<Certificates />} />
              <Route path="comments" element={<Comments />} />
              <Route path="messages" element={<Messages />} />
              <Route path="*" element={<Navigate to="projects" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}
