const assert = require('node:assert/strict')
const test = require('node:test')

const { BranchesService } = require('../dist/branches/branches.service')

test('branch trend counts all branch dates for the selected user and year', async () => {
  const prisma = {
    branchRecord: {
      findMany: async ({ where, select, orderBy }) => {
        assert.deepEqual(where, { userId: 'user-1' })
        assert.deepEqual(select, { createdAt: true })
        assert.deepEqual(orderBy, { createdAt: 'desc' })
        return [
          { createdAt: new Date('2026-06-01T00:00:00.000Z') },
          { createdAt: new Date('2026-06-15T00:00:00.000Z') },
          { createdAt: new Date('2026-01-01T00:00:00.000Z') },
          { createdAt: new Date('2025-12-31T00:00:00.000Z') }
        ]
      }
    }
  }
  const service = new BranchesService(prisma)

  const trend = await service.trend('user-1', 2026)

  assert.deepEqual(trend.years, [2026, 2025])
  assert.equal(trend.selectedYear, 2026)
  assert.equal(trend.months.length, 12)
  assert.deepEqual(
    trend.months.filter((item) => item.count > 0),
    [
      { month: 1, count: 1 },
      { month: 6, count: 2 }
    ]
  )
})

test('branch trend falls back to the newest recorded year', async () => {
  const prisma = {
    branchRecord: {
      findMany: async () => [
        { createdAt: new Date('2025-05-01T00:00:00.000Z') },
        { createdAt: new Date('2024-01-01T00:00:00.000Z') }
      ]
    }
  }
  const service = new BranchesService(prisma)

  const trend = await service.trend('user-1', 2030)

  assert.equal(trend.selectedYear, 2025)
  assert.equal(trend.months[4].count, 1)
})
