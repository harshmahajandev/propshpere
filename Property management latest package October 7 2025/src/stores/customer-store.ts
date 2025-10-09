import { create } from 'zustand'
import { supabase, type Invoice, type CustomerCommunication, type CustomerTicket, type User } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface CustomerState {
  customers: User[]
  communications: CustomerCommunication[]
  tickets: CustomerTicket[]
  loading: boolean
  error: string | null
  
  // Actions
  fetchCustomers: () => Promise<void>
  fetchCustomerCommunications: (customerId: string) => Promise<void>
  fetchCustomerTickets: (customerId: string) => Promise<void>
  createCommunication: (communication: Partial<CustomerCommunication>) => Promise<void>
  createTicket: (ticket: Partial<CustomerTicket>) => Promise<void>
  updateCustomerProfile: (customerId: string, updates: Partial<User>) => Promise<void>
  updateTicketStatus: (ticketId: string, status: string, resolution?: string) => Promise<void>
  clearError: () => void
}

export const useCustomerStore = create<CustomerState>()(
  (set, get) => ({
    customers: [],
    communications: [],
    tickets: [],
    loading: false,
    error: null,

    fetchCustomers: async () => {
      set({ loading: true, error: null })
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'customer')
          .order('created_at', { ascending: false })

        if (error) throw error
        
        set({ customers: data || [], loading: false })
      } catch (error: any) {
        set({ error: error.message, loading: false })
        toast.error('Failed to fetch customers')
      }
    },

    fetchCustomerCommunications: async (customerId: string) => {
      set({ loading: true, error: null })
      
      try {
        const { data, error } = await supabase
          .from('customer_communications')
          .select('*, staff:profiles!staff_id(full_name)')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })

        if (error) throw error
        
        set({ communications: data || [], loading: false })
      } catch (error: any) {
        set({ error: error.message, loading: false })
        toast.error('Failed to fetch communications')
      }
    },

    fetchCustomerTickets: async (customerId: string) => {
      set({ loading: true, error: null })
      
      try {
        const { data, error } = await supabase
          .from('customer_tickets')
          .select('*, assigned:profiles!assigned_to(full_name), property:properties(title)')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })

        if (error) throw error
        
        set({ tickets: data || [], loading: false })
      } catch (error: any) {
        set({ error: error.message, loading: false })
        toast.error('Failed to fetch tickets')
      }
    },

    createCommunication: async (communication: Partial<CustomerCommunication>) => {
      set({ loading: true, error: null })
      
      try {
        const { data, error } = await supabase
          .from('customer_communications')
          .insert({
            ...communication,
            completed_date: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error
        
        const currentComms = get().communications
        set({ 
          communications: [data, ...currentComms],
          loading: false 
        })
        
        toast.success('Communication recorded successfully')
      } catch (error: any) {
        set({ error: error.message, loading: false })
        toast.error('Failed to record communication')
        throw error
      }
    },

    createTicket: async (ticket: Partial<CustomerTicket>) => {
      set({ loading: true, error: null })
      
      try {
        // Generate ticket number
        const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`
        
        const { data, error } = await supabase
          .from('customer_tickets')
          .insert({
            ...ticket,
            ticket_number: ticketNumber,
            status: 'open',
          })
          .select()
          .single()

        if (error) throw error
        
        const currentTickets = get().tickets
        set({ 
          tickets: [data, ...currentTickets],
          loading: false 
        })
        
        toast.success('Ticket created successfully')
      } catch (error: any) {
        set({ error: error.message, loading: false })
        toast.error('Failed to create ticket')
        throw error
      }
    },

    updateCustomerProfile: async (customerId: string, updates: Partial<User>) => {
      set({ loading: true, error: null })
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', customerId)
          .select()
          .single()

        if (error) throw error
        
        const currentCustomers = get().customers
        const updatedCustomers = currentCustomers.map(customer => 
          customer.id === customerId ? data : customer
        )
        
        set({ customers: updatedCustomers, loading: false })
        toast.success('Customer profile updated successfully')
      } catch (error: any) {
        set({ error: error.message, loading: false })
        toast.error('Failed to update customer profile')
        throw error
      }
    },

    updateTicketStatus: async (ticketId: string, status: string, resolution?: string) => {
      set({ loading: true, error: null })
      
      try {
        const updateData: any = {
          status,
          updated_at: new Date().toISOString(),
        }
        
        if (resolution) {
          updateData.resolution = resolution
        }
        
        if (status === 'resolved' || status === 'closed') {
          updateData.resolved_at = new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('customer_tickets')
          .update(updateData)
          .eq('id', ticketId)
          .select()
          .single()

        if (error) throw error
        
        const currentTickets = get().tickets
        const updatedTickets = currentTickets.map(ticket => 
          ticket.id === ticketId ? data : ticket
        )
        
        set({ tickets: updatedTickets, loading: false })
        toast.success('Ticket updated successfully')
      } catch (error: any) {
        set({ error: error.message, loading: false })
        toast.error('Failed to update ticket')
        throw error
      }
    },

    clearError: () => set({ error: null }),
  })
)
