import { Spin } from 'antd'
import { AuthPanel } from '@/components/AuthPanel'
import { Dashboard } from '@/components/Dashboard'
import { useAuth } from '@/hooks/useAuth'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="centered-loading"><Spin size="large" /></div>
  }

  return user ? <Dashboard /> : <AuthPanel />
}
