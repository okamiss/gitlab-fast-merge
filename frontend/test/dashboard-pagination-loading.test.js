import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../src/components/Dashboard.tsx', import.meta.url), 'utf8')
const tableSource = readFileSync(new URL('../src/components/BranchTable.tsx', import.meta.url), 'utf8')

test('branch pagination uses table loading instead of dashboard loading', () => {
  assert.match(source, /const \[branchesLoading, setBranchesLoading\] = useState\(false\)/)
  assert.match(source, /onPageChange=\{\(page, pageSize\) => \{[\s\S]*setBranchesLoading\(true\)/)
  assert.doesNotMatch(source, /onPageChange=\{\(page, pageSize\) => \{[\s\S]*setLoading\(true\)/)
})

test('branch pagination forwards selected page size', () => {
  assert.match(source, /const \[recordsPageSize, setRecordsPageSize\] = useState\(10\)/)
  assert.match(source, /branchApi\.list\(page, pageSize\)/)
  assert.match(source, /onPageChange=\{\(page, pageSize\) => \{/)
  assert.match(source, /loadBranches\(page, pageSize\)/)
})

test('branch page size changes do not recreate dashboard initial load callback', () => {
  assert.doesNotMatch(source, /loadDashboard = useCallback\([\s\S]*\}, \[messageApi, recordsPageSize\]\)/)
})

test('branch table exposes page size selector', () => {
  assert.match(tableSource, /showSizeChanger: true/)
  assert.match(tableSource, /pageSizeOptions: \[10, 20, 50, 100\]/)
  assert.match(tableSource, /hideOnSinglePage: false/)
})
