import { useState } from 'react'
import { DeleteOutlined, EditOutlined, ImportOutlined } from '@ant-design/icons'
import { Button, Input, Modal, Popconfirm, Select, Space, Table, Tag, Tooltip, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { progressOptions, storeOptions } from '@/constants/options'
import type { BranchRecord } from '@/types'

interface BranchTableProps {
  records: BranchRecord[]
  loading: boolean
  onImport: (record: BranchRecord) => void
  onDelete: (id: string) => Promise<void>
  onUpdate: (id: string, payload: { description: string; progress: number }) => Promise<void>
}

export function BranchTable({ records, loading, onImport, onDelete, onUpdate }: BranchTableProps) {
  const [editing, setEditing] = useState<BranchRecord | null>(null)
  const [saving, setSaving] = useState(false)

  const columns: TableColumnsType<BranchRecord> = [
    { title: 'Branch', dataIndex: 'branch', width: 120, ellipsis: true },
    {
      title: '仓库',
      dataIndex: 'storeName',
      width: 92,
      render: (storeName: string) => storeOptions.find((item) => item.value === storeName)?.label
    },
    { title: '描述', dataIndex: 'description', width: 120, ellipsis: true, responsive: ['sm'] },
    {
      title: '进度',
      dataIndex: 'progress',
      width: 74,
      render: (progress: number) => {
        const option = progressOptions.find((item) => item.value === progress)
        return <Tag color={option?.color}>{option?.label}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 98,
      render: (_, record) => (
        <Space size={0}>
          <Tooltip title="导入">
            <Button type="link" aria-label="导入" icon={<ImportOutlined />} onClick={() => onImport(record)} />
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
        <span className="count-pill">{records.length} 条记录</span>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={records}
        loading={loading}
        size="small"
        tableLayout="fixed"
        pagination={{ pageSize: 8, hideOnSinglePage: true }}
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
