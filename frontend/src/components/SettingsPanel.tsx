import { useEffect } from 'react'
import { SettingOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Space, Switch } from 'antd'
import type { UserSettings } from '@/types'

interface SettingsPanelProps {
  settings: UserSettings
  saving: boolean
  onSave: (values: UserSettings) => Promise<void>
}

export function SettingsPanel({ settings, saving, onSave }: SettingsPanelProps) {
  const [form] = Form.useForm<UserSettings>()

  useEffect(() => {
    form.setFieldsValue(settings)
  }, [form, settings])

  return (
    <Card
      className="surface-card"
      title={<Space><SettingOutlined />工作台设置</Space>}
    >
      <Form form={form} layout="vertical" onFinish={onSave} requiredMark={false}>
        <Form.Item label="默认 Branch 前缀" name="defaultPrefix">
          <Input placeholder="例如：feature 或用户名" allowClear />
        </Form.Item>
        <Form.Item
          label="GitLab 域名"
          name="domainUrl"
          rules={[{ type: 'url', warningOnly: true, message: '建议填写完整 URL，例如 https://git.example.com' }]}
        >
          <Input placeholder="https://git.example.com" allowClear />
        </Form.Item>
        <Form.Item label="GitLab 项目组" name="groupName">
          <Input placeholder="例如：frontend-team" allowClear />
        </Form.Item>
        <Form.Item label="深色主题" name="darkTheme" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={saving}>保存设置</Button>
      </Form>
    </Card>
  )
}
