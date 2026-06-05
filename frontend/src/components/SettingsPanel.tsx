import { useEffect, useRef, useState } from 'react'
import { DeleteOutlined, PlusOutlined, QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Space, Switch, Tour, Typography } from 'antd'
import type { TourProps } from 'antd'
import type { UserSettings } from '@/types'

interface SettingsPanelProps {
  settings: UserSettings
  saving: boolean
  onSave: (values: UserSettings) => Promise<void>
}

const SETTINGS_TOUR_KEY = 'gitlab-fast-merge.settings-tour-seen'

function trimSlashes(value: string) {
  return value.trim().replace(/^\/+|\/+$/g, '')
}

export function SettingsPanel({ settings, saving, onSave }: SettingsPanelProps) {
  const [form] = Form.useForm<UserSettings>()
  const [tourOpen, setTourOpen] = useState(false)
  const prefixRef = useRef<HTMLDivElement>(null)
  const domainRef = useRef<HTMLDivElement>(null)
  const groupRef = useRef<HTMLDivElement>(null)
  const repositoriesRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const defaultPrefix = Form.useWatch('defaultPrefix', form) ?? settings.defaultPrefix
  const domainUrl = Form.useWatch('domainUrl', form) ?? settings.domainUrl
  const groupName = Form.useWatch('groupName', form) ?? settings.groupName
  const repositories = Form.useWatch('repositories', form) ?? settings.repositories
  const previewDomain = domainUrl.trim().replace(/\/+$/, '') || 'https://git.example.com'
  const previewGroup = trimSlashes(groupName) || 'frontend'
  const previewRepository = repositories[0]?.value || 'admin-crm'
  const previewBranch = `${trimSlashes(defaultPrefix) || 'hyl'}/20260605`
  const previewPath = `${previewDomain}/${previewGroup}/${previewRepository}/-/branches/new`
  const shouldOpenGuide = !settings.defaultPrefix && !settings.domainUrl && !settings.groupName

  const tourSteps: TourProps['steps'] = [
    {
      title: '默认 Branch 前缀',
      description: '建议填写你的名字首字母缩写，例如 hyl。之后生成分支时会自动带上这个前缀。',
      target: () => prefixRef.current!
    },
    {
      title: 'GitLab 域名',
      description: '填写公司 GitLab 首页地址，例如 https://git.example.com，不需要写项目路径。',
      target: () => domainRef.current!
    },
    {
      title: 'GitLab 项目组',
      description: '填写项目所在分组，例如 frontend。系统会和仓库名拼成完整项目路径。',
      target: () => groupRef.current!
    },
    {
      title: '代码仓库',
      description: '这里维护可选仓库。id 是 GitLab 项目 ID，value 是英文仓库名，label 是界面显示名。',
      target: () => repositoriesRef.current!
    },
    {
      title: '核对预览路径',
      description: '这里会实时展示分支创建路径和 Branch 示例，保存前可以先确认是否符合预期。',
      target: () => previewRef.current!
    }
  ]

  useEffect(() => {
    form.setFieldsValue(settings)
  }, [form, settings])

  useEffect(() => {
    if (!shouldOpenGuide || localStorage.getItem(SETTINGS_TOUR_KEY)) return
    setTourOpen(true)
    localStorage.setItem(SETTINGS_TOUR_KEY, 'true')
  }, [shouldOpenGuide])

  return (
    <Card
      className="surface-card"
      title={<Space><SettingOutlined />工作台设置</Space>}
      extra={
        <Button type="link" icon={<QuestionCircleOutlined />} onClick={() => setTourOpen(true)}>
          填写引导
        </Button>
      }
    >
      <Form form={form} layout="vertical" onFinish={onSave} requiredMark={false}>
        <div ref={prefixRef}>
          <Form.Item
            label="默认 Branch 前缀"
            name="defaultPrefix"
            help="可以填写你的名字首字母缩写，例如 hyl"
          >
            <Input placeholder="例如：hyl" allowClear />
          </Form.Item>
        </div>
        <div ref={domainRef}>
          <Form.Item
            label="GitLab 域名"
            name="domainUrl"
            help="填写 GitLab 访问域名，例如 https://git.example.com"
            rules={[{ type: 'url', warningOnly: true, message: '建议填写完整 URL，例如 https://git.example.com' }]}
          >
            <Input placeholder="https://git.example.com" allowClear />
          </Form.Item>
        </div>
        <div ref={groupRef}>
          <Form.Item label="GitLab 项目组" name="groupName" help="填写项目所在分组，例如 frontend">
            <Input placeholder="例如：frontend" allowClear />
          </Form.Item>
        </div>

        <div ref={repositoriesRef} className="repository-settings">
          <Typography.Text className="field-label">代码仓库</Typography.Text>
          <Form.List name="repositories">
            {(fields, { add, remove }) => (
              <>
                <div className="repository-list">
                  {fields.map(({ key, name }) => (
                    <div className="repository-row" key={key}>
                      <Form.Item
                        name={[name, 'id']}
                        rules={[{ required: true, message: '填写仓库 ID' }]}
                      >
                        <Input placeholder="id，例如 4" />
                      </Form.Item>
                      <Form.Item
                        name={[name, 'value']}
                        rules={[{ required: true, message: '填写英文仓库名' }]}
                      >
                        <Input placeholder="value，例如 admin-crm" />
                      </Form.Item>
                      <Form.Item
                        name={[name, 'label']}
                        rules={[{ required: true, message: '填写显示名称' }]}
                      >
                        <Input placeholder="label，例如 CRM 系统" />
                      </Form.Item>
                      <Button
                        aria-label="删除代码仓库"
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    </div>
                  ))}
                </div>
                <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({ id: '', value: '', label: '' })} block>
                  添加代码仓库
                </Button>
              </>
            )}
          </Form.List>
        </div>

        <div className="settings-preview" ref={previewRef}>
          <Typography.Text className="field-label">路径预览</Typography.Text>
          <Typography.Text code>{previewPath}</Typography.Text>
          <Typography.Text type="secondary">Branch 示例：{previewBranch}</Typography.Text>
        </div>
        <Form.Item label="深色主题" name="darkTheme" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={saving}>保存设置</Button>
      </Form>
      <Tour open={tourOpen} onClose={() => setTourOpen(false)} onFinish={() => setTourOpen(false)} steps={tourSteps} />
    </Card>
  )
}
