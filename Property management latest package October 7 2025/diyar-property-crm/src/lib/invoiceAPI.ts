import { supabase } from '../lib/supabase';

const SUPABASE_FUNCTION_URL = 'https://jnilfkgeojjydbywktol.supabase.co/functions/v1';

// Proxy function to handle invoice API calls
export const invoiceAPI = {
  // Get all invoices
  getInvoices: async () => {
    try {
      const response = await fetch(`${SUPABASE_FUNCTION_URL}/invoices-api`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaWxma2dlb2pqeWRieXdrdG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDExMzAsImV4cCI6MjA3NDc3NzEzMH0.HtX4Lns_5lT7YdAFL3fIcrZu2DC1E8cry_hO-Mc2_rI'}`,
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return { success: false, error: error.message };
    }
  },

  // Get customers
  getCustomers: async () => {
    try {
      const response = await fetch(`${SUPABASE_FUNCTION_URL}/invoices-api/customers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaWxma2dlb2pqeWRieXdrdG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDExMzAsImV4cCI6MjA3NDc3NzEzMH0.HtX4Lns_5lT7YdAFL3fIcrZu2DC1E8cry_hO-Mc2_rI'}`,
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching customers:', error);
      return { success: false, error: error.message };
    }
  },

  // Get bookings for a customer
  getBookings: async (customerId?: string) => {
    try {
      const url = customerId 
        ? `${SUPABASE_FUNCTION_URL}/invoices-api/bookings?customer_id=${customerId}`
        : `${SUPABASE_FUNCTION_URL}/invoices-api/bookings`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaWxma2dlb2pqeWRieXdrdG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDExMzAsImV4cCI6MjA3NDc3NzEzMH0.HtX4Lns_5lT7YdAFL3fIcrZu2DC1E8cry_hO-Mc2_rI'}`,
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return { success: false, error: error.message };
    }
  },

  // Get milestones for property type
  getMilestones: async (propertyType: string = 'villa') => {
    try {
      const response = await fetch(`${SUPABASE_FUNCTION_URL}/invoices-api/milestones?property_type=${propertyType}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaWxma2dlb2pqeWRieXdrdG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDExMzAsImV4cCI6MjA3NDc3NzEzMH0.HtX4Lns_5lT7YdAFL3fIcrZu2DC1E8cry_hO-Mc2_rI'}`,
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching milestones:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate milestone invoice
  generateMilestoneInvoice: async (data: any) => {
    try {
      const response = await fetch(`${SUPABASE_FUNCTION_URL}/invoices-api/generate-milestone-invoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaWxma2dlb2pqeWRieXdrdG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDExMzAsImV4cCI6MjA3NDc3NzEzMH0.HtX4Lns_5lT7YdAFL3fIcrZu2DC1E8cry_hO-Mc2_rI'}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Error generating milestone invoice:', error);
      return { success: false, error: error.message };
    }
  },

  // Create custom invoice
  createInvoice: async (data: any) => {
    try {
      const response = await fetch(`${SUPABASE_FUNCTION_URL}/invoices-api`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaWxma2dlb2pqeWRieXdrdG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDExMzAsImV4cCI6MjA3NDc3NzEzMH0.HtX4Lns_5lT7YdAFL3fIcrZu2DC1E8cry_hO-Mc2_rI'}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating invoice:', error);
      return { success: false, error: error.message };
    }
  },

  // Mark invoice as paid
  markInvoiceAsPaid: async (invoiceId: string) => {
    try {
      const response = await fetch(`${SUPABASE_FUNCTION_URL}/invoices-api/mark-paid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaWxma2dlb2pqeWRieXdrdG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDExMzAsImV4cCI6MjA3NDc3NzEzMH0.HtX4Lns_5lT7YdAFL3fIcrZu2DC1E8cry_hO-Mc2_rI'}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoice_id: invoiceId }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      return { success: false, error: error.message };
    }
  },
};