import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const branchTableSource = readFileSync(new URL('../src/components/BranchTable.tsx', import.meta.url), 'utf8')
const dashboardSource = readFileSync(new URL('../src/components/Dashboard.tsx', import.meta.url), 'utf8')
const linkGeneratorSource = readFileSync(new URL('../src/components/LinkGenerator.tsx', import.meta.url), 'utf8')
const nameBuilderSource = readFileSync(new URL('../src/components/NameBuilder.tsx', import.meta.url), 'utf8')

test('copy buttons use the shared clipboard helper', () => {
  assert.match(nameBuilderSource, /copyText\(preview\)/)
  assert.match(linkGeneratorSource, /copyText\(link\.value\)/)
  assert.doesNotMatch(nameBuilderSource, /navigator\.clipboard\.writeText\(preview\)/)
  assert.doesNotMatch(linkGeneratorSource, /navigator\.clipboard\.writeText\(link\.value\)/)
})

test('saved branch table exposes import and open merge actions', () => {
  assert.match(branchTableSource, /onImportAndOpen: \(record: BranchRecord, target: 'beta' \| 'prod'\) => void/)
  assert.match(branchTableSource, /Tooltip title="导入并打开测试合并"/)
  assert.match(branchTableSource, /Tooltip title="导入并打开生产合并"/)
  assert.match(branchTableSource, /onImportAndOpen\(record, 'beta'\)/)
  assert.match(branchTableSource, /onImportAndOpen\(record, 'prod'\)/)
})

test('branch name builder supports save and create branch action', () => {
  assert.match(nameBuilderSource, /openCreateLink\?: boolean/)
  assert.match(nameBuilderSource, /saveBranch\(\{ openCreateLink: true \}\)/)
  assert.match(nameBuilderSource, />保存并创建</)
})

test('dashboard opens generated branch and merge links from shared link builder', () => {
  assert.match(dashboardSource, /import \{ buildGitLabLinks \} from '@\/utils\/gitlab-links'/)
  assert.match(dashboardSource, /const openGeneratedLink = /)
  assert.match(dashboardSource, /openGeneratedLink\(payload\.branch, payload\.storeName, 'branch'\)/)
  assert.match(dashboardSource, /openGeneratedLink\(record\.branch, record\.storeName, target\)/)
})
