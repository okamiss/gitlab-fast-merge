export interface RepositoryOption {
  id: string
  value: string
  label: string
}

export const defaultRepositories: RepositoryOption[] = [
  { id: '4', value: 'admin-crm', label: 'CRM 系统' },
  { id: '10', value: 'admin-scrm', label: 'SCRM 系统' },
  { id: '16', value: 'web-wwside', label: '企微侧边栏' },
  { id: '27', value: 'admin-promotion', label: '推广系统' },
  { id: '11', value: 'admin-videolive', label: '视频直播后台' },
  { id: '26', value: 'admin-app', label: 'APP 管理后台' },
  { id: '7', value: 'web-official', label: '官网' },
  { id: '13', value: 'admin-cms', label: 'CMS 系统' },
  { id: '69', value: 'web-course', label: 'PC 课程' },
  { id: '14', value: 'admin-sso', label: 'SSO 登录系统' }
]

export function normalizeRepositories(value: unknown): RepositoryOption[] {
  if (!Array.isArray(value)) return defaultRepositories

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const repository = item as Partial<RepositoryOption>
      return {
        id: String(repository.id ?? '').trim(),
        value: String(repository.value ?? '').trim(),
        label: String(repository.label ?? '').trim()
      }
    })
    .filter((item): item is RepositoryOption => Boolean(item?.id && item.value && item.label))
}
