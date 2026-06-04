export interface AuthUser {
  id: string
  username: string
}

export interface AuthResponse {
  accessToken: string
  user: AuthUser
}

export interface BranchRecord {
  id: string
  branch: string
  storeName: string
  description: string
  progress: number
  createdAt: string
  updatedAt: string
}

export interface PaginatedBranchRecords {
  data: BranchRecord[]
  meta: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface UserSettings {
  defaultPrefix: string
  domainUrl: string
  groupName: string
  darkTheme: boolean
}

export interface LegacyBranchRecord {
  branch: string
  storeName: string
  description?: string
  progress?: number
  create_time?: number
}

export interface GeneratedLink {
  label: string
  value: string
  kind: 'branch' | 'tag' | 'beta' | 'prod'
}
