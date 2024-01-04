'use client'

import { FC } from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div>
        <p>{payload[0].payload.date}</p>
        <p>Count: {payload[0].value}</p>
      </div>
    )
  }

  return null
}

export const AreaGraph: FC<{ data: { name: string; count: number }[] }> = ({
  data
}) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <XAxis stroke="#888888" fontSize={12} tickLine={false} dataKey="name" />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} />
        <Area
          type="monotone"
          dataKey="count"
          fill="#8884d8"
          stroke="#8884d8"
          strokeWidth={2}
        />
        <Tooltip content={CustomTooltip} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
