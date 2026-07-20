/**
 * Supabase Client Configuration
 *
 * When VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set, exports the real client.
 * When missing, exports a no-op proxy so all call sites work without null checks.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn(
    'Supabase not configured — auth, forum, and sync features disabled. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable.'
  );
}

/**
 * No-op proxy that returns empty results for any Supabase call chain.
 * Allows all service code to call supabase.from().select() etc. without null checks.
 */
function createNoOpProxy(): any {
  const noOpFn = () => createNoOpProxy();
  const noOpAsync = async () => ({ data: null, error: null, count: null });
  const noOpChain = new Proxy(noOpFn, {
    get(_target, prop) {
      if (prop === 'then') return undefined;
      if (prop === 'auth') {
        const authProxy = new Proxy({}, {
          get: (_t, method) => {
            if (method === 'onAuthStateChange') {
              return (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } });
            }
            if (method === 'getSession') {
              return async () => ({ data: { session: null }, error: null });
            }
            if (method === 'getUser') {
              return async () => ({ data: { user: null }, error: null });
            }
            if (method === 'signUp' || method === 'signInWithPassword' || method === 'signOut' || method === 'resetPasswordForEmail' || method === 'updateUser') {
              return async () => ({ data: null, error: null });
            }
            return async () => ({ data: null, error: null });
          }
        });
        return authProxy;
      }
      if (prop === 'rpc') return noOpAsync;
      if (prop === 'channel') return () => ({ subscribe: () => ({ on: () => ({ subscribe: () => {} }) }) });
      return noOpFn;
    },
    apply: () => createNoOpProxy(),
  });
  return noOpChain;
}

/**
 * Supabase client — real when configured, no-op proxy otherwise.
 */
export const supabase: SupabaseClient<Database> = isConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : createNoOpProxy();

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async () => {
  if (!isConfigured) return null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    return data?.user || null;
  } catch (err) {
    console.error('Unexpected error fetching user:', err);
    return null;
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async () => {
  if (!isConfigured) return false;
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error signing out:', err);
    return false;
  }
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (
  callback: (user: any | null) => void
) => {
  if (!isConfigured) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
};

/**
 * Health check: Test connection to Supabase
 */
export const testSupabaseConnection = async () => {
  if (!isConfigured) return false;
  try {
    const { data, error } = await supabase
      .from('_supabase_migrations')
      .select('*', { count: 'exact' })
      .limit(1);

    if (error) {
      console.warn('Supabase health check failed:', error);
      return false;
    }
    console.log('✓ Supabase connection OK');
    return true;
  } catch (err) {
    console.warn('Supabase health check error:', err);
    return false;
  }
};

export default supabase;
