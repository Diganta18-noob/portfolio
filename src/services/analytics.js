import {supabase} from '../supabase';
export function track(event_name,project_key=null){
  try{
    if(!supabase || sessionStorage.getItem('analytics-consent')!=='yes' || /^\/(dashboard|admin|login)/.test(location.pathname))return;
    const now=Date.now();let id=sessionStorage.getItem('analytics-session');
    if(!id||now-Number(sessionStorage.getItem('analytics-last'))>1800000){id=crypto.randomUUID();sessionStorage.setItem('analytics-session',id);}
    sessionStorage.setItem('analytics-last',String(now));
    void supabase.rpc('record_portfolio_event',{event_id:crypto.randomUUID(),session_id:id,event_name,path:location.pathname,project_key}).then(()=>{}).catch(()=>{});
  }catch{ /* Telemetry never blocks public functionality. */ }
}
