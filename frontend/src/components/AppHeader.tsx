import { BranchesOutlined, LogoutOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button, Switch, Typography } from 'antd'
import { useAuth } from '@/hooks/useAuth'

interface AppHeaderProps {
  darkTheme: boolean
  onThemeChange: (checked: boolean) => void
}

export function AppHeader({ darkTheme, onThemeChange }: AppHeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-logo"><BranchesOutlined /></div>
        <div>
          <Typography.Title level={4}>GitLab Fast Merge</Typography.Title>
          <Typography.Text type="secondary">分支与发布工作台</Typography.Text>
        </div>
      </div>
      <div className="header-actions">
        <Switch
          checked={darkTheme}
          onChange={onThemeChange}
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
          aria-label="切换深色主题"
        />
        <span className="user-chip">{user?.username}</span>
        <Button icon={<LogoutOutlined />} onClick={logout}>退出</Button>
      </div>
    </header>
  )
}
