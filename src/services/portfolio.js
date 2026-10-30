import { supabase, isBackendConfigured } from '../supabase';
import { portfolioConfig } from '../portfolioConfig';
import { checked, fetchPublicProjects } from './backend';

export async function loadPublicPortfolio() {
  if (!isBackendConfigured) return { projects: portfolioConfig.staticProjects, certificates: portfolioConfig.staticCertificates };
  const [projects, certificates] = await Promise.all([
    fetchPublicProjects(supabase),
    checked(supabase.from('certificates').select('*').order('created_at', {ascending:false})),
  ]);
  return {projects, certificates:certificates || []};
}
