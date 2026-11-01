export function summarizeEvents(rows, start, end) {
 const filtered=rows.filter(r=>{const t=Date.parse(r.received_at);return t>=start&&t<end;});
 const sessions=new Map(),daily={},paths={};
 for(const r of filtered){if(!sessions.has(r.session_id))sessions.set(r.session_id,[]);sessions.get(r.session_id).push(r);const day=new Date(r.received_at).toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});daily[day]=(daily[day]||0)+1;if(r.event_name==='page_view')paths[r.path]=(paths[r.path]||0)+1;}
 let starts=0,converts=0;
 for(const events of sessions.values()){events.sort((a,b)=>Date.parse(a.received_at)-Date.parse(b.received_at));const firstStart=events.find(r=>r.event_name==='contact_start');if(firstStart){starts++;if(events.some(r=>r.event_name==='contact_submit_success'&&Date.parse(r.received_at)>=Date.parse(firstStart.received_at)))converts++;}}
 return {sessions:sessions.size,events:filtered.length,starts,converts,conversion:starts?100*converts/starts:null,daily,paths};
}
export function periodDelta(current,previous){return previous===0?(current===0?'—':'New'):((current-previous)/previous*100).toFixed(1)+'%';}

export function projectPerformance(rows,start,end){
 const projects=new Map(),sessions=new Map();
 function item(key){if(!projects.has(key))projects.set(key,{key,views:0,demo:0,source:0,leads:0,viewers:new Set(),clickers:new Set()});return projects.get(key);}
 for(const r of rows){const t=Date.parse(r.received_at);if(t<start||t>=end)continue;if(!sessions.has(r.session_id))sessions.set(r.session_id,[]);sessions.get(r.session_id).push(r);
 if(!r.project_key)continue;const p=item(r.project_key);if(r.event_name==='project_view'){p.views++;p.viewers.add(r.session_id);}if(r.event_name==='project_demo_click'){p.demo++;p.clickers.add(r.session_id);}if(r.event_name==='project_source_click'){p.source++;p.clickers.add(r.session_id);}}
 for(const events of sessions.values()){events.sort((a,b)=>Date.parse(a.received_at)-Date.parse(b.received_at));let last=null;const attributed=new Set();for(const e of events){if(e.event_name==='project_view'&&e.project_key)last=e.project_key;if(e.event_name==='contact_submit_success'&&last&&!attributed.has(last)){item(last).leads++;attributed.add(last);}}}
 return [...projects.values()].map(p=>({key:p.key,views:p.views,demo:p.demo,source:p.source,leads:p.leads,clickRate:p.viewers.size?100*[...p.clickers].filter(id=>p.viewers.has(id)).length/p.viewers.size:null})).sort((a,b)=>b.views-a.views||b.demo+b.source-a.demo-a.source);
}
