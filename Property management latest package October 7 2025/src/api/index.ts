import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    // Skip API calls in demo mode
    if (token.startsWith('demo-token-')) {
      // For demo mode, simulate successful responses for auth endpoints
      if (config.url?.includes('/auth/')) {
        return Promise.reject(new Error('Demo mode - auth endpoints disabled'))
      }
    }
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect to login in demo mode
    const token = localStorage.getItem('token')
    if (error.response?.status === 401 && !token?.startsWith('demo-token-')) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api