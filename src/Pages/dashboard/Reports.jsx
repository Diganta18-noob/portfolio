import {useEffect, useState} from 'react';
import {supabase} from '../../supabase';
import {enquiriesCsv} from '../../utils/reports';
export default function Reports() {
  const [days,setDays]=useState(()=>{try{return Number(localStorage.getItem('report-period'))||30;}catch{return 30;}}), [rows,setRows]=useState(null), [error,setError]=useState('');
  const [presets,setPresets]=useState([]),[presetName,setPresetName]=useState(''),[presetError,setPresetError]=useState('');
  async function loadPresets(){const {data,error}=await supabase.from('report_presets').select('id,name,days').order('created_at',{ascending:false});if(error)setPresetError('Saved views unavailable until the content/reports migration is installed.');else{setPresets(data);setPresetError('');}}
  useEffect(()=>{loadPresets();},[]);
  async function savePreset(){const name=presetName.trim();if(!name)return;const {error}=await supabase.from('report_presets').insert({name,days});if(error)setPresetError(error.message);else{setPresetName('');await loadPresets();}}
  async function removePreset(id){const {error}=await supabase.from('report_presets').delete().eq('id',id);if(error)setPresetError(error.message);else await loadPresets();}
  useEffect(()=>{let active=true;setRows(null);setError('');
    async function load(){try{
      const start=new Date(Date.now()-days*86400000).toISOString();
      const end=new Date().toISOString();
      let all=[], offset=0;
      while(true){const {data,error}=await supabase.from('contact_messages').select('*').gte('created_at',start).lt('created_at',end).order('created_at',{ascending:false}).order('id').range(offset,offset+499);if(error)throw error;all.push(...data);if(data.length<500)break;offset+=500;}
      if(active)setRows(all);
    }catch(e){if(active)setError(e.message);}} load();return()=>{active=false;};
  },[days]);
  function download(){const url=URL.createObjectURL(new Blob([enquiriesCsv(rows)],{type:'text/csv;charset=utf-8'}));const anchor=document.createElement('a');anchor.href=url;anchor.download=`portfolio-enquiries-${days}days-${new Date().toISOString().slice(0,10)}.csv`;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  return <section className="space-y-6"><header><p className="text-[#90baff] text-xs ">Reporting</p><h1 className="text-3xl font-medium mt-2">Enquiry analysis</h1><p className="text-[#b1b1b8] mt-2">Actual contact submissions, independent of email notification delivery.</p></header>
    <div className="flex gap-4 flex-wrap items-center"><label>Period <select className="bg-[#242427] border border-slate-600 p-2 rounded ml-2" value={days} onChange={e=>{setDays(Number(e.target.value));try{localStorage.setItem('report-period',e.target.value);}catch{/* Browser storage may be unavailable. */}}}>{[7,30,90,365].map(n=><option key={n} value={n}>Last {n} days</option>)}</select></label><button disabled={!rows} onClick={download} className="px-4 py-2 bg-indigo-600 rounded disabled:opacity-40">Export filtered CSV</button></div>
    <div className="admin-metric p-5 rounded-xl space-y-4"><h2 className="font-medium">Saved report views</h2><div className="flex gap-3 flex-wrap"><input aria-label="Report view name" maxLength={80} value={presetName} onChange={e=>setPresetName(e.target.value)} placeholder="Name this view" className="bg-[#242427] p-2 rounded border border-slate-600"/><button disabled={!presetName.trim()} onClick={savePreset} className="text-[#90baff]">Save current period</button></div>{presetError&&<p role="status" className="text-sm text-[#b1b1b8]">{presetError}</p>}<div className="flex gap-3 flex-wrap">{presets.map(p=><span key={p.id} className="border border-slate-600 rounded px-3 py-2 text-sm"><button onClick={()=>setDays(p.days)}>{p.name} · {p.days} days</button><button className="ml-4" aria-label={'Remove saved view '+p.name} onClick={()=>removePreset(p.id)}>×</button></span>)}</div></div>
    {error && <p role="alert" className="text-red-300">{error}</p>}{!rows&&!error&&<p role="status">Loading report…</p>}
    {rows&&<><div className="grid sm:grid-cols-3 gap-4">{[['Enquiries',rows.length],['Unread',rows.filter(r=>!r.is_read).length],['Read',rows.filter(r=>r.is_read).length]].map(([label,value])=><article key={label} className="admin-metric border border-white/10 rounded-xl p-6"><p className="text-[#b1b1b8]">{label}</p><p className="text-4xl mt-3 tabular-nums">{value}</p></article>)}</div><p className="text-sm text-[#b1b1b8]">Rolling {days}-day window · dates displayed in Asia/Kolkata · export timestamps in UTC. Read status is current, not evidence of a reply.</p><div className="overflow-x-auto border border-white/10 rounded-xl"><table className="w-full text-sm text-left"><caption className="sr-only">Enquiries in the selected period</caption><thead className="bg-[#242427]"><tr>{['Received','Sender','Status'].map(h=><th key={h} className="p-4">{h}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.id} className="border-t border-white/10"><td className="p-4 whitespace-nowrap">{new Date(row.created_at).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})}</td><td className="p-4">{row.name}</td><td className="p-4">{row.is_read?'Read':'Unread'}</td></tr>)}</tbody></table>{!rows.length&&<p className="p-8 text-[#b1b1b8]">No enquiries in this period.</p>}</div></>}
  </section>;
}
