import api from './index'
import { User } from '../store/authStore'

export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  register: async (userData: {
    name: string
    email: string
    password: string
    role?: string
  }): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  verifyToken: async (): Promise<User> => {
    const response = await api.get('/auth/verify')
    return response.data.user
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  resetPassword: async (email: string): Promise<void> => {
    await api.post('/auth/reset-password', { email })
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put('/auth/profile', userData)
    return response.data.user
  },
}