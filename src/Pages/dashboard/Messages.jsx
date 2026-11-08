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
  return <section className="report-stack">
    <header className="workspace-heading"><div><p className="workspace-eyebrow">Conversations</p><h1>Enquiry inbox</h1><p className="workspace-description">Private contact submissions and follow-up actions</p></div><span className="workspace-edition"><Mail size={16}/>Private to administrators</span></header>
    <div className="inbox-toolbar">
      <label className="inbox-search">Search sender<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name" /></label>
      <label className="inbox-unread"><input type="checkbox" checked={unreadOnly} onChange={e=>{setUnreadOnly(e.target.checked);setPage(0);}}/>Unread only</label>
      <button onClick={refresh} disabled={loading} className="report-button"><RefreshCw size={15}/>Refresh</button>
      <span className="panel-meta">{loading?'Loading…':`${count} messages`}</span>
    </div>
    {error && <div role="alert" className="report-error">{error}<button onClick={refresh} className="report-button ml-3">Try again</button></div>}
    <div className="report-panel">
      {loading?<p role="status" className="report-loading">Loading private messages…</p>:messages.length===0?<div className="report-empty compact"><Mail size={24}/><h3>No {unreadOnly?'unread ':''}messages in this view</h3><p>New contact submissions will appear here</p></div>:messages.map(message=><article key={message.id} className="inbox-message">
        <div className="inbox-message-header"><div className="inbox-sender"><span className="sender-avatar" aria-hidden="true">{(message.name||'?').slice(0,1).toUpperCase()}</span><div><h2>{message.name}</h2><p>{message.email}</p></div></div><div className="inbox-message-meta"><span className={`status-badge ${!message.is_read?'positive':''}`}>{message.is_read?'Read':'Unread'}</span><time dateTime={message.created_at}>{new Date(message.created_at).toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Kolkata'})} IST</time></div></div>
        <p className="inbox-message-body">{message.message}</p>
        <div className="inbox-message-actions"><a className="report-text-link" href={`mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent('Re: Portfolio enquiry')}`}>Reply by email</a><button disabled={pending!==null} onClick={()=>mutate(message)}>{message.is_read?'Mark unread':'Mark read'}</button><button className="inbox-delete" disabled={pending!==null} onClick={()=>mutate(message,true)}>Delete</button></div>
      </article>)}
      <div className="inbox-pagination"><span>Page {page+1}<span className="muted"> · up to {PAGE_SIZE} per page</span></span><div><button disabled={page===0||loading} onClick={()=>setPage(p=>p-1)} className="report-button">Previous</button><button disabled={(page+1)*PAGE_SIZE>=count||loading} onClick={()=>setPage(p=>p+1)} className="report-button">Next</button></div></div>
    </div>
    <p className="panel-footnote inbox-note">Read status does not establish a reply. Email replies open in your email application.</p>
  </section>;
}
