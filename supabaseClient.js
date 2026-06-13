import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = window.SUPABASE_URL || (typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : 'https://your-project-ref.supabase.co');
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || (typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : 'your-anon-key');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function insertPrescription(prescription) {
  const { data, error } = await supabase.from('prescriptions').insert([prescription]);
  if (error) throw error;
  return data;
}

export async function fetchPrescriptions() {
  const { data, error } = await supabase.from('prescriptions').select('*').order('createdAt', { ascending: false });
  if (error) throw error;
  return data;
}
