import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from 'recharts'

import { Card, Form, Select } from 'antd'

interface StatisticsProps {
  data: branchlist[]
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label} : ${payload[0].value}个需求`}</p>
      </div>
    )
  }

  return null
}

export default function statistics({ data }: StatisticsProps) {
  const [yearsoptions, setYearsoptions] = useState([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [monthlyData, setMonthlyData] = useState<{ name: string; sum: number }[]>([])

  useEffect(() => {
    const getUniqueYears = () => {
      return Array.from(
        new Set(
          data.map((item) => {
            const date = new Date(item.create_time * 1000)
            return date.getFullYear()
          })
        )
      ).sort((a, b) => b - a)
    }

    const uniqueYears = getUniqueYears()

    if (uniqueYears.length > 0) {
      setSelectedYear(uniqueYears[0])
      const arr: any = []
      uniqueYears.forEach((item) => {
        arr.push({ value: item, label: item })
      })
      setYearsoptions(arr)
    }
  }, [data])

  useEffect(() => {
    if (selectedYear) {
      const countRecordsByMonthForYear = () => {
        const months = [
          '一月',
          '二月',
          '三月',
          '四月',
          '五月',
          '六月',
          '七月',
          '八月',
          '九月',
          '十月',
          '十一月',
          '十二月'
        ]

        return Array(12)
          .fill(0)
          .map((_, index) => ({
            name: months[index],
            sum: data.filter((item) => {
              const date = new Date(item.create_time * 1000)
              return date.getFullYear() === selectedYear && date.getMonth() === index
            }).length
          }))
      }

      setMonthlyData(countRecordsByMonthForYear())
    }
  }, [data, selectedYear])

  const handleYearChange = (value: number) => {
    setSelectedYear(value)
  }

  return (
    <Card bordered={false} style={{ margin: '0 auto' }}>
      <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} autoComplete="off">
        <Form.Item label="选择年份">
          <Select
            onChange={handleYearChange}
            value={selectedYear}
            style={{ width: 120 }}
            options={yearsoptions}
          />
        </Form.Item>
      </Form>

      {selectedYear && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            {/* <Legend /> */}
            <Bar dataKey="sum" fill="#16a085" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
