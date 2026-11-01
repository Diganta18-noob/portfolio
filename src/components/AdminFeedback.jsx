import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

export default function AdminFeedback() {
  const dialog=useRef(null), pending=useRef(null), timer=useRef(null), returnFocus=useRef(null);
  const [request,setRequest]=useState(null), [notice,setNotice]=useState(null);
  function finish(value) {const item=pending.current;pending.current=null;dialog.current?.close();setRequest(null);item?.resolve(value);returnFocus.current?.focus();}
  useEffect(()=>{
    function confirm(event){if(pending.current){event.detail.resolve(false);return;}returnFocus.current=document.activeElement;pending.current=event.detail;setRequest(event.detail);}
    function toast(event){clearTimeout(timer.current);setNotice(event.detail);timer.current=setTimeout(()=>setNotice(null),6000);}
    window.addEventListener('workspace-confirm',confirm);window.addEventListener('workspace-notice',toast);
    return()=>{window.removeEventListener('workspace-confirm',confirm);window.removeEventListener('workspace-notice',toast);clearTimeout(timer.current);pending.current?.resolve(false);};
  },[]);
  useEffect(()=>{if(request)dialog.current?.showModal();},[request]);
  return createPortal(<>
    <dialog ref={dialog} className="workspace-confirm" aria-labelledby="confirm-title" aria-describedby="confirm-description" onCancel={event=>{event.preventDefault();finish(false);}}>
      <div className="workspace-confirm-icon" aria-hidden="true">!</div><h2 id="confirm-title">Confirm deletion</h2><p id="confirm-description">{request?.message} This action cannot be undone.</p><div className="workspace-confirm-actions"><button autoFocus onClick={()=>finish(false)}>Cancel</button><button className="danger" onClick={()=>finish(true)}>Delete</button></div>
    </dialog>
    <div className="workspace-notification-region" aria-live="polite" aria-atomic="true">{notice&&<div className={`workspace-notice ${notice.tone}`}><div><strong>{notice.tone==='error'?'Something went wrong':'Update complete'}</strong><p>{notice.message}</p></div><button aria-label="Dismiss notification" onClick={()=>setNotice(null)}>×</button></div>}</div>
  </>,document.body);
}
