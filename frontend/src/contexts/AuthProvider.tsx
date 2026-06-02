import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue } from '@/contexts/auth-context'
import { authApi, tokenStorage } from '@/services/api'
import type { AuthUser } from '@/types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tokenStorage.get()) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (username, password) => {
        const response = await authApi.login(username, password)
        tokenStorage.set(response.accessToken)
        setUser(response.user)
      },
      register: async (username, password) => {
        const response = await authApi.register(username, password)
        tokenStorage.set(response.accessToken)
        setUser(response.user)
      },
      logout: () => {
        tokenStorage.clear()
        setUser(null)
      }
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
