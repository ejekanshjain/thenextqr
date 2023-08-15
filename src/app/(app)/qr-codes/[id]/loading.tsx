import { CardSkeleton } from '@/components/card-skeleton'
import { Heading } from '@/components/heading'
import { Shell } from '@/components/shell'

const Loading = () => {
  return (
    <Shell>
      <Heading heading="Loading" />
      <div className="grid gap-10">
        <CardSkeleton />
      </div>
    </Shell>
  )
}

export default Loading
