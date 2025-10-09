import { create } from 'zustand'
import { supabase, type FinancialRecord, type Invoice, type FinancialSummary, type OccupancyStats, type CustomerStats } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'

interface FinancialState {
  financialRecords: FinancialRecord[]
  invoices: Invoice[]
  financialSummary: FinancialSummary | null
  occupancyStats: OccupancyStats | null
  customerStats: CustomerStats | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchFinancialRecords: (startDate?: string, endDate?: string) => Promise<void>
  fetchInvoices: (status?: string) => Promise<void>
  createInvoice: (invoice: Partial<Invoice>) => Promise<void>
  updateInvoiceStatus: (invoiceId: string, status: string) => Promise<void>
  fetchFinancialSummary: (period: string) => Promise<void>
  fetchOccupancyStats: (period: string) => Promise<void>
  fetchCustomerStats: (period: string) => Promise<void>
  generateFinancialReport: (reportType: string, parameters: any) => Promise<string>
  clearError: () => void
}

export const useFinancialStore = create<FinancialState>()(
  (set, get) => ({
    financialRecords: [],
    invoices: [],
    financialSummary: null,
    occupancyStats: null,
    customerStats: null,
    loading: false,
    error: null,

    fetchFinancialRecords: async (startDate?: string, endDate?: string) => {
      set({ loading: true, error: null })
      
      try {
        let query = supabase
          .from('financial_records')
          .select('*, property:properties(title), customer:profiles!customer_id(full_name)')
          .order('transaction_date', { ascending: false })

        if (startDate) {
          query = query.gte('transaction_date', startDate)
        }
        if (endDate) {
          query = query.lte('transaction_date', endDate)
        }

        const { data, error } = await query

        if (error) throw error
        
        set({ financialRecords: data || [], loading: false })
      } catch (error: any) {
        set({ error: error.message, loading: false })
        toast.error('Failed to fetch financial records')
      }
    },

    fetchInvoices: async (status?: string) => {
      set({ loading: true, error: null })
      
      try {
        let query = supabase
          .from('invoices')
          .select('*, customer:profiles!customer_id(full_name), property:properties(title)')
          .order('created_at', { ascending: false })

        if (status) {
          query = query.eq('status', status)
        }

        const { data, error } = await query

        if (error) throw error
        
        set({ invoices: data || [], loading: false })
      } catch (error: any) {
        set({ error: error.message, loading: false })
        toast.error('Failed to fetch invoices')
      }
    },

    createInvoice: async (invoice: Partial<Invoice>) => {
      set({ loading: true, error: null })
      
      try {
        // Generate invoice number
        const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
        
        const { data, error } = await supabase
          .from('invoices')
          .insert({
            ...invoice,
            invoice_number: invoiceNumber,
            status: 'draft',
          })
          .select()
          .single()

        if (error) throw error
        
        const currentInvoices = get().invoices
        set({ 
          invoices: [data, ...currentInvoices],
          loading: false 
        })
        
        toast.success('Invoice created successfully')
      } catch (error: any) {
        set({ error: error.message, loading: false })
        toast.error('Failed to create invoice')
        throw error
      }
    },

    updateInvoiceStatus: async (invoiceId: string, status: string) => {
      set({ loading: true, error: null })
      
      try {
        const updateData: any = {
          status,
          updated_at: new Date().toISOString(),
        }
        
        if (status === 'paid') {
          updateData.payment_date = new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('invoices')
          .update(updateData)
          .eq('id', invoiceId)
          .select()
          .single()

        if (error) throw error
        
        const currentInvoices = get().invoices
        const updatedInvoices = currentInvoices.map(invoice => 
          invoice.id === invoiceId ? data : invoice
        )
        
        set({ invoices: updatedInvoices, loading: false })
        toast.success('Invoice status updated successfully')
      } catch (error: any) {
        set({ error: error.message, loading: false })
        toast.error('Failed to update invoice status')
        throw error
      }
    },

    fetchFinancialSummary: async (period: string) => {
      set({ loading: true, error: null })
      
      try {
        const now = new Date()
        let startDate: string
        let endDate: string
        
        switch (period) {
          case 'monthly':
            startDate = format(startOfMonth(now), 'yyyy-MM-dd')
            endDate = format(endOfMonth(now), 'yyyy-MM-dd')
            break
          case 'yearly':
            startDate = format(startOfYear(now), 'yyyy-MM-dd')
            endDate = format(endOfYear(now), 'yyyy-MM-dd')
            break
          default:
            startDate = format(startOfMonth(now), 'yyyy-MM-dd')
            endDate = format(endOfMonth(now), 'yyyy-MM-dd')
        }

        // Fetch revenue and expenses
        const { data: records, error: recordsError } = await supabase
          .from('financial_records')
          .select('type, amount')
          .gte('transaction_date', startDate)
          .lte('transaction_date', endDate)

        if (recordsError) throw recordsError

        // Fetch invoice statistics
        const { data: invoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('status, total_amount')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        if (invoicesError) throw invoicesError

        // Calculate summary
        const totalRevenue = records?.filter(r => r.type === 'revenue').reduce((sum, r) => sum + r.amount, 0) || 0
        const totalExpenses = records?.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0) || 0
        const paidInvoices = invoices?.filter(i => i.status === 'paid').length || 0
        const overdueInvoices = invoices?.filter(i => i.status === 'overdue').length || 0
        const outstandingInvoices = invoices?.filter(i => ['sent', 'viewed'].includes(i.status)).length || 0

        const summary: FinancialSummary = {
          total_revenue: totalRevenue,
          total_expenses: totalExpenses,
          net_profit: totalRevenue - totalExpenses,
          outstanding_invoices: outstandingInvoices,
          paid_invoices: paidInvoices,
          overdue_invoices: overdueInvoices,
          period,
        }
        
        set({ financialSummary: summary, loading: false })
      } catch (error: any) {
        set({ error: error.message, loading: false })
        toast.error('Failed to fetch financial summary')
      }
    },

    fetchOccupancyStats: async (period: string) => {
      set({ loading: true, error: null })
      
      try {
        // Fetch total units
        const { data: properties, error: propertiesError } = await supabase
          .from('properties')
          .select('total_units, available_units')

        if (propertiesError) throw propertiesError

        const totalUnits = properties?.reduce((sum, p) => sum + (p.total_units || 0), 0) || 0
        const availableUnits = properties?.reduce((sum, p) => sum + (p.available_units || 0), 0) || 0
        const occupiedUnits = totalUnits - availableUnits

        // Fetch maintenance units (simplified - using property status)
        const { data: maintenanceProps, error: maintenanceError } = await supabase
          .from('properties')
          .select('total_units')
          .eq('status', 'maintenance')

        if (maintenanceError) throw maintenanceError

        const maintenanceUnits = maintenanceProps?.reduce((sum, p) => sum + (p.total_units || 0), 0) || 0
        const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100) : 0

        const stats: OccupancyStats = {
          total_units: totalUnits,
          occupied_units: occupiedUnits,
          available_units: availableUnits,
          maintenance_units: maintenanceUnits,
          occupancy_rate: Number(occupancyRate.toFixed(2)),
          period,
        }
        
        set({ occupancyStats: stats, loading: false })
      } catch (error: any) {
        set({ error: error.message, loading: false })
        toast.error('Failed to fetch occupancy stats')
      }
    },

    fetchCustomerStats: async (period: string) => {
      set({ loading: true, error: null })
      
      try {
        const now = new Date()
        let startDate: string
        
        switch (period) {
          case 'monthly':
            startDate = format(startOfMonth(now), 'yyyy-MM-dd')
            break
          case 'yearly':
            startDate = format(startOfYear(now), 'yyyy-MM-dd')
            break
          default:
            startDate = format(startOfMonth(now), 'yyyy-MM-dd')
        }

        // Fetch customer counts
        const { data: customers, error: customersError } = await supabase
          .from('profiles')
          .select('created_at')
          .eq('role', 'customer')

        if (customersError) throw customersError

        const totalCustomers = customers?.length || 0
        const newCustomers = customers?.filter(c => c.created_at >= startDate).length || 0

        // Fetch leads conversion
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('status')

        if (leadsError) throw leadsError

        const totalLeads = leads?.length || 0
        const convertedLeads = leads?.filter(l => l.status === 'converted').length || 0
        const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100) : 0

        // Calculate average customer value (simplified)
        const { data: invoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('customer_id, total_amount')
          .eq('status', 'paid')

        if (invoicesError) throw invoicesError

        const customerValues = new Map()
        invoices?.forEach(inv => {
          const current = customerValues.get(inv.customer_id) || 0
          customerValues.set(inv.customer_id, current + inv.total_amount)
        })

        const totalValue = Array.from(customerValues.values()).reduce((sum, val) => sum + val, 0)
        const avgCustomerValue = customerValues.size > 0 ? (totalValue / customerValues.size) : 0

        const stats: CustomerStats = {
          total_customers: totalCustomers,
          new_customers: newCustomers,
          active_customers: customerValues.size,
          lead_conversion_rate: Number(conversionRate.toFixed(2)),
          average_customer_value: Number(avgCustomerValue.toFixed(2)),
          period,
        }
        
        set({ customerStats: stats, loading: false })
      } catch (error: any) {
        set({ error: error.message, loading: false })
        toast.error('Failed to fetch customer stats')
      }
    },

    generateFinancialReport: async (reportType: string, parameters: any) => {
      set({ loading: true, error: null })
      
      try {
        // This would typically call an edge function or API to generate the PDF
        // For now, we'll return a placeholder URL
        const reportUrl = `/reports/${reportType}-${Date.now()}.pdf`
        
        // Store report record
        const { error } = await supabase
          .from('generated_reports')
          .insert({
            report_name: `${reportType} Report`,
            report_type: reportType,
            parameters,
            file_url: reportUrl,
          })

        if (error) throw error
        
        set({ loading: false })
        toast.success('Report generated successfully')
        return reportUrl
      } catch (error: any) {
        set({ error: error.message, loading: false })
        toast.error('Failed to generate report')
        throw error
      }
    },

    clearError: () => set({ error: null }),
  })
)
