import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const dashboardSource = readFileSync(new URL('../src/components/Dashboard.tsx', import.meta.url), 'utf8')
const settingsSource = readFileSync(new URL('../src/components/SettingsPanel.tsx', import.meta.url), 'utf8')
const nameBuilderSource = readFileSync(new URL('../src/components/NameBuilder.tsx', import.meta.url), 'utf8')
const linkGeneratorSource = readFileSync(new URL('../src/components/LinkGenerator.tsx', import.meta.url), 'utf8')
const branchTableSource = readFileSync(new URL('../src/components/BranchTable.tsx', import.meta.url), 'utf8')
const gitlabLinksSource = readFileSync(new URL('../src/utils/gitlab-links.ts', import.meta.url), 'utf8')
const typesSource = readFileSync(new URL('../src/types/index.ts', import.meta.url), 'utf8')

test('user settings include editable repositories', () => {
  assert.match(typesSource, /export interface RepositoryOption/)
  assert.match(typesSource, /repositories: RepositoryOption\[\]/)
  assert.match(settingsSource, /Form\.List name="repositories"/)
  assert.match(settingsSource, /name=\{\[name, 'id'\]\}/)
  assert.match(settingsSource, /name=\{\[name, 'value'\]\}/)
  assert.match(settingsSource, /name=\{\[name, 'label'\]\}/)
  assert.match(settingsSource, /add\(\{ id: '', value: '', label: '' \}\)/)
  assert.match(settingsSource, /remove\(name\)/)
})

test('repository options flow from settings into branch UI and links', () => {
  assert.match(dashboardSource, /const repositories = settings\.repositories/)
  assert.match(dashboardSource, /repositories=\{repositories\}/)
  assert.match(nameBuilderSource, /repositories: RepositoryOption\[\]/)
  assert.match(linkGeneratorSource, /repositories: RepositoryOption\[\]/)
  assert.match(branchTableSource, /repositories: RepositoryOption\[\]/)
  assert.match(gitlabLinksSource, /repositories: RepositoryOption\[\]/)
  assert.match(gitlabLinksSource, /repositories\.find\(\(item\) => item\.value === storeName\)/)
  assert.doesNotMatch(nameBuilderSource, /import \{ storeOptions \}/)
  assert.doesNotMatch(linkGeneratorSource, /import \{ storeOptions \}/)
  assert.doesNotMatch(branchTableSource, /import \{ progressOptions, storeOptions \}/)
})
