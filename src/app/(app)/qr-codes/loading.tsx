import Link from 'next/link'

import { Heading } from '@/components/heading'
import { Icons } from '@/components/icons'
import { Shell } from '@/components/shell'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => {
  return (
    <Shell>
      <Heading heading="QR Codes" text="Create and manage qr codes.">
        <Link href="/qr-codes/new">
          <Button>
            <Icons.add className="mr-2 h-4 w-4" />
            New QR Code
          </Button>
        </Link>
      </Heading>
      <div className="divide-y rounded-md border">
        <div className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    </Shell>
  )
}

export default Loading
