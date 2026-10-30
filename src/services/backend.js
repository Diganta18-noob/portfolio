// Pure helpers shared by the UI and regression tests. Never accept a privileged key.
export function backendSettings(env) {
  const url = env.VITE_SUPABASE_URL?.trim() || '';
  const key = (env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || '').trim();
  let validURL = false;
  try { const parsed = new URL(url); validURL = ['https:', 'http:'].includes(parsed.protocol); } catch { /* incomplete settings */ }
  let privileged = key.startsWith('sb_secret_');
  if (key.split('.').length === 3) {
    try { privileged ||= JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role === 'service_role'; } catch { /* public legacy JWT checked by Supabase */ }
  }
  return {url, key, configured: Boolean(validURL && key && !privileged), error: privileged ? 'Use a public publishable/anon key, never a service-role or secret key.' : 'Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) to .env.local and restart Vite.'};
}

export async function requireAdmin(client) {
  if (!client) return false;
  const {data, error} = await client.auth.getUser();
  if (error || !data?.user) return false;
  const profile = await client.from('profiles').select('role').eq('id', data.user.id).single();
  return !profile.error && profile.data?.role === 'admin';
}

export async function checked(request) {
  const {data, error} = await request;
  if (error) throw error;
  return data;
}

export async function submitMessage(client, form) {
  const name = form.name.trim();
  const email = form.email.trim();
  const message = form.message.trim();
  if (!name || name.length > 100) throw new Error('Enter your name (up to 100 characters).');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new Error('Enter a valid email address.');
  if (!message || message.length > 5000) throw new Error('Enter a message between 1 and 5000 characters.');
  if (!client) throw new Error('Messaging is not configured. Please use the email link.');
  await checked(client.rpc('submit_contact_message', {sender_name:name, sender_email:email, message_body:message}));
}

export async function fetchPublicProjects(client) {
  return await checked(client.from('projects').select('*').eq('is_published',true).order('order_index',{ascending:true})) || [];
}

export function validateImage(file) {
  if (!['image/png','image/jpeg','image/webp'].includes(file.type)) throw new Error('Choose a PNG, JPEG, or WebP image.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Image must be smaller than 5 MB.');
}

export async function uploadPortfolioImage(client, bucket, file) {
  validateImage(file);
  if (!client) throw new Error('Storage is not configured.');
  const extension = {'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[file.type];
  const path = `${crypto.randomUUID()}.${extension}`;
  const storage = client.storage.from(bucket);
  await checked(storage.upload(path,file,{contentType:file.type,upsert:false}));
  return storage.getPublicUrl(path).data.publicUrl;
}
