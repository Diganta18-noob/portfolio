import {Link} from 'react-router-dom';
import {ArrowUpRight,ArrowRight} from 'lucide-react';
import {toSlug} from '../utils/slug';
import {track} from '../services/analytics';
export default function CardProject({Img,Title,Description,Link:demo,id}){let live=false;try{live=['http:','https:'].includes(new URL(demo).protocol);}catch{}return <article className="work-card"><img src={Img||'/project-thoughts-whatever.svg'} alt={Title} loading="lazy"/><div className="p-6"><h3>{Title}</h3><p>{Description}</p><div className="flex justify-between items-center mt-6">{live?<a href={demo} target="_blank" rel="noreferrer" onClick={()=>track('project_demo_click',String(id))}>Live website <ArrowUpRight size={16}/></a>:<span className="text-xs text-gray-500">Source project</span>}{id&&<Link to={`/project/${toSlug(Title)}`}>Case study <ArrowRight size={16}/></Link>}</div></div></article>}
