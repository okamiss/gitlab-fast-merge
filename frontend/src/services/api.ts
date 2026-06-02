import type {
  AuthResponse,
  AuthUser,
  BranchRecord,
  LegacyBranchRecord,
  UserSettings
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'
const TOKEN_KEY = 'gitlab-fast-merge.token'

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY)
}

interface ApiErrorBody {
  message?: string | string[]
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get()
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  if (!response.ok) {
    if (response.status === 401) {
      tokenStorage.clear()
    }
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody
    const message = Array.isArray(body.message) ? body.message.join('；') : body.message
    throw new Error(message || '请求失败，请稍后重试')
  }
  return response.json() as Promise<T>
}

export const authApi = {
  register: (username: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),
  login: (username: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),
  me: () => request<AuthUser>('/auth/me')
}

export const branchApi = {
  list: () => request<BranchRecord[]>('/branches'),
  create: (payload: Pick<BranchRecord, 'branch' | 'storeName' | 'description'>) =>
    request<BranchRecord>('/branches', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<Pick<BranchRecord, 'description' | 'progress'>>) =>
    request<BranchRecord>(`/branches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  remove: (id: string) => request<{ deleted: boolean }>(`/branches/${id}`, { method: 'DELETE' }),
  importLegacy: (records: LegacyBranchRecord[]) =>
    request<BranchRecord[]>('/branches/import', {
      method: 'POST',
      body: JSON.stringify({
        records: records.map((record) => ({
          branch: record.branch,
          storeName: record.storeName,
          description: record.description,
          progress: record.progress,
          createTime: record.create_time
        }))
      })
    })
}

export const settingsApi = {
  get: () => request<UserSettings>('/settings'),
  update: (payload: Partial<UserSettings>) =>
    request<UserSettings>('/settings', { method: 'PUT', body: JSON.stringify(payload) })
}
