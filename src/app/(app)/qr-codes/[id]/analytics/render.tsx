'use client'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { FC } from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { GetQRCodeAnalyticsFnDataType } from './actions'

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

export const Render: FC<{ data: GetQRCodeAnalyticsFnDataType }> = ({
  data
}) => {
  const router = useRouter()

  return (
    <div className="flex flex-col">
      <div>
        <Button type="button" onClick={() => router.back()} variant="ghost">
          <Icons.chevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="mt-10">
        <Card>
          <CardHeader>Current Month Stats</CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data.currentMonthStats}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis stroke="#888888" tickLine={false} />
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
