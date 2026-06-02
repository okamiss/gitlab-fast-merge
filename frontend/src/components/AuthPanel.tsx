import { useState } from 'react'
import { BranchesOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Form, Input, Segmented, Typography } from 'antd'
import { useAuth } from '@/hooks/useAuth'

interface Credentials {
  username: string
  password: string
}

export function AuthPanel() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submit = async (values: Credentials) => {
    setSubmitting(true)
    setError('')
    try {
      await (mode === 'login' ? login : register)(values.username, values.password)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <div className="brand-mark">
          <BranchesOutlined />
        </div>
        <Typography.Title>GitLab Fast Merge</Typography.Title>
        <Typography.Paragraph>
          为团队保存分支、生成发布链接并追踪需求进度。登录后，你的工作记录会安全地保存在服务器中。
        </Typography.Paragraph>
        <div className="auth-feature-grid">
          <div><strong>快速</strong><span>一键生成 GitLab 操作链接</span></div>
          <div><strong>清晰</strong><span>统一维护分支与发布进度</span></div>
          <div><strong>隔离</strong><span>每位用户拥有独立数据空间</span></div>
        </div>
      </section>
      <Card className="auth-card" bordered={false}>
        <Segmented
          block
          options={[
            { label: '登录', value: 'login' },
            { label: '注册', value: 'register' }
          ]}
          value={mode}
          onChange={(value) => {
            setMode(value as 'login' | 'register')
            setError('')
          }}
        />
        <Typography.Title level={3}>{mode === 'login' ? '欢迎回来' : '创建账号'}</Typography.Title>
        <Typography.Paragraph type="secondary">
          {mode === 'login' ? '登录后继续管理你的分支记录。' : '注册后即可开始使用工作台。'}
        </Typography.Paragraph>
        {error && <Alert message={error} type="error" showIcon />}
        <Form layout="vertical" onFinish={submit} requiredMark={false}>
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少 3 个字符' }
            ]}
          >
            <Input prefix={<UserOutlined />} autoComplete="username" placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少 6 个字符' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="请输入密码"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={submitting}>
            {mode === 'login' ? '登录' : '注册并登录'}
          </Button>
        </Form>
      </Card>
    </main>
  )
}
