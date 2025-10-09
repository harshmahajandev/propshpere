import api from './index'
import { Property } from '../store/propertyStore'

export const propertyApi = {
  getAll: async (filters?: any): Promise<Property[]> => {
    const response = await api.get('/properties', { params: filters })
    return response.data.properties
  },

  getById: async (id: string): Promise<Property> => {
    const response = await api.get(`/properties/${id}`)
    return response.data.property
  },

  create: async (data: Partial<Property>): Promise<Property> => {
    const response = await api.post('/properties', data)
    return response.data.property
  },

  update: async (id: string, data: Partial<Property>): Promise<Property> => {
    const response = await api.put(`/properties/${id}`, data)
    return response.data.property
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/properties/${id}`)
  },

  uploadImages: async (id: string, files: FileList): Promise<string[]> => {
    const formData = new FormData()
    Array.from(files).forEach(file => {
      formData.append('images', file)
    })
    const response = await api.post(`/properties/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data.images
  },

  getMatchingLeads: async (id: string): Promise<any[]> => {
    const response = await api.get(`/properties/${id}/matching-leads`)
    return response.data.leads
  },

  updateInterestScore: async (id: string): Promise<number> => {
    const response = await api.post(`/properties/${id}/update-score`)
    return response.data.score
  },
}