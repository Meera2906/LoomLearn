import axios from 'axios'

let backendOfflineUntil = 0

// Support custom API URL via VITE_API_URL environment variable for production (e.g., Render)
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const baseURL = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase

const api = axios.create({
  baseURL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
})

api.interceptors.request.use((config) => {
  // If backend recently failed with network error, fail fast briefly
  if (Date.now() < backendOfflineUntil) {
    return Promise.reject(new Error('Backend temporarily offline (reconnecting...)'))
  }
  const token = localStorage.getItem('loom_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    backendOfflineUntil = 0
    return response
  },
  (error) => {
    // If backend connection timed out, refused, or had a network failure
    if (!error.response || error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
      backendOfflineUntil = Date.now() + 4000 // fast fail for 4s
    }
    // Only redirect if unauthorized and not already on auth pages
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('loom_token')
      localStorage.removeItem('loom_user')
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
