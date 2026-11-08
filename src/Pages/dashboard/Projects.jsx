import DataTable from '../../components/DataTable';
import {validateProject,filterProjects} from '../../utils/projectUx';
import {confirmAction, notify} from '../../services/feedback';
import { useEffect, useId, useRef, useState } from "react";
import { checked, uploadPortfolioImage, validateImage } from "../../services/backend";
import { supabase } from "../../supabase";
import {
  Plus,
  Trash2,
  Upload,
  FolderGit2,
  X,
  ImageIcon,
  ExternalLink,
  Github,
  Pencil,
} from "lucide-react";

const Card = ({ children, className = "" }) => (
  <div className={`relative group ${className}`}>

    <div className="relative bg-[#1b1b1e]  border border-white/10 rounded-xl h-full">
      {children}
    </div>
  </div>
);

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) => {
  const id = useId();
  return (
  <div className="space-y-2">
    <label htmlFor={id} className="text-xs text-[#b1b1b8] font-medium">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full bg-[#19191c] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-[#45454b] focus:ring-1 focus:ring-indigo-500/20 transition-colors"
    />
  </div>
);
};

const SkeletonCard = () => (
  <div className="relative">

    <div className="relative bg-[#1b1b1e] border border-white/10 rounded-xl p-4 flex flex-col gap-3">
      <div className="w-full aspect-[16/8] bg-[#1b1b1e]  rounded-xl" />
      <div className="h-4 bg-[#1b1b1e]  rounded-lg w-2/3" />
      <div className="h-3 bg-[#1b1b1e]  rounded-lg w-full" />
      <div className="h-3 bg-[#1b1b1e]  rounded-lg w-4/5" />
      <div className="flex gap-2 mt-1">
        <div className="h-5 w-16 bg-[#1b1b1e]  rounded-full" />
        <div className="h-5 w-12 bg-[#1b1b1e]  rounded-full" />
        <div className="h-5 w-20 bg-[#1b1b1e]  rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-white/8 mt-auto">
        <div className="flex gap-2">
          <div className="w-7 h-7 bg-[#1b1b1e]  rounded-lg" />
          <div className="w-7 h-7 bg-[#1b1b1e]  rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="w-14 h-7 bg-[#1b1b1e]  rounded-lg" />
          <div className="w-16 h-7 bg-[#1b1b1e]  rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

const ProjectCard = ({ project, onDelete, onEdit }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Card>
      <div className="p-4 flex flex-col h-full">
        {project.Img && (
          <div className="w-full aspect-[16/8] rounded-xl mb-4 border border-white/8 overflow-hidden bg-[#1b1b1e]">
            {!imgLoaded && (
              <div className="w-full h-full  bg-[#1b1b1e]" />
            )}
            <img
              src={project.Img}
              alt={project.Title}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0 absolute"}`}
            />
          </div>
        )}
        <h3 className="font-medium text-white text-sm mb-1">
          {project.Title}
        </h3>
        {project.Description && (
          <p className="text-[#b1b1b8] text-xs mb-3 line-clamp-2 leading-relaxed">
            {project.Description}
          </p>
        )}
        {project.TechStack?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {project.TechStack.map((t) => (
              <span
                key={t}
                className="admin-meta px-2 py-1 rounded bg-[#242427] text-[#b1b1b8]"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-white/8">
          <div className="flex gap-2">
            {project.Link && (
              <a
                aria-label={`Open ${project.Title}`}
                href={project.Link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg border border-white/10 text-[#92929b] hover:text-white hover:border-white/20 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {project.Github && (
              <a
                aria-label={`View source for ${project.Title}`}
                href={project.Github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg border border-white/10 text-[#92929b] hover:text-white hover:border-white/20 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(project)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#45454b] text-[#90baff] hover:bg-[#242427] text-xs transition-colors"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const Modal = ({ title, onClose, children }) => {
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog ref={dialog} className="admin-ui admin-project-dialog" aria-labelledby={titleId}
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="admin-panel overflow-hidden flex flex-col max-h-full">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <h2 id={titleId} className="text-base font-medium">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close project editor" className="p-2 text-[#b1b1b8] hover:text-white"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </dialog>
  );
};

const ProjectForm = ({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save project",
  uploading,
}) => {
  const [form, setForm] = useState({
    Title: initial?.Title || "",
    Description: initial?.Description || "",
    TechStack: Array.isArray(initial?.TechStack)
      ? initial.TechStack.join(", ")
      : initial?.TechStack || "",
    Features: Array.isArray(initial?.Features)
      ? initial.Features.join(", ")
      : initial?.Features || "",
    Link: initial?.Link || "",
    Github: initial?.Github || "",
    is_published: initial?.is_published ?? true,
  });
  const [dirty,setDirty]=useState(false),[draftMessage,setDraftMessage]=useState(''),[savedDraft,setSavedDraft]=useState(null);
  const draftKey='portfolio-project-draft-'+(initial?.id||'new');
  useEffect(()=>{try{const raw=localStorage.getItem(draftKey);if(raw)setSavedDraft(JSON.parse(raw));}catch{/* Storage unavailable. */}},[draftKey]);
  useEffect(()=>{if(!dirty)return;setDraftMessage('Saving local draft…');const timer=setTimeout(()=>{try{localStorage.setItem(draftKey,JSON.stringify(form));setDraftMessage('Draft saved on this browser. Images must be selected again.');}catch{setDraftMessage('Local draft unavailable. Keep this editor open until saved.');}},600);return()=>clearTimeout(timer);},[form,dirty,draftKey]);
  const fieldErrors=validateProject(form);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initial?.Img || null);

  useEffect(() => () => { if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);

  const set = (key) => (e) => {setDirty(true);setForm((f) => ({ ...f, [key]: e.target.value }));};

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try { validateImage(f); } catch (error) { notify(error.message,'error'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if(Object.keys(fieldErrors).length){notify(Object.values(fieldErrors)[0],'error');return;}
        onSubmit(form, file);
      }}
      className="p-5 sm:p-6 space-y-4"
    >
      {savedDraft&&<div className="border border-[#45454b] rounded-lg p-3 text-sm">A saved draft is available. <button type="button" className="text-[#90baff] underline" onClick={()=>{setForm(f=>Object.fromEntries(Object.keys(f).map(key=>[key,typeof savedDraft[key]===typeof f[key]?savedDraft[key]:f[key]])));setDirty(true);setSavedDraft(null);}}>Restore draft</button> <button type="button" className="text-[#b1b1b8] underline ml-3" onClick={()=>{try{localStorage.removeItem(draftKey);}catch{/* Storage unavailable. */}setSavedDraft(null);}}>Discard draft</button></div>}
      <p role="status" className="text-xs text-[#b1b1b8]">{draftMessage||'Publishing happens only when you submit this form.'}</p>
      {dirty&&Object.values(fieldErrors).map(message=><p key={message} className="text-sm text-amber-300">{message}</p>)}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <InputField
            label="Project title"
            value={form.Title}
            onChange={set("Title")}
            placeholder="e.g. My Portfolio Website"
            required
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <label htmlFor="project-description" className="text-xs text-[#b1b1b8] font-medium">
            Description
          </label>
          <textarea
            id="project-description"
            value={form.Description}
            onChange={set("Description")}
            placeholder="Describe what this project does, its purpose, and impact..."
            rows={3}
            className="w-full bg-[#19191c] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-[#45454b] focus:ring-1 focus:ring-indigo-500/20 transition-colors resize-none"
          />
        </div>

        <InputField
          label="Tech stack (comma separated)"
          value={form.TechStack}
          onChange={set("TechStack")}
          placeholder="e.g. React, Tailwind, Supabase"
        />
        <InputField
          label="Key features (comma separated)"
          value={form.Features}
          onChange={set("Features")}
          placeholder="e.g. Auth, Dark mode, REST API"
        />
        <InputField
          type="url"
          label="Live URL"
          value={form.Link}
          onChange={set("Link")}
          placeholder="https://yourproject.com"
        />
        <InputField
          type="url"
          label="GitHub URL"
          value={form.Github}
          onChange={set("Github")}
          placeholder="https://github.com/username/repo"
        />

        <div className="sm:col-span-2 space-y-2">
          <label className="text-xs text-[#b1b1b8] font-medium">
            Project image
          </label>
          <label className="flex items-center gap-4 w-full bg-[#19191c] border border-dashed border-white/15 rounded-xl px-4 py-4 cursor-pointer hover:border-[#45454b] hover:bg-[#1b1b1e] transition-colors">
            {preview ? (
              <img
                src={preview}
                className="h-16 w-24 object-cover rounded-lg border border-white/10"
                alt="preview"
              />
            ) : (
              <div className="w-24 h-16 rounded-lg bg-[#1b1b1e] flex items-center justify-center border border-white/10">
                <ImageIcon className="w-5 h-5 text-[#92929b]" />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-300">
                {preview ? "Change image" : "Click to upload image"}
              </p>
              <p className="text-xs text-[#92929b] mt-0.5">
                PNG, JPG, WEBP supported
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <label className="flex items-center gap-2 text-gray-300 text-sm"><input type="checkbox" checked={form.is_published} onChange={e => {setDirty(true);setForm(f => ({...f,is_published:e.target.checked}));}} /> Published on portfolio</label>
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-white/10 text-[#b1b1b8] hover:text-white text-sm transition-colors"
        >
          Cancel
        </button>
        <button type="submit" disabled={uploading} className="admin-primary">

          <div className="flex items-center gap-2">
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4 text-[#90baff]" />
            )}
            <span className="text-sm text-gray-200">
              {uploading ? "Saving..." : submitLabel}
            </span>
          </div>
        </button>
      </div>
    </form>
  );
};

export default function Projects() {
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [search,setSearch]=useState(''),[visibility,setVisibility]=useState('all'),[view,setView]=useState('cards'),[selected,setSelected]=useState([]),[bulkBusy,setBulkBusy]=useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true); setError('');
    try { setProjects(await checked(supabase.from('projects').select('*').order('created_at',{ascending:false})) || []); }
    catch(error) { setError(error.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchProjects(); }, []);
  const saveProject = async (form,file,existing) => {
    if (uploading) return;
    setUploading(true); setError('');
    try {
      const errors=validateProject(form);if(Object.keys(errors).length)throw new Error(Object.values(errors)[0]);
      const Img = file ? await uploadPortfolioImage(supabase,'project-images',file) : existing?.Img || '';
      const payload = {...form,Title:form.Title.trim(),Img,TechStack:form.TechStack.split(',').map(s=>s.trim()).filter(Boolean),Features:form.Features.split(',').map(s=>s.trim()).filter(Boolean)};
      const query = existing ? supabase.from('projects').update(payload).eq('id',existing.id) : supabase.from('projects').insert(payload);
      await checked(query.select('id').single());
      try{localStorage.removeItem('portfolio-project-draft-'+(existing?.id||'new'));}catch{/* Local draft cleanup is best effort. */}
      setShowCreate(false); setEditProject(null); await fetchProjects();
    } catch(error) { setError(error.message || 'Unable to save project.'); }
    finally { setUploading(false); }
  };
  const handleCreate = (form,file) => saveProject(form,file,null);
  const handleEdit = (form,file) => saveProject(form,file,editProject);
  const deleteProject = async (id) => {
    if (!await confirmAction('Delete this project?')) return;
    try { await checked(supabase.from('projects').delete().eq('id',id).select('id').single()); await fetchProjects(); }
    catch(error) { setError(error.message); }
  };

  const filtered=filterProjects(projects,search,visibility);
  async function bulkPublish(published){if(bulkBusy)return;setBulkBusy(true);setError('');try{const {data,error}=await supabase.from('projects').update({is_published:published}).in('id',selected).select('id');if(error)throw error;if(data.length!==selected.length)throw Error('Some selected projects could not be updated. Refresh and retry.');setSelected([]);notify('Selected projects updated.');await fetchProjects();}catch(e){setError(e.message);}finally{setBulkBusy(false);}}


  return (
    <div className="space-y-6">
      {error && <p role="alert" className="relative z-[60] rounded-xl bg-red-950 p-4 text-red-200">{error}</p>}
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">

            <div className="admin-page-icon">
              <FolderGit2 className="w-4 h-4 text-[#90baff]" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-medium text-white">
              Projects
            </h1>
            <p className="text-[#92929b] text-xs">
              {loading ? "Loading..." : `${projects.length} projects total`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="admin-primary shrink-0"
        >

          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#90baff]" />
            <span className="text-sm text-gray-200">New project</span>
          </div>
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Add project" onClose={() => setShowCreate(false)}>
          <ProjectForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            submitLabel="Save project"
            uploading={uploading}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editProject && (
        <Modal title="Edit project" onClose={() => setEditProject(null)}>
          <ProjectForm
            initial={editProject}
            onSubmit={handleEdit}
            onCancel={() => setEditProject(null)}
            submitLabel="Update project"
            uploading={uploading}
          />
        </Modal>
      )}

      <div className="flex flex-wrap gap-3 items-end"><label className="flex-1 text-sm">Search projects<input value={search} onChange={e=>{setSearch(e.target.value);setSelected([]);}} className="block w-full bg-[#1b1b1e] border border-white/15 rounded-lg p-3 mt-2" placeholder="Title or technology"/></label><label className="text-sm">Visibility<select value={visibility} onChange={e=>{setVisibility(e.target.value);setSelected([]);}} className="block bg-[#19191c] border border-white/15 rounded-lg p-3 mt-2"><option value="all">All</option><option value="published">Published</option><option value="draft">Drafts</option></select></label><button className="text-[#90baff] border border-white/15 rounded-lg p-3" onClick={()=>setView(v=>v==='cards'?'table':'cards')}>{view==='cards'?'Table view':'Card view'}</button></div>
      {selected.length>0&&<div className="flex flex-wrap gap-4 text-sm"><span>{selected.length} selected</span><button disabled={bulkBusy} onClick={()=>bulkPublish(true)}>Publish selected</button><button disabled={bulkBusy} onClick={()=>bulkPublish(false)}>Unpublish selected</button><button disabled={bulkBusy} onClick={()=>setSelected([])}>Clear</button></div>}
      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="p-16 text-center">
            <FolderGit2 className="w-10 h-10 text-[#92929b] mx-auto mb-3" />
            <p className="text-[#92929b] text-sm">
              No matching projects. Clear your filters or add a project.
            </p>
          </div>
        </Card>
      ) : view==='table' ? <DataTable rows={filtered} selected={selected} onSelection={setSelected} columns={[{key:'Title',label:'Project',sortable:true},{key:'is_published',label:'Visibility',render:p=>p.is_published?'Published':'Draft'},{key:'actions',label:'Actions',render:p=><button className="text-[#90baff]" onClick={()=>setEditProject(p)}>Edit</button>}]}/> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={deleteProject}
              onEdit={setEditProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
