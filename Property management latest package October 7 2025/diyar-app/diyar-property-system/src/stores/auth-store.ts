import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, type User } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, full_name: string) => Promise<void>
  signOut: () => Promise<void>
  getCurrentUser: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,

      signIn: async (email: string, password: string) => {
        set({ loading: true, error: null })
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) throw error

          if (data.user) {
            // Get user profile from profiles table
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle()

            if (profileError) {
              console.error('Error fetching profile:', profileError)
            }

            const userData: User = {
              id: data.user.id,
              email: data.user.email!,
              full_name: profile?.full_name || data.user.user_metadata?.full_name || '',
              phone: profile?.phone || '',
              role: profile?.role || 'customer',
              avatar_url: profile?.avatar_url || '',
              company: profile?.company || '',
              nationality: profile?.nationality || '',
              created_at: profile?.created_at || data.user.created_at,
              updated_at: profile?.updated_at || new Date().toISOString(),
            }

            set({ user: userData, loading: false })
            toast.success('Welcome back!')
          }
        } catch (error: any) {
          set({ error: error.message, loading: false })
          toast.error(error.message || 'Sign in failed')
          throw error
        }
      },

      signUp: async (email: string, password: string, full_name: string) => {
        set({ loading: true, error: null })
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name,
              },
            },
          })

          if (error) throw error

          if (data.user) {
            // Create profile in profiles table
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email!,
                full_name,
                role: 'customer',
              })

            if (profileError) {
              console.error('Error creating profile:', profileError)
            }

            set({ loading: false })
            toast.success('Account created! Please check your email to verify your account.')
          }
        } catch (error: any) {
          set({ error: error.message, loading: false })
          toast.error(error.message || 'Sign up failed')
          throw error
        }
      },

      signOut: async () => {
        set({ loading: true })
        
        try {
          const { error } = await supabase.auth.signOut()
          if (error) throw error
          
          set({ user: null, loading: false })
          toast.success('Signed out successfully')
        } catch (error: any) {
          set({ error: error.message, loading: false })
          toast.error(error.message || 'Sign out failed')
        }
      },

      getCurrentUser: async () => {
        set({ loading: true })
        
        try {
          const { data: { user }, error } = await supabase.auth.getUser()
          
          if (error) throw error
          
          if (user) {
            // Get user profile from profiles table
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle()

            if (profileError) {
              console.error('Error fetching profile:', profileError)
            }

            const userData: User = {
              id: user.id,
              email: user.email!,
              full_name: profile?.full_name || user.user_metadata?.full_name || '',
              phone: profile?.phone || '',
              role: profile?.role || 'customer',
              avatar_url: profile?.avatar_url || '',
              company: profile?.company || '',
              nationality: profile?.nationality || '',
              created_at: profile?.created_at || user.created_at,
              updated_at: profile?.updated_at || new Date().toISOString(),
            }

            set({ user: userData, loading: false })
          } else {
            set({ user: null, loading: false })
          }
        } catch (error: any) {
          set({ error: error.message, user: null, loading: false })
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        const state = get() as AuthState
        const { user } = state
        if (!user) throw new Error('No user found')
        
        set({ loading: true, error: null })
        
        try {
          const { data, error } = await supabase
            .from('profiles')
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)
            .select()
            .maybeSingle()

          if (error) throw error

          if (data) {
            const updatedUser = { ...user, ...data }
            set({ user: updatedUser, loading: false })
            toast.success('Profile updated successfully')
          }
        } catch (error: any) {
          set({ error: error.message, loading: false })
          toast.error(error.message || 'Profile update failed')
          throw error
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
