import api from './index'
import { Lead } from '../store/leadStore'

export const leadApi = {
  getAll: async (filters?: any): Promise<Lead[]> => {
    const response = await api.get('/leads', { params: filters })
    return response.data.leads
  },

  getById: async (id: string): Promise<Lead> => {
    const response = await api.get(`/leads/${id}`)
    return response.data.lead
  },

  create: async (data: Partial<Lead>): Promise<Lead> => {
    const response = await api.post('/leads', data)
    return response.data.lead
  },

  update: async (id: string, data: Partial<Lead>): Promise<Lead> => {
    const response = await api.put(`/leads/${id}`, data)
    return response.data.lead
  },

  updateStatus: async (id: string, status: Lead['status']): Promise<Lead> => {
    const response = await api.patch(`/leads/${id}/status`, { status })
    return response.data.lead
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/leads/${id}`)
  },

  addNote: async (id: string, content: string): Promise<Lead> => {
    const response = await api.post(`/leads/${id}/notes`, { content })
    return response.data.lead
  },

  addActivity: async (id: string, activity: Partial<Lead['activities'][0]>): Promise<Lead> => {
    const response = await api.post(`/leads/${id}/activities`, activity)
    return response.data.lead
  },

  getAiInsights: async (id: string): Promise<Lead['aiInsights']> => {
    const response = await api.get(`/leads/${id}/ai-insights`)
    return response.data.insights
  },

  bulkUpdate: async (leadIds: string[], updates: Partial<Lead>): Promise<Lead[]> => {
    const response = await api.patch('/leads/bulk-update', { leadIds, updates })
    return response.data.leads
  },

  sendBulkRecommendations: async (data: {
    leadIds: string[]
    propertyIds: string[]
    messageTemplate: string
    personalizations?: Record<string, any>
  }): Promise<{ sent: number; failed: number; details: any[] }> => {
    const response = await api.post('/leads/bulk-recommendations', data)
    return response.data
  },

  getRecommendations: async (id: string): Promise<{
    properties: any[]
    reasoning: string
    confidence: number
  }> => {
    const response = await api.get(`/leads/${id}/recommendations`)
    return response.data
  },
}