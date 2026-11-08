import {useDebouncedValue} from '../../utils/useDebouncedValue';
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
  const settledSearch=useDebouncedValue(search);
  const version=useRef(0);
  const refresh=useCallback(async()=>{
    const request=++version.current;
    setLoading(true);setError('');
    try{
      let query=supabase.from('contact_messages').select('*',{count:'exact'}).order('created_at',{ascending:false});
      if(unreadOnly) query=query.eq('is_read',false);
      if(settledSearch.trim())query=query.ilike('name','%'+settledSearch.trim().replaceAll('%','').replaceAll('_','')+'%');
      const {data,error,count}=await query.range(page*PAGE_SIZE,(page+1)*PAGE_SIZE-1);
      if(request!==version.current)return;
      if(error)throw error;
      if(!data.length && page>0){setPage(p=>p-1);return;}
      setMessages(data);setCount(count||0);
    }catch(error){if(request===version.current)setError(error.message||'Unable to load messages.');}
    finally{if(request===version.current)setLoading(false);}
  },[page,unreadOnly,settledSearch]);
  useEffect(()=>{setPage(0);},[settledSearch]);
  useEffect(()=>{refresh();return()=>{version.current++;};},[refresh]);
  const mutate=async(message,remove=false)=>{
    if(pending)return;
    if(remove && !await confirmAction('Permanently delete this message?'))return;
    setPending(message.id);setError('');
    if(!remove)setMessages(rows=>rows.map(row=>row.id===message.id?{...row,is_read:!message.is_read}:row));
    try{
      const query=remove?supabase.from('contact_messages').delete():supabase.from('contact_messages').update({is_read:!message.is_read});
      await checked(query.eq('id',message.id).select('id').single());
      await refresh();
    }catch(error){if(!remove)setMessages(rows=>rows.map(row=>row.id===message.id?message:row));setError(error.message);notify('Update failed. The previous state was restored.','error');}
    finally{setPending(null);}
  };
  return <section className="space-y-6">
    <div className="flex items-center gap-3"><Mail className="text-[#90baff]"/><div><h1 className="text-2xl font-medium">Private messages</h1><p className="text-[#b1b1b8] text-sm">Contact enquiries are visible only to admins. Replies open in your email app.</p></div></div>
    <label className="block text-sm">Search sender<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Sender name" className="block w-full bg-[#1b1b1e] border border-white/15 rounded-lg px-4 py-3 mt-2"/></label><div className="flex flex-wrap items-center gap-4"><label className="flex gap-2 text-sm"><input type="checkbox" checked={unreadOnly} onChange={e=>{setUnreadOnly(e.target.checked);setPage(0);}}/>Unread only</label><button onClick={refresh} disabled={loading} className="flex gap-2 text-[#90baff] disabled:opacity-50"><RefreshCw size={16}/>Refresh</button><span className="text-[#b1b1b8] text-sm">{count} messages</span></div>
    {error && <p role="alert" className="text-red-300 rounded-xl border border-red-500/20 p-4">{error} <button onClick={refresh} className="underline ml-3">Try again</button></p>}
    {loading?<div role="status" aria-label="Loading messages" className="space-y-4">{[0,1,2].map(i=><div key={i} className="rounded-xl border border-white/10 p-6 space-y-4  "><div className="h-4 w-1/3 bg-white/10 rounded"/><div className="h-3 w-2/3 bg-white/10 rounded"/><div className="h-12 bg-[#1b1b1e] rounded"/></div>)}</div>:messages.length===0?<p className="text-[#b1b1b8]">No {unreadOnly?'unread ':''}messages yet.</p>:messages.map(message=><article key={message.id} className="rounded-xl bg-[#1b1b1e] border border-white/10 p-6 space-y-4">
      <div className="flex justify-between gap-4 flex-wrap"><div><h2 className="text-lg font-medium break-all">{message.name} {!message.is_read && <span className="text-xs text-[#90baff] ml-2">New</span>}</h2><p className="text-[#b1b1b8] break-all">{message.email}</p></div><time className="text-sm text-[#b1b1b8]">{new Date(message.created_at).toLocaleString()}</time></div>
      <p className="whitespace-pre-wrap break-words text-gray-200">{message.message}</p>
      <div className="flex gap-5 text-sm flex-wrap"><a className="text-[#90baff] underline" href={`mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent('Re: Portfolio enquiry')}`}>Reply by email</a><button disabled={pending!==null} className="text-[#90baff] disabled:opacity-50" onClick={()=>mutate(message)}>{message.is_read?'Mark unread':'Mark read'}</button><button disabled={pending!==null} className="text-red-300 disabled:opacity-50" onClick={()=>mutate(message,true)}>Delete</button></div>
    </article>)}
    <div className="flex items-center gap-4"><button disabled={page===0||loading} onClick={()=>setPage(p=>p-1)} className="disabled:opacity-30">Previous</button><span className="text-sm text-[#b1b1b8]">Page {page+1}</span><button disabled={(page+1)*PAGE_SIZE>=count||loading} onClick={()=>setPage(p=>p+1)} className="disabled:opacity-30">Next</button></div>
  </section>;
}
