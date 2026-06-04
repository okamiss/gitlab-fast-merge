import { useCallback, useEffect, useState } from 'react'
import { BulbOutlined, DatabaseOutlined, RocketOutlined } from '@ant-design/icons'
import { Col, ConfigProvider, message, Row, Skeleton, theme, Typography } from 'antd'
import { AppHeader } from '@/components/AppHeader'
import { BranchTable } from '@/components/BranchTable'
import { LinkGenerator } from '@/components/LinkGenerator'
import { NameBuilder } from '@/components/NameBuilder'
import { SettingsPanel } from '@/components/SettingsPanel'
import { StatisticsPanel } from '@/components/StatisticsPanel'
import { storeOptions } from '@/constants/options'
import { useAuth } from '@/hooks/useAuth'
import { branchApi, settingsApi } from '@/services/api'
import type { BranchRecord, GeneratedLink, LegacyBranchRecord, UserSettings } from '@/types'
import { buildGitLabLinks } from '@/utils/gitlab-links'

const emptySettings: UserSettings = {
  defaultPrefix: '',
  domainUrl: '',
  groupName: '',
  darkTheme: false
}

function readLegacyRecords(): LegacyBranchRecord[] {
  try {
    const raw = localStorage.getItem('table')
    return raw ? (JSON.parse(raw) as LegacyBranchRecord[]) : []
  } catch {
    return []
  }
}

