import { useAuthStore } from '@/stores/auth'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export async function apiFetch(url: string, options: RequestInit = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
  return fetch(fullUrl, options)
}

export async function authFetch(url: string, options: RequestInit = {}) {
  const authStore = useAuthStore()

  const headers = new Headers(options.headers)
  if (authStore.token) {
    headers.set('Authorization', `Bearer ${authStore.token}`)
  }

  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
  const res = await fetch(fullUrl, {
    ...options,
    headers
  })

  // Token expired check
  if (res.status === 401) {
    authStore.logout()
    window.location.href = '/login'
  }

  return res
}
