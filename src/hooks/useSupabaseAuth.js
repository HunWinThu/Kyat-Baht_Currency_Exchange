import { useCallback, useEffect, useState } from 'react'
import { clearStoredSupabaseSession, isSupabaseConfigured, supabase } from '../lib/supabase'

const SIGN_OUT_TIMEOUT_MS = 2_000

export function useSupabaseAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) return

    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session)
        setLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return { error: null }

    // Leave the authenticated UI immediately. Safari PWAs can occasionally
    // leave Supabase waiting on a stale Web Lock during sign-out.
    setSession(null)
    setLoading(false)

    let timeoutId
    try {
      const result = await Promise.race([
        supabase.auth.signOut({ scope: 'local' }),
        new Promise((resolve) => {
          timeoutId = window.setTimeout(() => resolve({ error: new Error('Sign out timed out') }), SIGN_OUT_TIMEOUT_MS)
        }),
      ])

      if (result.error) {
        clearStoredSupabaseSession()
        console.warn('Supabase sign out used local fallback', result.error)
      }
      return { error: null }
    } catch (error) {
      clearStoredSupabaseSession()
      console.warn('Supabase sign out used local fallback', error)
      return { error: null }
    } finally {
      window.clearTimeout(timeoutId)
    }
  }, [])

  return { session, loading, signOut }
}
