import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const getSupabaseConfig = () => {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  let storedUrl = '';
  let storedKey = '';
  if (typeof window !== 'undefined') {
    storedUrl = (localStorage.getItem('sh_supabase_url') || '').trim();
    storedKey = (localStorage.getItem('sh_supabase_anon_key') || '').trim();
  }

  const url = envUrl && envUrl !== 'https://your-project.supabase.co' ? envUrl : storedUrl;
  const key = envKey && envKey !== 'your-supabase-anon-key-here' ? envKey : storedKey;

  return {
    url,
    key,
    isEnvConfigured: Boolean(envUrl && envUrl.startsWith('http')),
  };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return Boolean(
    url &&
    key &&
    url !== 'https://your-project.supabase.co' &&
    key !== 'your-supabase-anon-key-here' &&
    url.startsWith('http')
  );
};

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getSupabaseConfig();
  if (!isSupabaseConfigured()) {
    cachedClient = null;
    return null;
  }
  if (cachedClient && url === lastUsedUrl && key === lastUsedKey) {
    return cachedClient;
  }
  try {
    lastUsedUrl = url;
    lastUsedKey = key;
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

export const saveSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sh_supabase_url', url.trim());
    localStorage.setItem('sh_supabase_anon_key', key.trim());
  }
  cachedClient = null;
  lastUsedUrl = '';
  lastUsedKey = '';
};

export const clearSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sh_supabase_url');
    localStorage.removeItem('sh_supabase_anon_key');
  }
  cachedClient = null;
  lastUsedUrl = '';
  lastUsedKey = '';
};

// Export proxy for backwards compatibility with direct `supabase.from(...)`
export const supabase = new Proxy({} as unknown as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) return undefined;
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

/**
 * Format clean phone numbers for order tracking verification
 */
export const normalizePhone = (phone: string): string => {
  return (phone || '').replace(/[^0-9]/g, '');
};
