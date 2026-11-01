export function summarizeEvents(rows, start, end) {
 const filtered=rows.filter(r=>{const t=Date.parse(r.received_at);return t>=start&&t<end;});
 const sessions=new Map(),daily={},paths={};
 for(const r of filtered){if(!sessions.has(r.session_id))sessions.set(r.session_id,[]);sessions.get(r.session_id).push(r);const day=new Date(r.received_at).toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});daily[day]=(daily[day]||0)+1;if(r.event_name==='page_view')paths[r.path]=(paths[r.path]||0)+1;}
 let starts=0,converts=0;
 for(const events of sessions.values()){events.sort((a,b)=>Date.parse(a.received_at)-Date.parse(b.received_at));const firstStart=events.find(r=>r.event_name==='contact_start');if(firstStart){starts++;if(events.some(r=>r.event_name==='contact_submit_success'&&Date.parse(r.received_at)>=Date.parse(firstStart.received_at)))converts++;}}
 return {sessions:sessions.size,events:filtered.length,starts,converts,conversion:starts?100*converts/starts:null,daily,paths};
}
export function periodDelta(current,previous){return previous===0?(current===0?'—':'New'):((current-previous)/previous*100).toFixed(1)+'%';}
