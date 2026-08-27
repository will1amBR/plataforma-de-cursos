import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export interface UserRecord extends RecordModel {
  email: string
  name?: string
  avatar?: string
  role?: 'admin' | 'moderator' | 'aluno'
  status?: 'active' | 'blocked'
  blocked_users?: string[]
  verified?: boolean
}

interface AuthContextType {
  user: UserRecord | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isModerator: boolean
  isLoading: boolean
  login: (email: string, pass: string) => Promise<UserRecord>
  signup: (email: string, pass: string, name: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  getUserAvatarUrl: (userObj?: UserRecord | null) => string
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  isModerator: false,
  isLoading: true,
  login: async () => {
    throw new Error('Not implemented')
  },
  signup: async () => {},
  logout: () => {},
  refreshUser: async () => {},
  requestPasswordReset: async () => {},
  getUserAvatarUrl: () => '',
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserRecord | null>(
    () => (pb.authStore.record as unknown as UserRecord) || null,
  )
  const [token, setToken] = useState<string | null>(() => pb.authStore.token || null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const syncAuth = useCallback(() => {
    const record = pb.authStore.record as unknown as UserRecord | null
    setUser(record)
    setToken(pb.authStore.token || null)
  }, [])

  useEffect(() => {
    syncAuth()
    setIsLoading(false)

    const unsubscribe = pb.authStore.onChange(() => {
      syncAuth()
    })

    return () => {
      unsubscribe()
    }
  }, [syncAuth])

  const login = async (email: string, pass: string): Promise<UserRecord> => {
    const authData = await pb.collection('users').authWithPassword(email, pass)
    const loggedUser = authData.record as unknown as UserRecord
    setUser(loggedUser)
    setToken(authData.token)
    return loggedUser
  }

  const signup = async (email: string, pass: string, name: string): Promise<void> => {
    await pb.collection('users').create({
      email,
      password: pass,
      passwordConfirm: pass,
      name,
      role: 'aluno',
      status: 'active',
    })
    // Auto login after signup
    await login(email, pass)
  }

  const logout = () => {
    pb.authStore.clear()
    setUser(null)
    setToken(null)
  }

  const refreshUser = async () => {
    if (pb.authStore.isValid && pb.authStore.record?.id) {
      try {
        const updated = await pb.collection('users').getOne<UserRecord>(pb.authStore.record.id)
        setUser(updated)
      } catch (err) {
        console.warn('Failed to refresh user:', err)
      }
    }
  }

  const requestPasswordReset = async (email: string) => {
    await pb.collection('users').requestPasswordReset(email)
  }

  const getUserAvatarUrl = (userObj?: UserRecord | null): string => {
    const target = userObj || user
    if (target?.avatar) {
      return pb.files.getURL(target, target.avatar)
    }
    if (target?.name) {
      return `https://img.usecurling.com/ppl/medium?gender=male&seed=${target.id || 1}`
    }
    return `https://img.usecurling.com/ppl/medium?seed=1`
  }

  const isAdmin = user?.role === 'admin'
  const isModerator = user?.role === 'moderator' || isAdmin
  const isAuthenticated = !!user && pb.authStore.isValid

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isModerator,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
        requestPasswordReset,
        getUserAvatarUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
