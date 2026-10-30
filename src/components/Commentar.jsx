import {useCallback, useEffect, useState} from 'react';
import {MessageCircle, Pin, Send} from 'lucide-react';
import {supabase,isBackendConfigured} from '../supabase';
import {checked} from '../services/backend';

export default function Komentar() {
  const [comments,setComments] = useState([]);
  const [name,setName] = useState('');
  const [content,setContent] = useState('');
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [status,setStatus] = useState('');
  const refresh = useCallback(async () => {
    if (!isBackendConfigured) return;
    try {
      setComments(await checked(supabase.from('portfolio_comments').select('*').order('is_pinned',{ascending:false}).order('created_at',{ascending:false}).limit(50)) || []);
    } catch { setError('Unable to load comments. Please try again.'); }
  },[]);
  useEffect(() => {
    refresh();
    if (!isBackendConfigured) return;
    const channel = supabase.channel('public-guestbook').on('postgres_changes',{event:'*',schema:'public',table:'portfolio_comments'},refresh).subscribe();
    return () => { supabase.removeChannel(channel); };
  },[refresh]);
  const post = async e => {
    e.preventDefault();
    if (busy || !isBackendConfigured) return;
    setBusy(true); setError(''); setStatus('');
    try {
      if (!name.trim() || !content.trim()) throw new Error('Enter your name and comment.');
      await checked(supabase.from('portfolio_comments').insert({user_name:name.trim(),content:content.trim(),profile_image:null,is_pinned:false}));
      setName(''); setContent(''); e.target.reset();
      setStatus('Your public comment was posted.'); await refresh();
    } catch(error) { setError(error.message || 'Unable to post. Your text has been kept.'); }
    finally { setBusy(false); }
  };
  return <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 text-gray-200">
    <h2 className="text-2xl font-semibold flex gap-3 items-center"><MessageCircle className="text-indigo-400" />Public Guestbook</h2>
    <p className="text-gray-400 mt-3">Comments here are public. Use the contact form above for private enquiries.</p>
    {!isBackendConfigured ? <p className="text-gray-400 mt-4">The guestbook will be available when the portfolio backend is connected.</p> : <>
      <form onSubmit={post} className="space-y-4 mt-6">
        <label className="block">Name<input aria-label="Guestbook name" required maxLength={80} value={name} onChange={e=>setName(e.target.value)} className="block w-full mt-2 rounded-xl border border-white/10 bg-black/20 p-3" /></label>
        <label className="block">Comment<textarea aria-label="Public comment" required maxLength={2000} value={content} onChange={e=>setContent(e.target.value)} className="block w-full mt-2 rounded-xl border border-white/10 bg-black/20 p-3" /></label>
        <button disabled={busy} className="flex items-center gap-2 bg-indigo-600 rounded-xl px-5 py-3 disabled:opacity-50"><Send size={16} />{busy?'Posting...':'Post Comment'}</button>
      </form>
      {error && <p role="alert" className="text-red-300 mt-4">{error} <button onClick={refresh} className="underline">Refresh comments</button></p>}
      {status && <p role="status" className="text-green-300 mt-4">{status}</p>}
      <div className="space-y-4 mt-8 max-h-[480px] overflow-y-auto">
        {comments.length===0 && <p className="text-gray-400">No comments yet.</p>}
        {comments.map(comment=><article key={comment.id} className="border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">{comment.profile_image && <img src={comment.profile_image} alt="" className="w-10 h-10 rounded-full object-cover" loading="lazy" />}<h3 className="font-semibold break-all">{comment.user_name}</h3>{comment.is_pinned && <span className="text-xs text-indigo-300 flex gap-1"><Pin size={14} />Featured</span>}</div>
          <p className="mt-3 text-gray-300 whitespace-pre-wrap break-words">{comment.content}</p><time className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</time>
        </article>)}
      </div>
    </>}
  </div>;
}
