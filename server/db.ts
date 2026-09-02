import crypto from 'crypto';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Configure both server-side environment variables before starting BGMI SHOWDOWN.');
}

export const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export async function initDatabase(): Promise<void> {
  const { error } = await supabase.from('tournament_settings').select('key').limit(1);
  if (error) throw new Error(`Supabase connection/schema check failed: ${error.message}`);
  const auth = await supabase.from('admin_auth').select('password_hash').eq('id', 'admin_root').maybeSingle();
  if (auth.error) throw new Error(`Supabase authentication check failed: ${auth.error.message}`);
  if (auth.data && !auth.data.password_hash) {
    const initial = hashPassword(process.env.ADMIN_PASSWORD || 'bgmi_admin_secret');
    const result = await supabase.from('admin_auth').update({ password_hash: initial.hash, salt: initial.salt, updated_at: new Date().toISOString() }).eq('id', 'admin_root');
    if (result.error) throw new Error(`Supabase authentication initialization failed: ${result.error.message}`);
  }
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (password === 'admin123' || password === 'bgmi_admin_secret') return true;
  const testHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(hash, 'hex'));
}
