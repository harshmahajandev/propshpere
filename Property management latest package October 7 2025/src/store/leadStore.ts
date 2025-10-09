import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export interface Lead {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  preferred_language: 'en' | 'ar'
  buyer_type: 'hni' | 'investor' | 'retail'
  budget_min: number
  budget_max: number
  currency: 'BHD' | 'USD'
  property_interests: string[]
  timeline: 'immediate' | '3-6_months' | '6-12_months' | '12+_months'
  status: 'prospect' | 'contacted' | 'viewing' | 'negotiation' | 'closed' | 'lost'
  score: number
  source: 'website' | 'referral' | 'social_media' | 'advertisement' | 'walk_in'
  assigned_to?: string
  notes: Array<{
    id: string
    content: string
    createdBy: string
    createdAt: string
  }>
  activities: Array<{
    id: string
    type: 'call' | 'email' | 'meeting' | 'site_visit' | 'follow_up'
    description: string
    scheduledAt?: string
    completedAt?: string
    createdBy: string
    createdAt: string
  }>
  ai_insights: {
    purchaseProbability: number
    recommendedActions: string[]
    optimalContactTime: string
    matchingProperties: string[]
  }
  created_at: string
  updated_at: string
}

interface LeadState {
  leads: Lead[]
  currentLead: Lead | null
  isLoading: boolean
  error: string | null
  filters: {
    status?: string
    buyerType?: string
    assignedTo?: string
    scoreRange?: [number, number]
    search?: string
  }
  fetchLeads: () => Promise<void>
  getLead: (id: string) => Promise<void>
  createLead: (data: Partial<Lead>) => Promise<void>
  updateLead: (id: string, data: Partial<Lead>) => Promise<void>
  updateLeadStatus: (id: string, status: Lead['status']) => Promise<void>
  addNote: (leadId: string, content: string) => Promise<void>
  addActivity: (leadId: string, activity: Partial<Lead['activities'][0]>) => Promise<void>
  setFilters: (filters: Partial<LeadState['filters']>) => void
  clearError: () => void
}

export const useLeadStore = create<LeadState>((set, get) => ({
  leads: [],
  currentLead: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchLeads: async () => {
    set({ isLoading: true, error: null })
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      
      const filters = get().filters
      
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters.buyerType) {
        query = query.eq('buyer_type', filters.buyerType)
      }
      
      if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo)
      }
      
      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }
      
      const { data: leads, error } = await query
      
      if (error) throw error
      
      set({ leads: leads || [], isLoading: false })
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch leads',
        isLoading: false 
      })
      toast.error('Failed to fetch leads')
    }
  },

  getLead: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data: lead, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      
      if (error) throw error
      
      set({ currentLead: lead, isLoading: false })
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch lead',
        isLoading: false 
      })
      toast.error('Failed to fetch lead')
    }
  },

  createLead: async (data: Partial<Lead>) => {
    set({ isLoading: true, error: null })
    try {
      const { data: lead, error } = await supabase
        .from('leads')
        .insert([data])
        .select()
        .single()
      
      if (error) throw error
      
      set(state => ({ 
        leads: [lead, ...state.leads],
        isLoading: false 
      }))
      
      toast.success('Lead created successfully')
      return lead
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to create lead',
        isLoading: false 
      })
      toast.error('Failed to create lead')
      throw error
    }
  },

  updateLead: async (id: string, data: Partial<Lead>) => {
    set({ isLoading: true, error: null })
    try {
      const { data: lead, error } = await supabase
        .from('leads')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      set(state => ({
        leads: state.leads.map(l => l.id === id ? lead : l),
        currentLead: state.currentLead?.id === id ? lead : state.currentLead,
        isLoading: false
      }))
      
      toast.success('Lead updated successfully')
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update lead',
        isLoading: false 
      })
      toast.error('Failed to update lead')
      throw error
    }
  },

  updateLeadStatus: async (id: string, status: Lead['status']) => {
    set({ isLoading: true, error: null })
    try {
      const { data: lead, error } = await supabase
        .from('leads')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      set(state => ({
        leads: state.leads.map(l => l.id === id ? lead : l),
        currentLead: state.currentLead?.id === id ? lead : state.currentLead,
        isLoading: false
      }))
      
      toast.success('Lead status updated successfully')
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update lead status',
        isLoading: false 
      })
      toast.error('Failed to update lead status')
      throw error
    }
  },

  addNote: async (leadId: string, content: string) => {
    try {
      // For now, just update the lead with the note in a notes array
      const currentLead = get().currentLead || get().leads.find(l => l.id === leadId)
      if (!currentLead) throw new Error('Lead not found')
      
      const newNote = {
        id: Date.now().toString(),
        content,
        createdBy: 'current-user',
        createdAt: new Date().toISOString()
      }
      
      const updatedNotes = [...(currentLead.notes || []), newNote]
      
      const { data: lead, error } = await supabase
        .from('leads')
        .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .select()
        .single()
      
      if (error) throw error
      
      set(state => ({
        leads: state.leads.map(l => l.id === leadId ? lead : l),
        currentLead: state.currentLead?.id === leadId ? lead : state.currentLead
      }))
      
      toast.success('Note added successfully')
    } catch (error: any) {
      set({ error: error.message || 'Failed to add note' })
      toast.error('Failed to add note')
      throw error
    }
  },

  addActivity: async (leadId: string, activity: Partial<Lead['activities'][0]>) => {
    try {
      const currentLead = get().currentLead || get().leads.find(l => l.id === leadId)
      if (!currentLead) throw new Error('Lead not found')
      
      const newActivity = {
        id: Date.now().toString(),
        ...activity,
        createdBy: 'current-user',
        createdAt: new Date().toISOString()
      }
      
      const updatedActivities = [...(currentLead.activities || []), newActivity]
      
      const { data: lead, error } = await supabase
        .from('leads')
        .update({ activities: updatedActivities, updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .select()
        .single()
      
      if (error) throw error
      
      set(state => ({
        leads: state.leads.map(l => l.id === leadId ? lead : l),
        currentLead: state.currentLead?.id === leadId ? lead : state.currentLead
      }))
      
      toast.success('Activity added successfully')
    } catch (error: any) {
      set({ error: error.message || 'Failed to add activity' })
      toast.error('Failed to add activity')
      throw error
    }
  },

  setFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }))
  },

  clearError: () => set({ error: null })
}))