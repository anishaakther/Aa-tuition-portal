import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem('aa-demo-user')
      if (saved) {
        const parsed = JSON.parse(saved)
        setUser(parsed.user)
        setRole(parsed.role)
      }
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user || null
      setUser(u)
      if (u) await fetchRole(u.id)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user || null
      setUser(u)
      if (u) await fetchRole(u.id)
      else setRole(null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function fetchRole(id) {
    // Use the security-definer helper first. This avoids role lookups being
    // blocked by profiles RLS while still relying on the authenticated user.
    const { data: tutorFlag, error: tutorError } = await supabase.rpc('is_tutor')
    if (!tutorError && tutorFlag === true) {
      setRole('tutor')
      return 'tutor'
    }

    // Non-tutors are treated as parents. Try to read the profile for clarity,
    // but never grant tutor access unless is_tutor() explicitly returns true.
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', id)
      .maybeSingle()

    const nextRole = !error && data?.role === 'tutor' ? 'tutor' : 'parent'
    setRole(nextRole)
    return nextRole
  }

  async function signIn(email, password, requestedRole = 'tutor') {
    if (!isSupabaseConfigured) {
      const demoUser = { id: requestedRole === 'tutor' ? 'demo-tutor' : 'demo-parent', email }
      setUser(demoUser)
      setRole(requestedRole)
      localStorage.setItem('aa-demo-user', JSON.stringify({ user: demoUser, role: requestedRole }))
      return { error: null }
    }
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signOut() {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('aa-demo-user')
      setUser(null); setRole(null)
      return
    }
    await supabase.auth.signOut()
  }

  const value = useMemo(() => ({ user, role, loading, signIn, signOut }), [user, role, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
