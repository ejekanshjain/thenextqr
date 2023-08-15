import { Heading } from '@/components/heading'
import { Shell } from '@/components/shell'
import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => {
  return (
    <Shell>
      <Heading heading="Loading" text="Loading" />
      <div className="grid gap-4 p-1">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </Shell>
  )
}

export default Loading
