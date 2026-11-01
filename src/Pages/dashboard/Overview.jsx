import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const queries = [
          supabase.from('projects').select('id', { count: 'exact', head: true }).eq('is_published', true),
          supabase.from('projects').select('id', { count: 'exact', head: true }).eq('is_published', false),
          supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
          supabase.from('contact_messages').select('id', { count: 'exact', head: true }),
        ];
        const results = await Promise.all(queries);
        const failed = results.find(result => result.error);
        if (failed) throw failed.error;
        if (active) setStats(results.map(result => result.count ?? 0));
      } catch (failure) { if (active) setError(failure.message); }
    }
    load();
    return () => { active = false; };
  }, []);
  return <section className="space-y-8">
    <header><p className="text-xs uppercase tracking-widest text-indigo-300 mb-2">Your workspace</p><h1 className="text-3xl font-semibold">Portfolio overview</h1><p className="text-gray-400 mt-2">Manage your work and keep up with new opportunities.</p></header>
    {error && <p role="alert" className="text-red-300">{error}</p>}
    {!stats && !error && <p role="status">Loading portfolio summary…</p>}
    {stats && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{['Published projects', 'Draft projects', 'Unread enquiries', 'Total enquiries'].map((label, index) => <Link key={label} to={index < 2 ? '../projects' : '../messages'} className="admin-metric block p-6 rounded-xl border border-white/10"><p className="text-gray-400 text-sm">{label}</p><p className="text-4xl font-semibold mt-4 tabular-nums">{stats[index]}</p><p className="text-xs text-gray-500 mt-3">Current total · all time</p></Link>)}</div>}
    <div className="grid lg:grid-cols-2 gap-6">
      <article className="admin-metric rounded-xl border border-white/10 p-6"><h2 className="text-lg font-semibold">Keep your portfolio current</h2><p className="text-gray-400 text-sm mt-2 mb-5">Review drafts, update case studies and publish your latest work.</p><Link to="../projects" className="text-indigo-300 underline">Manage projects →</Link></article>
      <article className="admin-metric rounded-xl border border-white/10 p-6"><h2 className="text-lg font-semibold">Audience analytics</h2><p className="text-gray-400 text-sm mt-2">Visitor tracking is not configured. Traffic, résumé clicks and conversion metrics will become available after event collection is implemented. No historical traffic has been inferred.</p></article>
    </div>
  </section>;
}
