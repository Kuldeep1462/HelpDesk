const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function logout() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export async function fetchCurrentUser(api) {
  try {
    const { data } = await api.get('/users/api/me/')
    return data
  } catch {
    return null
  }
}


