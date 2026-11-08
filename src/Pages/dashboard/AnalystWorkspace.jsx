import { useEffect, useState } from 'react';
import { RefreshCw, Activity, Users, ArrowUpRight } from 'lucide-react';
import Analytics from './Analytics';
import { supabase } from '../../supabase';

const formatDate = value => new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function AdminSessions() {
  const [rows, setRows] = useState([]);
  const [names, setNames] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [asOf, setAsOf] = useState(Date.now());
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    async function load() {
      try {
        const [sessions, profiles] = await Promise.all([
          supabase.from('admin_workspace_sessions').select('*').order('started_at', { ascending: false }).limit(100),
          supabase.from('profiles').select('id,username'),
        ]);
        if (sessions.error) throw sessions.error;
        if (profiles.error) throw profiles.error;
        if (!active) return;
        setRows(sessions.data || []);
        setNames(Object.fromEntries((profiles.data || []).map(profile => [profile.id, profile.username])));
        setAsOf(Date.now());
      } catch (error) { if (active) setError(error.message); }
      finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [refresh]);
  const observed = rows.reduce((sum, row) => sum + row.active_seconds, 0);
  const recent = row => !row.ended_at && asOf - Date.parse(row.last_seen_at) < 90000;
  return <div className="report-stack">
    <div className="report-controls"><div><span className="report-period-label">Workspace observations</span><p>Latest 100 retained sessions</p></div><button className="report-button" disabled={loading} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={16} />Refresh</button></div>
    {error ? <div className="report-error" role="alert">Session tracking unavailable. Check the admin-session-analytics migration. {error}</div> : loading ? <p role="status" className="report-loading">Loading workspace sessions…</p> : <>
      <div className="kpi-strip three">{[['Sessions retained', rows.length, 'Within the latest 100 observations'], ['Observed active minutes', Math.round(observed / 60), 'Overlapping tabs are counted separately'], ['Recently seen', rows.filter(recent).length, 'As of the last refresh · within 90 seconds']].map(([label, value, note]) => <article key={label} className="kpi"><p className="kpi-label">{label}</p><div className="kpi-value">{value.toLocaleString('en-IN')}</div><p className="kpi-definition">{note}</p></article>)}</div>
      <section className="report-panel"><header className="panel-heading"><div><h2>Workspace activity</h2><p>Account-level observations · dates in Asia/Kolkata</p></div><span className="panel-meta">{rows.length} sessions</span></header>
        <div className="report-table-scroll"><table className="report-table"><caption className="sr-only">Retained administrator workspace sessions</caption><thead><tr>{['Account', 'Workspace opened', 'Last observation', 'Observed active time', 'State'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><strong>{names[row.user_id] || 'Admin account'}</strong><p className="table-secondary" title={row.user_id}>{row.user_id.slice(0, 8)}…</p></td><td>{formatDate(row.started_at)}</td><td>{formatDate(row.last_seen_at)}</td><td>{Math.floor(row.active_seconds / 60)}m {row.active_seconds % 60}s</td><td><span className={`status-badge ${recent(row) ? 'positive' : ''}`}>{row.ended_at ? 'Ended' : recent(row) ? 'Recently seen' : 'Inactive / end unknown'}</span></td></tr>)}</tbody></table></div>
        {!rows.length && <p className="report-empty-inline">No workspace sessions recorded yet</p>}
        <details className="report-methodology"><summary>How active time is measured</summary><p>These are workspace observations, not a complete authentication log. Visible tabs with recent interaction are sampled every 30 seconds. Inactivity over 2 minutes stops sampling. Abrupt closure may leave no recorded end. Tabs count separately and durations are not additive across overlapping tabs.</p></details>
      </section>
    </>}
  </div>;
}

export default function AnalystWorkspace() {
  const [tab, setTab] = useState('audience');
  return <section className="analyst-workspace">
    <header className="workspace-heading"><div><p className="workspace-eyebrow">Portfolio intelligence</p><h1>Performance overview</h1><p className="workspace-description">A measured view of your audience, projects and enquiries</p></div><span className="workspace-edition"><span>DB</span>Analytics workspace<ArrowUpRight size={14} /></span></header>
    <nav className="report-tabs" aria-label="Analytics views">{[['audience', 'Audience & projects', Activity], ['sessions', 'Admin sessions', Users]].map(([id, label, Icon]) => <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)}><Icon size={16} />{label}</button>)}</nav>
    {tab === 'audience' ? <Analytics /> : <AdminSessions />}
  </section>;
}
