import { create } from 'zustand'
import { authApi } from '../api/auth'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'sales_manager' | 'sales_rep'
  avatar?: string
  permissions: string[]
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    
    // Demo mode: Always succeed with demo user
    const demoUser: User = {
      id: 'demo-user-123',
      email: email || 'demo@diyar.bh',
      name: 'Demo User',
      role: 'admin',
      avatar: '/default-avatar.png',
      permissions: [
        'dashboard:read',
        'crm:read',
        'crm:write',
        'financial:read',
        'financial:write',
        'reservations:read',
        'reservations:write',
        'analytics:read',
        'properties:read',
        'properties:write',
        'leads:read',
        'leads:write',
        'admin:all'
      ]
    }
    
    const demoToken = 'demo-token-' + Date.now()
    
    // Simulate API delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 800))
    
    localStorage.setItem('token', demoToken)
    set({ user: demoUser, token: demoToken, isLoading: false })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ user: null, token: null })
      return
    }

    set({ isLoading: true })
    
    // Demo mode: If we have a demo token, create demo user
    if (token.startsWith('demo-token-')) {
      const demoUser: User = {
        id: 'demo-user-123',
        email: 'demo@diyar.bh',
        name: 'Demo User',
        role: 'admin',
        avatar: '/default-avatar.png',
        permissions: [
          'dashboard:read',
          'crm:read',
          'crm:write',
          'financial:read',
          'financial:write',
          'reservations:read',
          'reservations:write',
          'analytics:read',
          'properties:read',
          'properties:write',
          'leads:read',
          'leads:write',
          'admin:all'
        ]
      }
      set({ user: demoUser, token, isLoading: false })
      return
    }
    
    // Original auth verification (kept for future use)
    try {
      const user = await authApi.verifyToken()
      set({ user, token, isLoading: false })
    } catch (error) {
      localStorage.removeItem('token')
      set({ user: null, token: null, isLoading: false })
    }
  },

  clearError: () => set({ error: null })
}))