'use client'

import { FC } from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { CustomTooltip } from './custom-tooltip'

export const BarGraph: FC<{ data: { name: string; count: number }[] }> = ({
  data
}) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} />
        <Bar
          type="monotone"
          dataKey="count"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
        <Tooltip content={CustomTooltip} cursor={{ fill: 'transparent' }} />
      </BarChart>
    </ResponsiveContainer>
  )
}
