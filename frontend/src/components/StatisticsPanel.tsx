import { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, Empty, Select, Space } from 'antd'
import { BarChartOutlined } from '@ant-design/icons'
import type { BranchTrend } from '@/types'

interface StatisticsPanelProps {
  trend: BranchTrend | null
  onYearChange: (year: number) => void
}

const monthLabels = ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月', '7 月', '8 月', '9 月', '10 月', '11 月', '12 月']

export function StatisticsPanel({ trend, onYearChange }: StatisticsPanelProps) {
  const years = trend?.years ?? []
  const monthlyData = useMemo(
    () =>
      monthLabels.map((name, monthIndex) => ({
        name,
        count: trend?.months.find((item) => item.month === monthIndex + 1)?.count ?? 0
      })),
    [trend]
  )

  return (
    <Card
      className="surface-card statistics-card"
      title={<Space><BarChartOutlined />Branch 趋势</Space>}
      extra={
        <Select
          value={trend?.selectedYear}
          onChange={onYearChange}
          options={years.map((year) => ({ value: year, label: `${year} 年` }))}
          placeholder="选择年份"
          disabled={!years.length}
        />
      }
    >
      {!years.length ? (
        <Empty description="保存 Branch 后即可查看趋势" />
      ) : (
        <ResponsiveContainer width="100%" height={270}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="branchTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(value) => [`${value} 个`, 'Branch']} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#16a34a"
              strokeWidth={3}
              fill="url(#branchTrend)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
