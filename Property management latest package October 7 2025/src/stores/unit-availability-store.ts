import { create } from 'zustand'
import { supabase, type UnitAvailability, type PropertyUnit } from '../lib/supabase'
import toast from 'react-hot-toast'
import { format, addDays } from 'date-fns'

interface UnitAvailabilityState {
  units: PropertyUnit[]
  availability: UnitAvailability[]
  availabilityMap: Map<string, UnitAvailability[]>
  loading: boolean
  error: string | null
  
  // Actions
  fetchUnits: (propertyId?: string) => Promise<void>
  fetchUnitAvailability: (unitId: string, startDate: string, endDate: string) => Promise<void>
  fetchAllUnitsAvailability: (startDate: string, endDate: string) => Promise<void>
  updateUnitStatus: (unitId: string, date: string, status: string, notes?: string) => Promise<void>
  bulkUpdateUnitStatus: (unitIds: string[], dates: string[], status: string, notes?: string) => Promise<void>
  getAvailableUnitsCount: (date: string) => number
  getUnitStatusColor: (status: string) => string
  clearError: () => void
}

const STATUS_COLORS = {
  available: '#10B981',    // Green
  booked: '#EF4444',       // Red
  maintenance: '#F59E0B',  // Yellow
  out_of_service: '#6B7280', // Gray
  reserved: '#F97316',     // Orange
}

export const useUnitAvailabilityStore = create<UnitAvailabilityState>()(
  (set, get) => ({
    units: [],
    availability: [],
    availabilityMap: new Map(),
    loading: false,
    error: null,

    fetchUnits: async (propertyId?: string) => {
      set({ loading: true, error: null })
      
      try {
        let query = supabase
          .from('property_units')
          .select('*, property:properties(title, project)')
          .order('unit_number', { ascending: true })

        if (propertyId) {
          query = query.eq('property_id', propertyId)
        }

        const { data, error } = await query

        if (error) throw error
        
        set({ units: data || [], loading: false })
      } catch (error: any) {
        set({ error: error.message, loading: false })
        toast.error('Failed to fetch units')
      }
    },

    fetchUnitAvailability: async (unitId: string, startDate: string, endDate: string) => {
      set({ loading: true, error: null })
      
      try {
        const { data, error } = await supabase
          .from('unit_availability')
          .select('*')
          .eq('unit_id', unitId)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true })

        if (error) throw error
        
        const currentMap = get().availabilityMap
        currentMap.set(unitId, data || [])
        
        set({ 
          availability: data || [], 
          availabilityMap: new Map(currentMap),
          loading: false 
        })
      } catch (error: any) {
        set({ error: error.message, loading: false })
        toast.error('Failed to fetch unit availability')
      }
    },

    fetchAllUnitsAvailability: async (startDate: string, endDate: string) => {
      set({ loading: true, error: null })
      
      try {
        const { data, error } = await supabase
          .from('unit_availability')
          .select('*, unit:property_units(unit_number, property:properties(title))')
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true })

        if (error) throw error
        
        // Group by unit_id
        const availabilityMap = new Map()
        data?.forEach(record => {
          const unitId = record.unit_id
          if (!availabilityMap.has(unitId)) {
            availabilityMap.set(unitId, [])
          }
          availabilityMap.get(unitId).push(record)
        })
        
        set({ 
          availability: data || [], 
          availabilityMap,
          loading: false 
        })
      } catch (error: any) {
        set({ error: error.message, loading: false })
        toast.error('Failed to fetch units availability')
      }
    },

    updateUnitStatus: async (unitId: string, date: string, status: string, notes?: string) => {
      set({ loading: true, error: null })
      
      try {
        const { data, error } = await supabase
          .from('unit_availability')
          .upsert({
            unit_id: unitId,
            date,
            status,
            notes,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error
        
        // Update local state
        const currentMap = get().availabilityMap
        const unitAvailability = currentMap.get(unitId) || []
        const existingIndex = unitAvailability.findIndex(a => a.date === date)
        
        if (existingIndex >= 0) {
          unitAvailability[existingIndex] = data
        } else {
          unitAvailability.push(data)
          unitAvailability.sort((a, b) => a.date.localeCompare(b.date))
        }
        
        currentMap.set(unitId, unitAvailability)
        
        const currentAvailability = get().availability
        const allAvailabilityIndex = currentAvailability.findIndex(a => a.unit_id === unitId && a.date === date)
        
        let updatedAvailability
        if (allAvailabilityIndex >= 0) {
          updatedAvailability = [...currentAvailability]
          updatedAvailability[allAvailabilityIndex] = data
        } else {
          updatedAvailability = [...currentAvailability, data]
        }
        
        set({ 
          availability: updatedAvailability,
          availabilityMap: new Map(currentMap),
          loading: false 
        })
        
        toast.success('Unit status updated successfully')
      } catch (error: any) {
        set({ error: error.message, loading: false })
        toast.error('Failed to update unit status')
        throw error
      }
    },

    bulkUpdateUnitStatus: async (unitIds: string[], dates: string[], status: string, notes?: string) => {
      set({ loading: true, error: null })
      
      try {
        const updates = []
        for (const unitId of unitIds) {
          for (const date of dates) {
            updates.push({
              unit_id: unitId,
              date,
              status,
              notes,
              updated_at: new Date().toISOString(),
            })
          }
        }
        
        const { data, error } = await supabase
          .from('unit_availability')
          .upsert(updates)
          .select()

        if (error) throw error
        
        // Update local state
        const currentMap = get().availabilityMap
        const currentAvailability = [...get().availability]
        
        data?.forEach(record => {
          const unitId = record.unit_id
          const unitAvailability = currentMap.get(unitId) || []
          const existingIndex = unitAvailability.findIndex(a => a.date === record.date)
          
          if (existingIndex >= 0) {
            unitAvailability[existingIndex] = record
          } else {
            unitAvailability.push(record)
            unitAvailability.sort((a, b) => a.date.localeCompare(b.date))
          }
          
          currentMap.set(unitId, unitAvailability)
          
          // Update all availability array
          const allIndex = currentAvailability.findIndex(a => a.unit_id === unitId && a.date === record.date)
          if (allIndex >= 0) {
            currentAvailability[allIndex] = record
          } else {
            currentAvailability.push(record)
          }
        })
        
        set({ 
          availability: currentAvailability,
          availabilityMap: new Map(currentMap),
          loading: false 
        })
        
        toast.success(`Updated status for ${unitIds.length} units across ${dates.length} dates`)
      } catch (error: any) {
        set({ error: error.message, loading: false })
        toast.error('Failed to bulk update unit status')
        throw error
      }
    },

    getAvailableUnitsCount: (date: string) => {
      const availability = get().availability
      const availableCount = availability.filter(a => 
        a.date === date && a.status === 'available'
      ).length
      
      const totalUnitsWithAvailability = new Set(
        availability.filter(a => a.date === date).map(a => a.unit_id)
      ).size
      
      const totalUnits = get().units.length
      const unitsWithoutStatus = totalUnits - totalUnitsWithAvailability
      
      // Assume units without status are available
      return availableCount + unitsWithoutStatus
    },

    getUnitStatusColor: (status: string) => {
      return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.available
    },

    clearError: () => set({ error: null }),
  })
)
