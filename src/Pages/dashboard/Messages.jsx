import {confirmAction, notify} from '../../services/feedback';
import {useCallback,useEffect,useState,useRef} from 'react';
import {Mail,RefreshCw} from 'lucide-react';
import {supabase} from '../../supabase';
import {checked} from '../../services/backend';
const PAGE_SIZE=20;
export default function Messages(){
  const [messages,setMessages]=useState([]);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const [unreadOnly,setUnreadOnly]=useState(false);
  const [page,setPage]=useState(0);
  const [count,setCount]=useState(0);
  const [pending,setPending]=useState(null);
  const [search,setSearch]=useState('');
  const requestVersion=useRef(0);
  const refresh=useCallback(async()=>{
    const version=++requestVersion.current;
    setLoading(true);setError('');
    try{
      let query=supabase.from('contact_messages').select('*',{count:'exact'}).order('created_at',{ascending:false});
      if(unreadOnly) query=query.eq('is_read',false);
      if(search.trim()) query=query.ilike('name','%'+search.trim().replaceAll('%','').replaceAll('_','')+'%');
      const {data,error,count}=await query.range(page*PAGE_SIZE,(page+1)*PAGE_SIZE-1);
      if(version!==requestVersion.current)return;
      if(error)throw error;
      if(!data.length && page>0){setPage(p=>p-1);return;}
      setMessages(data);setCount(count||0);
    }catch(error){if(version===requestVersion.current)setError(error.message||'Unable to load messages.');}
    finally{if(version===requestVersion.current)setLoading(false);}
  },[page,unreadOnly,search]);
  useEffect(()=>{refresh();return()=>{requestVersion.current++;};},[refresh]);
  const mutate=async(message,remove=false)=>{
    if(pending)return;
    if(remove && !await confirmAction('Permanently delete this message?'))return;
    setPending(message.id);setError('');
    try{
      const query=remove?supabase.from('contact_messages').delete():supabase.from('contact_messages').update({is_read:!message.is_read});
      await checked(query.eq('id',message.id).select('id').single());
      notify(remove ? 'Message deleted.' : 'Message status updated.');
      await refresh();
    }catch(error){setError(error.message); notify(error.message, 'error');}
    finally{setPending(null);}
  };
  async function saveDetails(message, patch) {
    if(pending)return;
    setPending(message.id);
    try { await checked(supabase.from('contact_messages').update(patch).eq('id',message.id).select('id').single()); notify('Enquiry updated.'); await refresh(); }
    catch(error){setError(error.message);notify('Could not save workflow details. Check that the analytics-workflows migration is installed.','error');}
    finally {setPending(null);}
  }
  return <section className="space-y-6">
    <div className="flex items-center gap-3"><Mail className="text-indigo-300"/><div><h1 className="text-2xl font-bold">Private Messages</h1><p className="text-gray-400 text-sm">Contact enquiries are visible only to admins. Replies open in your email app.</p></div></div>
    <label className="block">Search sender<input value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}} className="block w-full bg-slate-800 border border-slate-600 p-3 rounded-lg mt-2" placeholder="Sender name"/></label><div className="flex flex-wrap items-center gap-4"><label className="flex gap-2 text-sm"><input type="checkbox" checked={unreadOnly} onChange={e=>{setUnreadOnly(e.target.checked);setPage(0);}}/>Unread only</label><button onClick={refresh} disabled={loading} className="flex gap-2 text-indigo-300 disabled:opacity-50"><RefreshCw size={16}/>Refresh</button><span className="text-gray-400 text-sm">{count} messages</span></div>
    {error && <p role="alert" className="text-red-300 rounded-xl border border-red-500/20 p-4">{error}</p>}
    {loading?<p role="status">Loading messages...</p>:messages.length===0?<p className="text-gray-400">No {unreadOnly?'unread ':''}messages yet.</p>:messages.map(message=><article key={message.id} className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
      <div className="flex justify-between gap-4 flex-wrap"><div><h2 className="text-lg font-semibold break-all">{message.name} {!message.is_read && <span className="text-xs text-indigo-300 ml-2">New</span>}</h2><p className="text-gray-400 break-all">{message.email}</p></div><time className="text-sm text-gray-400">{new Date(message.created_at).toLocaleString()}</time></div>
      <div className="grid sm:grid-cols-2 gap-4"><label className="text-sm text-gray-400">Opportunity status<select disabled={pending!==null} value={message.workflow_status||'new'} onChange={e=>saveDetails(message,{workflow_status:e.target.value})} className="block w-full bg-slate-800 p-2 rounded mt-2">{['new','reviewing','follow-up','closed','archived'].map(status=><option key={status} value={status}>{status}</option>)}</select></label><label className="text-sm text-gray-400">Tags (comma separated)<input disabled={pending!==null} defaultValue={(message.tags||[]).join(', ')} onBlur={e=>{const tags=e.target.value.split(',').map(t=>t.trim()).filter(Boolean).slice(0,20);if(JSON.stringify(tags)!==JSON.stringify(message.tags||[]))saveDetails(message,{tags});}} className="block w-full bg-slate-800 p-2 rounded mt-2"/></label></div><label className="block text-sm text-gray-400">Private notes<textarea disabled={pending!==null} defaultValue={message.admin_notes||''} maxLength={5000} onBlur={e=>{if(e.target.value!==(message.admin_notes||''))saveDetails(message,{admin_notes:e.target.value});}} className="block w-full bg-slate-800 p-3 rounded mt-2" placeholder="Notes save when you leave this field."/></label>
      <p className="whitespace-pre-wrap break-words text-gray-200">{message.message}</p>
      <div className="flex gap-5 text-sm flex-wrap"><a className="text-indigo-300 underline" href={`mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent('Re: Portfolio enquiry')}`}>Reply by email</a><button disabled={pending!==null} className="text-indigo-300 disabled:opacity-50" onClick={()=>mutate(message)}>{message.is_read?'Mark unread':'Mark read'}</button><button disabled={pending!==null} className="text-red-300 disabled:opacity-50" onClick={()=>mutate(message,true)}>Delete</button></div>
    </article>)}
    <div className="flex items-center gap-4"><button disabled={page===0||loading} onClick={()=>setPage(p=>p-1)} className="disabled:opacity-30">Previous</button><span className="text-sm text-gray-400">Page {page+1}</span><button disabled={(page+1)*PAGE_SIZE>=count||loading} onClick={()=>setPage(p=>p+1)} className="disabled:opacity-30">Next</button></div>
  </section>;
}
