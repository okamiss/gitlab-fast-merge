const assert = require('node:assert/strict')
const test = require('node:test')

const { normalizeBranchPage } = require('../dist/branches/pagination')

test('normalizes missing page to the first 10-row page', () => {
  assert.deepEqual(normalizeBranchPage(undefined), {
    page: 1,
    pageSize: 10,
    skip: 0
  })
})

test('normalizes requested page to a 10-row offset', () => {
  assert.deepEqual(normalizeBranchPage(3), {
    page: 3,
    pageSize: 10,
    skip: 20
  })
})

test('normalizes requested page size to the requested offset', () => {
  assert.deepEqual(normalizeBranchPage(3, 20), {
    page: 3,
    pageSize: 20,
    skip: 40
  })
})

test('normalizes numeric query strings from HTTP query params', () => {
  assert.deepEqual(normalizeBranchPage('2', '20'), {
    page: 2,
    pageSize: 20,
    skip: 20
  })
})

test('falls back to first page for invalid page numbers', () => {
  assert.deepEqual(normalizeBranchPage(0), {
    page: 1,
    pageSize: 10,
    skip: 0
  })
})
