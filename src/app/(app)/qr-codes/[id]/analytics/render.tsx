'use client'

import { useRouter } from 'next/navigation'
import { FC } from 'react'

import { AreaGraph } from '@/components/graphs/area-graph'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { GetQRCodeAnalyticsFnDataType } from './actions'

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
            <AreaGraph data={data.currentMonthStats} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
