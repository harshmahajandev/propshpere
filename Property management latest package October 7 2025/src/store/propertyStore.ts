import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export interface Property {
  id: string
  title: string
  project: string
  type: 'villa' | 'plot' | 'commercial_villa' | 'commercial_plot' | 'warehouse'
  status: 'available' | 'reserved' | 'sold' | 'maintenance'
  price: number
  currency: 'BHD' | 'USD'
  size: number
  bedrooms?: number
  bathrooms?: number
  location: string
  description: string
  images: string[]
  floorPlans?: string[]
  amenities: string[]
  leadMatches: {
    total: number
    hni: number
    investor: number
    retail: number
  }
  interestScore: number
  createdAt: string
  updatedAt: string
}

interface PropertyState {
  properties: Property[]
  currentProperty: Property | null
  isLoading: boolean
  error: string | null
  filters: {
    project?: string
    type?: string
    status?: string
    priceRange?: [number, number]
    search?: string
  }
  fetchProperties: () => Promise<void>
  getProperty: (id: string) => Promise<void>
  createProperty: (data: Partial<Property>) => Promise<void>
  updateProperty: (id: string, data: Partial<Property>) => Promise<void>
  deleteProperty: (id: string) => Promise<void>
  setFilters: (filters: Partial<PropertyState['filters']>) => void
  clearError: () => void
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  currentProperty: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchProperties: async () => {
    set({ isLoading: true, error: null })
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
      
      const filters = get().filters
      
      if (filters.project) {
        query = query.eq('project', filters.project)
      }
      
      if (filters.type) {
        query = query.eq('type', filters.type)
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,project.ilike.%${filters.search}%,location.ilike.%${filters.search}%`)
      }
      
      if (filters.priceRange) {
        query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1])
      }
      
      const { data: properties, error } = await query
      
      if (error) throw error
      
      set({ properties: properties || [], isLoading: false })
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch properties',
        isLoading: false 
      })
      toast.error('Failed to fetch properties')
    }
  },

  getProperty: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data: property, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      
      if (error) throw error
      
      set({ currentProperty: property, isLoading: false })
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch property',
        isLoading: false 
      })
      toast.error('Failed to fetch property')
    }
  },

  createProperty: async (data: Partial<Property>) => {
    set({ isLoading: true, error: null })
    try {
      const { data: property, error } = await supabase
        .from('properties')
        .insert([data])
        .select()
        .single()
      
      if (error) throw error
      
      set(state => ({ 
        properties: [property, ...state.properties],
        isLoading: false 
      }))
      
      toast.success('Property created successfully')
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to create property',
        isLoading: false 
      })
      toast.error('Failed to create property')
      throw error
    }
  },

  updateProperty: async (id: string, data: Partial<Property>) => {
    set({ isLoading: true, error: null })
    try {
      const { data: property, error } = await supabase
        .from('properties')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      set(state => ({
        properties: state.properties.map(p => p.id === id ? property : p),
        currentProperty: state.currentProperty?.id === id ? property : state.currentProperty,
        isLoading: false
      }))
      
      toast.success('Property updated successfully')
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update property',
        isLoading: false 
      })
      toast.error('Failed to update property')
      throw error
    }
  },

  deleteProperty: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      set(state => ({
        properties: state.properties.filter(p => p.id !== id),
        currentProperty: state.currentProperty?.id === id ? null : state.currentProperty,
        isLoading: false
      }))
      
      toast.success('Property deleted successfully')
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete property',
        isLoading: false 
      })
      toast.error('Failed to delete property')
      throw error
    }
  },

  setFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }))
  },

  clearError: () => set({ error: null })
}))