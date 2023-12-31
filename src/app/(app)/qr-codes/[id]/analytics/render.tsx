'use client'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { FC } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

export const Render: FC = () => {
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
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={[
              {
                name: 'Jan',
                total: Math.floor(Math.random() * 5000) + 1000
              },
              {
                name: 'Feb',
                total: Math.floor(Math.random() * 5000) + 1000
              },
              {
                name: 'Mar',
                total: Math.floor(Math.random() * 5000) + 1000
              },
              {
                name: 'Apr',
                total: Math.floor(Math.random() * 5000) + 1000
              },
              {
                name: 'May',
                total: Math.floor(Math.random() * 5000) + 1000
              },
              {
                name: 'Jun',
                total: Math.floor(Math.random() * 5000) + 1000
              },
              {
                name: 'Jul',
                total: Math.floor(Math.random() * 5000) + 1000
              },
              {
                name: 'Aug',
                total: Math.floor(Math.random() * 5000) + 1000
              },
              {
                name: 'Sep',
                total: Math.floor(Math.random() * 5000) + 1000
              },
              {
                name: 'Oct',
                total: Math.floor(Math.random() * 5000) + 1000
              },
              {
                name: 'Nov',
                total: Math.floor(Math.random() * 5000) + 1000
              },
              {
                name: 'Dec',
                total: Math.floor(Math.random() * 5000) + 1000
              }
            ]}
          >
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={value => `$${value}`}
            />
            <Bar
              dataKey="total"
              fill="currentColor"
              radius={[4, 4, 0, 0]}
              className="fill-primary"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
