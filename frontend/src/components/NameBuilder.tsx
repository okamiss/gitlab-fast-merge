import { useEffect, useMemo, useState } from 'react'
import { BranchesOutlined, CopyOutlined, SaveOutlined } from '@ant-design/icons'
import { Button, Card, Checkbox, Col, Input, Row, Select, Typography, message } from 'antd'
import dayjs from 'dayjs'
import type { RepositoryOption } from '@/types'
import { copyText } from '@/utils/clipboard'

type TimePart = 'date' | 'minute' | 'second'
type SaveBranchPayload = { branch: string; storeName: string; description: string }
type SaveBranchOptions = { openCreateLink?: boolean }

interface NameBuilderProps {
  type: 'branch' | 'tag'
  defaultPrefix?: string
  repositories: RepositoryOption[]
  onPreviewChange?: (value: string) => void
  onSaveBranch?: (payload: SaveBranchPayload, options?: SaveBranchOptions) => void | Promise<void>
}

const labels: Record<TimePart, string> = {
  date: '年月日',
  minute: '时分',
  second: '秒'
}

function formatTime(parts: TimePart[], now: dayjs.Dayjs) {
  return [
    parts.includes('date') ? now.format('YYYYMMDD') : '',
    parts.includes('minute') ? now.format('HHmm') : '',
    parts.includes('second') ? now.format('ss') : ''
  ].join('')
}

export function NameBuilder({
  type,
  defaultPrefix = '',
  repositories,
  onPreviewChange,
  onSaveBranch
}: NameBuilderProps) {
  const [messageApi, contextHolder] = message.useMessage()
  const isBranch = type === 'branch'
  const [prefix, setPrefix] = useState(isBranch ? defaultPrefix : 'prod')
  const [suffix, setSuffix] = useState('')
  const [timeParts, setTimeParts] = useState<TimePart[]>(isBranch ? ['date'] : ['date', 'minute'])
  const [now, setNow] = useState(dayjs())
  const [description, setDescription] = useState('')
  const [storeName, setStoreName] = useState(repositories[0]?.value ?? '')

  useEffect(() => {
    if (isBranch) {
      setPrefix(defaultPrefix)
    }
  }, [defaultPrefix, isBranch])

  useEffect(() => {
    if (!repositories.some((repository) => repository.value === storeName)) {
      setStoreName(repositories[0]?.value ?? '')
    }
  }, [repositories, storeName])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(dayjs()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const preview = useMemo(() => {
    const time = formatTime(timeParts, now)
    return `${prefix.trim()}${prefix.trim() ? '/' : ''}${time}${suffix.trim() ? '_' : ''}${suffix.trim()}`
  }, [now, prefix, suffix, timeParts])

  useEffect(() => {
    onPreviewChange?.(preview)
  }, [onPreviewChange, preview])

  const copyPreview = async () => {
    const copied = await copyText(preview)
    messageApi[copied ? 'success' : 'error'](copied ? '已复制' : '复制失败，请手动复制')
  }
  const saveBranch = (options?: SaveBranchOptions) => {
    if (!preview) return
    onSaveBranch?.({ branch: preview, storeName, description: description.trim() }, options)
    setDescription('')
  }

  return (
    <>
    {contextHolder}
    <Card
      className="surface-card"
      title={isBranch ? 'Branch 命名' : 'Tag 命名'}
      extra={<Typography.Text type="secondary">{isBranch ? '需求分支' : '发布标签'}</Typography.Text>}
    >
      <Row gutter={[12, 12]}>
        <Col xs={24} md={7}>
          <label className="field-label">前缀</label>
          {isBranch ? (
            <Input value={prefix} onChange={(event) => setPrefix(event.target.value)} allowClear />
          ) : (
            <Select
              value={prefix}
              onChange={setPrefix}
              options={[
                { value: 'beta', label: 'beta' },
                { value: 'prod', label: 'prod' }
              ]}
            />
          )}
        </Col>
        <Col xs={24} md={10}>
          <label className="field-label">时间模式</label>
          <Checkbox.Group
            value={timeParts}
            onChange={(values) => setTimeParts(values as TimePart[])}
            options={(Object.keys(labels) as TimePart[]).map((value) => ({ value, label: labels[value] }))}
          />
        </Col>
        <Col xs={24} md={7}>
          <label className="field-label">后缀</label>
          <Input value={suffix} onChange={(event) => setSuffix(event.target.value)} allowClear />
        </Col>
      </Row>
      <div className="preview-box">
        <div>
          <span>实时预览</span>
          <strong>{preview || '请选择时间模式'}</strong>
        </div>
        <Button icon={<CopyOutlined />} onClick={copyPreview}>复制</Button>
      </div>
      {isBranch && (
        <Row gutter={[12, 12]} className="save-row">
          <Col xs={24} lg={12}>
            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              onPressEnter={() => saveBranch()}
              placeholder="补充需求或分支描述"
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select value={storeName} onChange={setStoreName} options={repositories} />
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Button type="primary" icon={<SaveOutlined />} onClick={() => saveBranch()} disabled={!storeName} block>
              保存
            </Button>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Button icon={<BranchesOutlined />} onClick={() => saveBranch({ openCreateLink: true })} disabled={!storeName} block>保存并创建</Button>
          </Col>
        </Row>
      )}
    </Card>
    </>
  )
}
