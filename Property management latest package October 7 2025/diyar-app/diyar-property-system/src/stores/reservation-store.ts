import { create } from 'zustand'
import { supabase, type Reservation } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface ReservationState {
  reservations: Reservation[]
  currentReservation: Reservation | null
  loading: boolean
  error: string | null
  filters: {
    status: string
    customer_name: string
    property_id: string
    date_range: { start: string; end: string } | null
  }
  
  // Actions
  fetchReservations: () => Promise<void>
  fetchReservation: (id: string) => Promise<void>
  createReservation: (reservationData: {
    property_id: string
    unit_id?: string
    customer_name: string
    customer_email: string
    customer_phone: string
    customer_nationality?: string
    viewing_date?: string
    preferred_contact_time?: string
    budget_min?: number
    budget_max?: number
    financing_needed?: boolean
    special_requirements?: string
  }) => Promise<Reservation>
  updateReservation: (id: string, updates: Partial<Reservation>) => Promise<void>
  updateReservationStatus: (id: string, status: Reservation['status']) => Promise<void>
  cancelReservation: (id: string, reason?: string) => Promise<void>
  checkAvailability: (property_id: string, unit_id?: string, check_date?: string) => Promise<any>
  setFilters: (filters: Partial<ReservationState['filters']>) => void
  clearFilters: () => void
  clearError: () => void
}

const defaultFilters = {
  status: '',
  customer_name: '',
  property_id: '',
  date_range: null,
}

export const useReservationStore = create<ReservationState>((set, get) => ({
  reservations: [],
  currentReservation: null,
  loading: false,
  error: null,
  filters: defaultFilters,

  fetchReservations: async () => {
    set({ loading: true, error: null })
    
    try {
      let query = supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false })
      
      const { filters } = get()
      
      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters.customer_name) {
        query = query.ilike('customer_name', `%${filters.customer_name}%`)
      }
      
      if (filters.property_id) {
        query = query.eq('property_id', filters.property_id)
      }
      
      if (filters.date_range) {
        query = query
          .gte('created_at', filters.date_range.start)
          .lte('created_at', filters.date_range.end)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      set({ reservations: data || [], loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
      toast.error(error.message || 'Failed to fetch reservations')
    }
  },

  fetchReservation: async (id: string) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      
      if (error) throw error
      
      set({ currentReservation: data, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
      toast.error(error.message || 'Failed to fetch reservation')
    }
  },

  createReservation: async (reservationData) => {
    set({ loading: true, error: null })
    
    try {
      // Use the edge function to create reservation
      const { data, error } = await supabase.functions.invoke('create-reservation', {
        body: reservationData
      })
      
      if (error) throw error
      
      // Fetch updated reservations list
      await get().fetchReservations()
      
      const result = data?.data || data
      
      toast.success(`Reservation created successfully! Confirmation: ${result.confirmation_number}`)
      
      // Return the reservation data for further use
      return {
        id: result.reservation_id,
        ...reservationData,
        status: 'pending' as const,
        reservation_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        financing_needed: reservationData.financing_needed || false,
        deposit_status: 'pending' as const,
      }
    } catch (error: any) {
      set({ error: error.message, loading: false })
      toast.error(error.message || 'Failed to create reservation')
      throw error
    }
  },

  updateReservation: async (id: string, updates) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('reservations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      set((state) => ({
        reservations: state.reservations.map(r => r.id === id ? data : r),
        currentReservation: state.currentReservation?.id === id ? data : state.currentReservation,
        loading: false
      }))
      
      toast.success('Reservation updated successfully')
    } catch (error: any) {
      set({ error: error.message, loading: false })
      toast.error(error.message || 'Failed to update reservation')
      throw error
    }
  },

  updateReservationStatus: async (id: string, status: Reservation['status']) => {
    await get().updateReservation(id, { status })
  },

  cancelReservation: async (id: string, reason?: string) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('reservations')
        .update({ 
          status: 'cancelled',
          notes: reason || 'Cancelled by customer',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      // Update property availability
      if (data.property_id) {
        const { data: property } = await supabase
          .from('properties')
          .select('available_units, total_units')
          .eq('id', data.property_id)
          .single()
        
        if (property && property.available_units < property.total_units) {
          await supabase
            .from('properties')
            .update({ 
              available_units: property.available_units + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.property_id)
        }
      }
      
      // Update unit status if applicable
      if (data.unit_id) {
        await supabase
          .from('property_units')
          .update({ 
            status: 'available',
            updated_at: new Date().toISOString()
          })
          .eq('id', data.unit_id)
      }
      
      set((state) => ({
        reservations: state.reservations.map(r => r.id === id ? data : r),
        currentReservation: state.currentReservation?.id === id ? data : state.currentReservation,
        loading: false
      }))
      
      toast.success('Reservation cancelled successfully')
    } catch (error: any) {
      set({ error: error.message, loading: false })
      toast.error(error.message || 'Failed to cancel reservation')
      throw error
    }
  },

  checkAvailability: async (property_id: string, unit_id?: string, check_date?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-availability', {
        body: { property_id, unit_id, check_date }
      })
      
      if (error) throw error
      
      return data?.data || data
    } catch (error: any) {
      toast.error(error.message || 'Failed to check availability')
      throw error
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }))
  },

  clearFilters: () => {
    set({ filters: defaultFilters })
  },

  clearError: () => set({ error: null }),
}))