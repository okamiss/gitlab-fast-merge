import { useState } from 'react'
import { DeleteOutlined, EditOutlined, ExperimentOutlined, ImportOutlined, RocketOutlined } from '@ant-design/icons'
import { Button, Input, Modal, Popconfirm, Select, Space, Table, Tag, Tooltip, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { progressOptions } from '@/constants/options'
import type { BranchRecord, RepositoryOption } from '@/types'

interface BranchTableProps {
  records: BranchRecord[]
  loading: boolean
  page: number
  pageSize: number
  total: number
  repositories: RepositoryOption[]
  onImport: (record: BranchRecord) => void
  onImportAndOpen: (record: BranchRecord, target: 'beta' | 'prod') => void
  onDelete: (id: string) => Promise<void>
  onPageChange: (page: number, pageSize: number) => void
  onUpdate: (id: string, payload: { description: string; progress: number }) => Promise<void>
}

function getNextProgress(progress: number) {
  const currentIndex = progressOptions.findIndex((item) => item.value === progress)
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % progressOptions.length : 0
  return progressOptions[nextIndex].value
}

export function BranchTable({
  records,
  loading,
  page,
  pageSize,
  total,
  repositories,
  onImport,
  onImportAndOpen,
  onDelete,
  onPageChange,
  onUpdate
}: BranchTableProps) {
  const [editing, setEditing] = useState<BranchRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const [updatingProgressId, setUpdatingProgressId] = useState<string | null>(null)

  const cycleProgress = async (record: BranchRecord) => {
    setUpdatingProgressId(record.id)
    try {
      await onUpdate(record.id, {
        description: record.description,
        progress: getNextProgress(record.progress)
      })
    } finally {
      setUpdatingProgressId(null)
    }
  }

  const columns: TableColumnsType<BranchRecord> = [
    { title: 'Branch', dataIndex: 'branch', width: 150, ellipsis: true },
    {
      title: '仓库',
      dataIndex: 'storeName',
      width: 150,
      render: (storeName: string) => repositories.find((item) => item.value === storeName)?.label ?? storeName
    },
    { title: '描述', dataIndex: 'description', ellipsis: true, responsive: ['sm'] },
    {
      title: '进度',
      dataIndex: 'progress',
      width: 100,
      render: (progress: number, record) => {
        const option = progressOptions.find((item) => item.value === progress)
        const nextOption = progressOptions.find((item) => item.value === getNextProgress(progress))
        return (
          <Tooltip title={`点击切换到${nextOption?.label ?? '下一个状态'}`}>
            <Button
              className="progress-cycle-button"
              type="text"
              size="small"
              loading={updatingProgressId === record.id}
              aria-label={`切换进度到 ${nextOption?.label ?? '下一个状态'}`}
              onClick={() => cycleProgress(record)}
            >
              <Tag color={option?.color}>{option?.label}</Tag>
            </Button>
          </Tooltip>
        )
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      render: (_, record) => (
        <Space size={0}>
          <Tooltip title="导入">
            <Button type="link" aria-label="导入" icon={<ImportOutlined />} onClick={() => onImport(record)} />
          </Tooltip>
          <Tooltip title="导入并打开测试合并">
            <Button
              type="link"
              aria-label="导入并打开测试合并"
              icon={<ExperimentOutlined />}
              onClick={() => onImportAndOpen(record, 'beta')}
            >
              测合
            </Button>
          </Tooltip>
          <Tooltip title="导入并打开生产合并">
            <Button
              type="link"
              aria-label="导入并打开生产合并"
              icon={<RocketOutlined />}
              onClick={() => onImportAndOpen(record, 'prod')}
            >
              产合
            </Button>
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="link" aria-label="编辑" icon={<EditOutlined />} onClick={() => setEditing(record)} />
          </Tooltip>
          <Popconfirm title="确认删除这条分支记录？" onConfirm={() => onDelete(record.id)}>
            <Tooltip title="删除">
              <Button type="link" danger aria-label="删除" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const save = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await onUpdate(editing.id, {
        description: editing.description,
        progress: editing.progress
      })
      setEditing(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="section-block">
      <div className="section-heading">
        <div>
          <Typography.Title level={4}>已保存的 Branch</Typography.Title>
          <Typography.Text type="secondary">登录用户独立保存，可随时导入右侧链接生成器。</Typography.Text>
        </div>
        <span className="count-pill">{total} 条记录</span>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={records}
        loading={loading}
        size="small"
        tableLayout="fixed"
        pagination={{
          current: page,
          pageSize,
          total,
          hideOnSinglePage: false,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          onChange: onPageChange
        }}
      />
      <Modal
        title="编辑分支记录"
        open={Boolean(editing)}
        onCancel={() => setEditing(null)}
        onOk={save}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
      >
        {editing && (
          <div className="modal-form">
            <div>
              <label className="field-label">描述</label>
              <Input
                value={editing.description}
                onChange={(event) => setEditing({ ...editing, description: event.target.value })}
              />
            </div>
            <div>
              <label className="field-label">进度</label>
              <Select
                value={editing.progress}
                onChange={(progress) => setEditing({ ...editing, progress })}
                options={progressOptions}
              />
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