export function Dashboard() {
  const { user } = useAuth()
  const [messageApi, contextHolder] = message.useMessage()
  const [records, setRecords] = useState<BranchRecord[]>([])
  const [settings, setSettings] = useState<UserSettings>(emptySettings)
  const [branch, setBranch] = useState('')
  const [storeName, setStoreName] = useState(storeOptions[0].value)
  const [loading, setLoading] = useState(true)
  const [branchesLoading, setBranchesLoading] = useState(false)
  const [recordsPage, setRecordsPage] = useState(1)
  const [recordsTotal, setRecordsTotal] = useState(0)
  const [recordsPageSize, setRecordsPageSize] = useState(10)
  const [savingSettings, setSavingSettings] = useState(false)

  const loadBranches = useCallback(async (page = 1, pageSize = 10) => {
    const nextRecords = await branchApi.list(page, pageSize)
    setRecords(nextRecords.data)
    setRecordsPage(nextRecords.meta.page)
    setRecordsTotal(nextRecords.meta.total)
    setRecordsPageSize(nextRecords.meta.pageSize)
  }, [])

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const [nextRecords, nextSettings] = await Promise.all([branchApi.list(1), settingsApi.get()])
      setRecords(nextRecords.data)
      setRecordsPage(nextRecords.meta.page)
      setRecordsTotal(nextRecords.meta.total)
      setRecordsPageSize(nextRecords.meta.pageSize)
      setSettings(nextSettings)
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '加载工作台失败')
    } finally {
      setLoading(false)
    }
  }, [messageApi])

  const migrateLegacyData = useCallback(async () => {
    if (!user || localStorage.getItem(`legacy-imported:${user.id}`)) return
    const legacyRecords = readLegacyRecords()
    const legacySettings: Partial<UserSettings> = {
      defaultPrefix: localStorage.getItem('defaultprefix') ?? '',
      domainUrl: localStorage.getItem('domainUrl') ?? '',
      groupName: localStorage.getItem('groupName') ?? '',
      darkTheme: localStorage.getItem('theme-dark') === 'true'
    }
    const hasSettings = Object.values(legacySettings).some(Boolean)
    if (legacyRecords.length || hasSettings) {
      await Promise.all([
        legacyRecords.length ? branchApi.importLegacy(legacyRecords) : Promise.resolve(),
        hasSettings ? settingsApi.update(legacySettings) : Promise.resolve()
      ])
      ;['table', 'defaultprefix', 'domainUrl', 'groupName', 'theme-dark'].forEach((key) =>
        localStorage.removeItem(key)
      )
      messageApi.success('已将旧版浏览器数据迁移到当前账号')
    }
    localStorage.setItem(`legacy-imported:${user.id}`, 'true')
  }, [messageApi, user])

  useEffect(() => {
    migrateLegacyData()
      .catch((error) => messageApi.warning(error instanceof Error ? error.message : '旧版数据迁移失败'))
      .finally(loadDashboard)
  }, [loadDashboard, messageApi, migrateLegacyData])

  const openGeneratedLink = (nextBranch: string, nextStoreName: string, kind: GeneratedLink['kind']) => {
    const link = buildGitLabLinks(nextBranch, nextStoreName, settings).find((item) => item.kind === kind)
    if (!link?.value) {
      messageApi.warning('请先完善 GitLab 域名、项目组和 Branch')
      return
    }
    window.open(link.value, '_blank', 'noopener,noreferrer')
  }

  const saveBranch = async (
    payload: { branch: string; storeName: string; description: string },
    options?: { openCreateLink?: boolean }
  ) => {
    try {
      await branchApi.create(payload)
      await loadBranches(1, recordsPageSize)
      setBranch(payload.branch)
      setStoreName(payload.storeName)
      messageApi.success('Branch 已保存')
      if (options?.openCreateLink) {
        openGeneratedLink(payload.branch, payload.storeName, 'branch')
      }
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '保存失败')
    }
  }

  const updateBranch = async (id: string, payload: { description: string; progress: number }) => {
    const updated = await branchApi.update(id, payload)
    setRecords((current) => current.map((record) => (record.id === id ? updated : record)))
    messageApi.success('记录已更新')
  }

  const deleteBranch = async (id: string) => {
    await branchApi.remove(id)
    await loadBranches(records.length === 1 && recordsPage > 1 ? recordsPage - 1 : recordsPage, recordsPageSize)
    messageApi.success('记录已删除')
  }

  const saveSettings = async (values: UserSettings) => {
    setSavingSettings(true)
    try {
      const updated = await settingsApi.update(values)
      setSettings(updated)
      messageApi.success('设置已保存')
    } finally {
      setSavingSettings(false)
    }
  }

  const changeTheme = async (darkTheme: boolean) => {
    setSettings((current) => ({ ...current, darkTheme }))
    try {
      setSettings(await settingsApi.update({ darkTheme }))
    } catch {
      messageApi.warning('主题偏好暂未保存')
    }
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: settings.darkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { colorPrimary: '#16a34a', borderRadius: 10 }
      }}
    >
      <div className={settings.darkTheme ? 'app-shell dark-shell' : 'app-shell'}>
        {contextHolder}
        <a className="skip-link" href="#workspace">跳到主要内容</a>
        <AppHeader darkTheme={settings.darkTheme} onThemeChange={changeTheme} />
        <main id="workspace" className="workspace">
          <section className="hero-panel">
            <div>
              <Typography.Text className="eyebrow">DEVELOPER WORKSPACE</Typography.Text>
              <Typography.Title>让每次分支发布更快、更清楚。</Typography.Title>
              <Typography.Paragraph>
                统一生成 Branch、Tag 与 Merge Request 链接，把需求进度留在一个可靠的工作台里。
              </Typography.Paragraph>
            </div>
            <div className="hero-metrics">
              <div><DatabaseOutlined /><strong>{recordsTotal}</strong><span>已保存 Branch</span></div>
              <div><RocketOutlined /><strong>4</strong><span>快捷发布入口</span></div>
              <div><BulbOutlined /><strong>1</strong><span>集中式工作台</span></div>
            </div>
          </section>
          {loading ? (
            <Skeleton active paragraph={{ rows: 12 }} />
          ) : (
            <>
              <Row gutter={[20, 20]}>
                <Col xs={24} xl={14}>
                  <div className="stack">
                    <NameBuilder
                      type="branch"
                      defaultPrefix={settings.defaultPrefix}
                      onPreviewChange={setBranch}
                      onSaveBranch={saveBranch}
                    />
                    <NameBuilder type="tag" />
                  </div>
                </Col>
                <Col xs={24} xl={10}>
                  <LinkGenerator
                    branch={branch}
                    storeName={storeName}
                    settings={settings}
                    onBranchChange={setBranch}
                    onStoreChange={setStoreName}
                  />
                </Col>
              </Row>
              <BranchTable
                records={records}
                loading={branchesLoading}
                page={recordsPage}
                pageSize={recordsPageSize}
                total={recordsTotal}
                onImport={(record) => {
                  setBranch(record.branch)
                  setStoreName(record.storeName)
                }}
                onImportAndOpen={(record, target) => {
                  setBranch(record.branch)
                  setStoreName(record.storeName)
                  openGeneratedLink(record.branch, record.storeName, target)
                }}
                onDelete={deleteBranch}
                onPageChange={(page, pageSize) => {
                  setBranchesLoading(true)
                  loadBranches(page, pageSize)
                    .catch((error) =>
                      messageApi.error(error instanceof Error ? error.message : '加载 Branch 记录失败')
                    )
                    .finally(() => setBranchesLoading(false))
                }}
                onUpdate={updateBranch}
              />
              <Row gutter={[20, 20]}>
                <Col xs={24} xl={14}><StatisticsPanel records={records} /></Col>
                <Col xs={24} xl={10}>
                  <SettingsPanel settings={settings} saving={savingSettings} onSave={saveSettings} />
                </Col>
              </Row>
            </>
          )}
        </main>
      </div>
    </ConfigProvider>
  )
}
