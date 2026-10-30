import { createClient } from '@supabase/supabase-js';
import { backendSettings } from './services/backend';

const settings = backendSettings(import.meta.env);
export const isBackendConfigured = settings.configured;
export const backendSetupMessage = settings.error;
// An absent backend remains absent: no dummy writes or false success responses.
export const supabase = isBackendConfigured ? createClient(settings.url, settings.key) : null;
