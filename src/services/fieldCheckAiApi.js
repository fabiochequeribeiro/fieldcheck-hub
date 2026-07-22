import { supabase } from '../supabase';

export async function askFieldCheckAi({ question, context = {}, source = 'portal' }) {
  const { data } = await supabase.auth.getSession();
  const response = await fetch('/api/fieldcheck-ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
    },
    body: JSON.stringify({ question, context, source }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Nao foi possivel consultar o FieldCheck AI.');
  return payload;
}

export async function createFieldCheckIncident(payload) {
  const { data, error } = await supabase.from('fieldcheck_incidentes').insert(payload).select('id,codigo,status,prioridade').single();
  if (error) throw error;
  return data;
}

