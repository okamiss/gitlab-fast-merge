import type { GeneratedLink, RepositoryOption, UserSettings } from '@/types'

function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, '')
}

export function buildGitLabLinks(
  branch: string,
  storeName: string,
  settings: UserSettings,
  repositories: RepositoryOption[]
): GeneratedLink[] {
  const store = repositories.find((item) => item.value === storeName)
  const domain = settings.domainUrl.replace(/\/+$/, '')
  const group = trimSlashes(settings.groupName)
  if (!domain || !group || !store) return []

  const projectUrl = `${domain}/${group}/${store.value}`
  const betaParams = new URLSearchParams({
    'merge_request[source_project_id]': store.id,
    'merge_request[source_branch]': branch,
    'merge_request[target_project_id]': store.id,
    'merge_request[target_branch]': 'beta'
  })
  const prodParams = new URLSearchParams({ 'merge_request[source_branch]': branch })

  return [
    { kind: 'branch', label: '创建 Branch', value: `${projectUrl}/-/branches/new` },
    { kind: 'tag', label: '创建 Tag', value: `${projectUrl}/-/tags/new` },
    { kind: 'beta', label: '合并至测试环境', value: branch ? `${projectUrl}/-/merge_requests/new?${betaParams}` : '' },
    { kind: 'prod', label: '合并至生产环境', value: branch ? `${projectUrl}/-/merge_requests/new?${prodParams}` : '' }
  ]
}
