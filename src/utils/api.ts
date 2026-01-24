import { useAuthStore } from '@/stores/auth'

export async function authFetch(url: string, options: RequestInit = {}) {
  const authStore = useAuthStore()

  const headers = new Headers(options.headers)
  if (authStore.token) {
    headers.set('Authorization', `Bearer ${authStore.token}`)
  }

  const res = await fetch(url, {
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
