import { CopyOutlined, ExportOutlined, LinkOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Input, Select, Space, Typography, message } from 'antd'
import { storeOptions } from '@/constants/options'
import { copyText } from '@/utils/clipboard'
import { buildGitLabLinks } from '@/utils/gitlab-links'
import type { GeneratedLink, UserSettings } from '@/types'

interface LinkGeneratorProps {
  branch: string
  storeName: string
  settings: UserSettings
  onBranchChange: (value: string) => void
  onStoreChange: (value: string) => void
}

export function LinkGenerator({
  branch,
  storeName,
  settings,
  onBranchChange,
  onStoreChange
}: LinkGeneratorProps) {
  const [messageApi, contextHolder] = message.useMessage()
  const links: GeneratedLink[] = buildGitLabLinks(branch, storeName, settings)

  return (
    <>
    {contextHolder}
    <Card
      className="surface-card"
      title={<Space><LinkOutlined />GitLab 快捷链接</Space>}
      extra={<Typography.Text type="secondary">参数已自动编码</Typography.Text>}
    >
      {(!settings.domainUrl || !settings.groupName) && (
        <Alert
          className="inline-alert"
          type="warning"
          showIcon
          message="请先在设置中填写 GitLab 域名和项目组"
        />
      )}
      <div className="generator-controls">
        <div>
          <label className="field-label">当前 Branch</label>
          <Input value={branch} onChange={(event) => onBranchChange(event.target.value)} allowClear />
        </div>
        <div>
          <label className="field-label">代码仓库</label>
          <Select value={storeName} onChange={onStoreChange} options={storeOptions} />
        </div>
      </div>
      <div className="link-list">
        {links.map((link) => (
          <div className="link-item" key={link.kind}>
            <div>
              <Typography.Text strong>{link.label}</Typography.Text>
              <Input value={link.value} readOnly placeholder="等待必要参数" />
            </div>
            <Space>
              <Button
                icon={<CopyOutlined />}
                disabled={!link.value}
                onClick={async () => {
                  const copied = await copyText(link.value)
                  messageApi[copied ? 'success' : 'error'](copied ? '已复制' : '复制失败，请手动复制')
                }}
              >
                复制
              </Button>
              <Button
                type="primary"
                icon={<ExportOutlined />}
                disabled={!link.value}
                onClick={() => window.open(link.value, '_blank', 'noopener,noreferrer')}
              >
                打开
              </Button>
            </Space>
          </div>
        ))}
      </div>
    </Card>
    </>
  )
}
