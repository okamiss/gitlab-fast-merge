const assert = require('node:assert/strict')
const test = require('node:test')

const { BranchesService } = require('../dist/branches/branches.service')
const { SettingsService } = require('../dist/settings/settings.service')

const customRepositories = [
  { id: '101', value: 'custom-admin', label: '自定义后台' },
  { id: '102', value: 'custom-web', label: '自定义前台' }
]

test('settings stores and returns editable repository options', async () => {
  const prisma = {
    userSettings: {
      upsert: async ({ create, update }) => {
        assert.deepEqual(create.repositories, customRepositories)
        assert.deepEqual(update.repositories, customRepositories)
        return { userId: create.userId, ...create }
      }
    }
  }
  const service = new SettingsService(prisma)

  const settings = await service.update('user-1', { repositories: customRepositories })

  assert.deepEqual(settings.repositories, customRepositories)
})

test('branch creation accepts repositories from user settings', async () => {
  let settingsRead = false
  const prisma = {
    userSettings: {
      upsert: async () => {
        settingsRead = true
        return { repositories: customRepositories }
      }
    },
    branchRecord: {
      create: async ({ data }) => ({ id: 'branch-1', ...data })
    }
  }
  const service = new BranchesService(prisma)

  const branch = await service.create('user-1', {
    branch: 'hyl/20260605',
    storeName: 'custom-admin',
    description: '',
    progress: 1
  })

  assert.equal(branch.storeName, 'custom-admin')
  assert.equal(settingsRead, true)
})
