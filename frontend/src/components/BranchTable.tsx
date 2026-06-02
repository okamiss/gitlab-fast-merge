import { useState } from 'react'
import { DeleteOutlined, EditOutlined, ImportOutlined } from '@ant-design/icons'
import { Button, Input, Modal, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd'
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
    { title: 'Branch', dataIndex: 'branch', ellipsis: true },
    {
      title: '仓库',
      dataIndex: 'storeName',
      width: 140,
      render: (storeName: string) => storeOptions.find((item) => item.value === storeName)?.label
    },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    {
      title: '进度',
      dataIndex: 'progress',
      width: 100,
      render: (progress: number) => {
        const option = progressOptions.find((item) => item.value === progress)
        return <Tag color={option?.color}>{option?.label}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 230,
      render: (_, record) => (
        <Space size={4}>
          <Button type="link" icon={<ImportOutlined />} onClick={() => onImport(record)}>导入</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => setEditing(record)}>编辑</Button>
          <Popconfirm title="确认删除这条分支记录？" onConfirm={() => onDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
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
        scroll={{ x: 820 }}
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
