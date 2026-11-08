import { useEffect, useId, useRef, useState } from 'react';

const number = value => value.toLocaleString('en-IN');
const date = value => new Date(value + 'T00:00:00+05:30').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });

export default function ActivityChart({ points }) {
  const title = useId();
  const [selected, setSelected] = useState(null);
  const chart = useRef(null);
  const [width, setWidth] = useState(800);
  useEffect(() => {
    if (!chart.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
    observer.observe(chart.current);
    return () => observer.disconnect();
  }, []);
  const height = 260, left = 40, right = 16, top = 24, bottom = 34;
  const maximum = Math.max(4, ...points.flatMap(point => [point.events, point.previousEvents]));
  const ceiling = Math.ceil(maximum / 4) * 4;
  const x = index => left + (index / Math.max(1, points.length - 1)) * (width - left - right);
  const y = value => height - bottom - (value / ceiling) * (height - top - bottom);
  const path = key => points.map((point, index) => `${index ? 'L' : 'M'}${x(index)},${y(point[key])}`).join(' ');
  const active = Math.min(selected ?? points.length - 1, points.length - 1);
  const point = points[active];
  const hasData = points.some(p => p.events || p.previousEvents);

  return <section className="report-panel activity-panel" aria-labelledby={title}>
    <header className="panel-heading"><div><h2 id={title}>Audience activity</h2><p>Daily observed events · Asia/Kolkata</p></div><div className="chart-legend"><span><i />Selected period</span><span><i className="previous" />Previous period</span></div></header>
    {hasData ? <>
      <div className="chart-readout"><span>{date(point.day)}</span><strong>{number(point.events)} <small>events</small></strong><span>{number(point.sessions)} daily sessions</span><span>{number(point.previousEvents)} events in aligned prior day</span></div>
      <svg ref={chart} className="activity-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Daily events compared with the previous equal period"
        onPointerMove={event => { const rect = event.currentTarget.getBoundingClientRect(); const cursor = (event.clientX - rect.left) / rect.width * width; setSelected(Math.max(0, Math.min(points.length - 1, Math.round((cursor - left) / (width - left - right) * (points.length - 1))))); }}>
        <desc>Solid blue: selected period. Dashed grey: previous equal period. Use the day slider below for exact counts.</desc>
        {[0, 1, 2, 3, 4].map(tick => <g key={tick}><line x1={left} x2={width - right} y1={y(tick * ceiling / 4)} y2={y(tick * ceiling / 4)} className="chart-grid" /><text x={left - 12} y={y(tick * ceiling / 4) + 4} textAnchor="end">{number(tick * ceiling / 4)}</text></g>)}
        <path d={`${path('events')} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill="#edf3ff" />
        <path d={path('previousEvents')} className="chart-prior" />
        <path d={path('events')} className="chart-current" />
        <line x1={x(active)} x2={x(active)} y1={top} y2={height - bottom} className="chart-cursor" />
        <circle cx={x(active)} cy={y(point.events)} r="4" fill="#315cbd" stroke="white" strokeWidth="2" />
        {[...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])].map(index => <text key={index} x={x(index)} y={height - 8} textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}>{date(points[index].day)}</text>)}
      </svg>
      <label className="chart-scrubber">Inspect day<input type="range" min="0" max={points.length - 1} value={active} onChange={event => setSelected(Number(event.target.value))} aria-valuetext={`${date(point.day)}: ${point.events} events, ${point.sessions} daily sessions, ${point.previousEvents} previous-period events`} /></label>
    </> : <div className="report-empty"><span className="empty-chart-mark" aria-hidden="true">—</span><h3>No observed activity yet</h3><p>The chart will populate as consented events arrive. This does not establish zero visitors.</p></div>}
  </section>;
}
