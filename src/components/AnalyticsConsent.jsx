import {useEffect,useState} from 'react';
import {useLocation} from 'react-router-dom';
import {track} from '../services/analytics';
export default function AnalyticsConsent(){const location=useLocation();const [choice,setChoice]=useState(()=>{try{return sessionStorage.getItem('analytics-consent');}catch{return 'no';}});
 useEffect(()=>{if(choice==='yes')track('page_view');},[choice,location.pathname]);
 useEffect(()=>{function click(e){const a=e.target.closest('a');if(!a||a.hasAttribute('data-project-link'))return;const href=a.getAttribute('href')||'';if(href.includes('/resume/'))track('resume_click');else if(href.includes('linkedin.com')||href.includes('github.com'))track('social_click');}document.addEventListener('click',click);return()=>document.removeEventListener('click',click);},[]);
 if(/^\/(dashboard|admin|login)/.test(location.pathname))return null;
 function choose(value){try{sessionStorage.setItem('analytics-consent',value);if(value==='no'){sessionStorage.removeItem('analytics-session');sessionStorage.removeItem('analytics-last');}}catch{/* Browser storage may be unavailable. */}setChoice(value);}
 return <div className="analytics-consent">{!choice?<><p>Allow anonymous engagement measurement for this tab? We collect page and link events, never your contact message.</p><button onClick={()=>choose('yes')}>Allow analytics</button><button onClick={()=>choose('no')}>Decline</button></>:<button onClick={()=>choose(choice==='yes'?'no':'yes')}>{choice==='yes'?'Disable analytics':'Enable analytics'}</button>}</div>;
}
