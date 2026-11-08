import { useEffect, useState } from 'react';
import { ArrowDownToLine, CalendarDays, RefreshCw, ArrowUpRight, Info } from 'lucide-react';
import CollectionHealth from './CollectionHealth';
import ProjectPerformance from './ProjectPerformance';
import ActivityChart from './ActivityChart';
import { csvCell } from '../../utils/reports';
import { summarizeEvents, periodDelta, dailyActivity } from '../../utils/analytics';
import { supabase } from '../../supabase';

const DAY = 86400000;
const number = value => value.toLocaleString('en-IN');
const date = value => new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });

export default function Analytics() {
  const [range, setRange] = useState(() => ({ days: 30, end: Date.now() }));
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const start = range.end - range.days * DAY;
  useEffect(() => {
    let active = true;
    setRows(null); setError('');
    async function load() {
      try {
        const all = [];
        let offset = 0;
        while (true) {
          const { data, error } = await supabase.from('analytics_events')
            .select('received_at,session_id,event_name,path,project_key')
            .gte('received_at', new Date(range.end - range.days * 2 * DAY).toISOString())
            .lt('received_at', new Date(range.end).toISOString())
            .order('received_at').order('event_id').range(offset, offset + 499);
          if (error) throw error;
          all.push(...data);
          if (data.length < 500) break;
          offset += 500;
        }
        if (active) setRows(all);
      } catch (error) { if (active) setError(error.message); }
    }
    load();
    return () => { active = false; };
  }, [range]);

  const current = summarizeEvents(rows || [], start, range.end);
  const previous = summarizeEvents(rows || [], start - range.days * DAY, start);
  const pages = Object.entries(current.paths).sort((a, b) => b[1] - a[1]);
  const pageViews = Object.values(current.paths).reduce((sum, value) => sum + value, 0);
  const previousViews = Object.values(previous.paths).reduce((sum, value) => sum + value, 0);
  const selected = (rows || []).filter(row => Date.parse(row.received_at) >= start && Date.parse(row.received_at) < range.end);
  const counts = Object.entries(selected.reduce((all, row) => ({ ...all, [row.event_name]: (all[row.event_name] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);

  function exportEvents() {
    const body = [['Received UTC', 'Event', 'Path', 'Project key'], ...selected.map(row => [row.received_at, row.event_name, row.path, row.project_key])]
      .map(row => row.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + body], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `portfolio-events-${range.days}days.csv`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className="report-stack">
    <div className="report-controls">
      <div><span className="report-period-label">Reporting period</span><p>{date(start)} <span className="muted">—</span> {date(range.end)}</p></div>
      <div className="report-control-actions">
        <label className="period-control"><CalendarDays size={16} /><span className="sr-only">Reporting period</span><select value={range.days} onChange={event => setRange({ days: Number(event.target.value), end: Date.now() })}>{[7, 30, 90].map(days => <option key={days} value={days}>Last {days} days</option>)}</select></label>
        <button className="report-button icon-button" aria-label="Refresh analytics" onClick={() => setRange(value => ({ ...value, end: Date.now() }))}><RefreshCw size={16} /></button>
        <button className="report-button" disabled={!rows || Boolean(error)} onClick={exportEvents}><ArrowDownToLine size={16} />Export CSV</button>
      </div>
    </div>
    {error ? <div className="report-error" role="alert"><h2>Analytics unavailable</h2><p>Check analytics access and the database migration. Content management remains available.</p><p>{error}</p><button className="report-button" onClick={() => setRange(value => ({ ...value, end: Date.now() }))}>Try again</button></div>
      : rows === null ? <div className="report-loading" role="status"><RefreshCw size={18} className="animate-spin" />Loading the selected period…</div>
        : <>
          <div className="kpi-strip">
            {[
              ['Observed sessions', current.sessions, previous.sessions, 'Consented activity · tabs counted separately'],
              ['Page views', pageViews, previousViews, 'Observed page-view events'],
              ['Contact starts', current.starts, previous.starts, 'Sessions that began an enquiry'],
              ['Converted sessions', current.converts, previous.converts, 'Start followed by acknowledged submission'],
            ].map(([label, value, prior, description], index) => <article className="kpi" key={label}>
              <div className="kpi-label"><span>{label}</span><span className="kpi-index">0{index + 1}</span></div>
              <div className="kpi-value">{number(value)}</div>
              <p className="kpi-comparison"><span className={prior && value > prior ? 'delta-up' : 'delta-neutral'}>{prior && value > prior ? '+' : ''}{periodDelta(value, prior)}</span> vs previous {range.days} days</p>
              <p className="kpi-definition">{description}</p>
            </article>)}
          </div>
          <div className="report-main-grid">
            <ActivityChart points={dailyActivity(rows, start, range.end)} />
            <section className="report-panel funnel-panel">
              <header className="panel-heading"><div><h2>Enquiry funnel</h2><p>From attention to intent</p></div><ArrowUpRight size={18} /></header>
              <div className="funnel-rate">{current.conversion === null ? '—' : current.conversion.toFixed(1) + '%'}<span>start-to-submit rate</span></div>
              <div className="funnel-steps">{[['Observed sessions', current.sessions], ['Contact started', current.starts], ['Submission acknowledged', current.converts]].map(([label, value], index) => <div className="funnel-step" key={label}>
                <div><span><small>0{index + 1}</small>{label}</span><strong>{number(value)}</strong></div>
                <div className="funnel-track"><div style={{ width: current.sessions ? `${100 * value / current.sessions}%` : '0%' }} /></div>
              </div>)}</div>
              <p className="panel-footnote">Ordered events within a session. Repeat submissions count once. Acknowledgement does not establish email delivery.</p>
            </section>
          </div>
          <ProjectPerformance rows={rows} start={start} end={range.end} />
          <div className="report-secondary-grid">
            <section className="report-panel"><header className="panel-heading"><div><h2>Page engagement</h2><p>Where observed page views concentrate</p></div><span className="panel-meta">{number(pageViews)} views</span></header>
              {pages.length ? <div className="page-ranking">{pages.slice(0, 8).map(([path, value], index) => <div className="page-rank" key={path}><span className="rank-index">{String(index + 1).padStart(2, '0')}</span><div><span className="page-path">{path || '/'}</span><div className="ranking-track"><div style={{ width: `${100 * value / pages[0][1]}%` }} /></div></div><strong>{number(value)}</strong><span>{(100 * value / pageViews).toFixed(1)}%</span></div>)}</div> : <p className="report-empty-inline">No page-view events in this period</p>}
              {pages.length > 8 && <p className="panel-footnote">Top 8 of {pages.length} observed paths</p>}
            </section>
            <section className="report-panel"><header className="panel-heading"><div><h2>Event composition</h2><p>Observed interactions in this period</p></div><span className="panel-meta">{number(current.events)} total</span></header>
              {counts.length ? <div className="event-list">{counts.map(([name, value]) => <div key={name}><span>{name.replaceAll('_', ' ')}</span><strong>{number(value)}</strong></div>)}</div> : <p className="report-empty-inline">No retained events in this period</p>}
            </section>
          </div>
          <div className="report-context"><Info size={16} /><p>Observed activity only. Opt-outs, blocked requests and separate tabs limit coverage. Session counts are not unique visitors.</p><span>As of {new Date(range.end).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })} IST</span></div>
        </>}
    <CollectionHealth />
  </div>;
}
