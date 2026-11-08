import { useEffect, useState } from 'react';
import { ArrowUpRight, FolderGit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import { projectPerformance } from '../../utils/analytics';

export default function ProjectPerformance({ rows, start, end }) {
  const [names, setNames] = useState({});
  useEffect(() => {
    let active = true;
    supabase.from('projects').select('id,Title,Img').then(({ data }) => {
      if (active && data) setNames(Object.fromEntries(data.map(project => [String(project.id), project])));
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  const projects = projectPerformance(rows, start, end);
  return <section className="report-panel performance-panel">
    <header className="panel-heading"><div><h2>Project performance</h2><p>Ranked by observed views · enquiry attribution by session</p></div><Link className="report-text-link" to="/dashboard/projects">Manage projects<ArrowUpRight size={14} /></Link></header>
    {projects.length ? <div className="report-table-scroll"><table className="report-table"><caption className="sr-only">Project engagement during the selected reporting period</caption><thead><tr>{['Project', 'Views', 'Demo clicks', 'Source clicks', 'Session click rate', 'Attributed enquiries'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{projects.map((project, index) => <tr key={project.key}>
      <td><div className="project-table-name"><span className="rank-index">{String(index + 1).padStart(2, '0')}</span>{names[project.key]?.Img ? <img src={names[project.key].Img} alt="" /> : <span className="project-thumbnail-placeholder"><FolderGit2 size={18} /></span>}<span>{names[project.key]?.Title || `Project ${project.key}`}</span></div></td>
      <td>{project.views.toLocaleString('en-IN')}</td><td>{project.demo.toLocaleString('en-IN')}</td><td>{project.source.toLocaleString('en-IN')}</td>
      <td><span className="rate-cell">{project.clickRate === null ? '—' : project.clickRate.toFixed(1) + '%'}{project.clickRate !== null && <span><i style={{ width: `${project.clickRate}%` }} /></span>}</span></td><td>{project.leads.toLocaleString('en-IN')}</td>
    </tr>)}</tbody></table></div> : <div className="report-empty compact"><FolderGit2 size={24} /><h3>No project activity observed</h3><p>Project views and demo or source clicks will appear here as events arrive.</p></div>}
    <details className="report-methodology"><summary>Metric definitions & attribution</summary><p>Session click rate is the share of observed viewing sessions with a demo or source click. Enquiries are attributed to the last preceding project view in the same session and period, once per session and project. Unknown attribution is excluded. Click and view counts are events; attributed enquiries are sessions.</p></details>
  </section>;
}
