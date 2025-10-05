import axios from 'axios'
import { getAccessToken, logout } from './auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'https://helpdesk-1afn.onrender.com',
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api


