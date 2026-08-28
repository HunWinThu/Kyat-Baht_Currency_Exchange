import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabaseAuthStorageKey = supabaseUrl
  ? `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
  : null

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: supabaseAuthStorageKey,
      },
    })
  : null

export function clearStoredSupabaseSession() {
  if (!supabaseAuthStorageKey) return
  try {
    window.localStorage.removeItem(supabaseAuthStorageKey)
    window.localStorage.removeItem(`${supabaseAuthStorageKey}-user`)
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index)
      if (key?.startsWith(`${supabaseAuthStorageKey}-code-verifier`)) window.localStorage.removeItem(key)
    }
  } catch (error) {
    console.warn('Could not clear the stored Supabase session', error)
  }
}
