'use client'
import { createContext, useContext, ReactNode } from 'react'
import useSWR from 'swr'
import type { User } from '@/types/api'
import { api } from '@/lib/api-client'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  mutate: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  mutate: () => {}
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, mutate } = useSWR(
    '/auth/me',
    async (): Promise<User | null> => {
      try {
        return await api.auth.me() as User
      } catch {
        return null
      }
    },
    { revalidateOnFocus: false, shouldRetryOnError: false }
  )

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, isAuthenticated: !!user, mutate }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
