import { Heading } from '@/components/heading'
import { Shell } from '@/components/shell'
import { CardSkeleton } from '@/components/ui/card-skeleton'

const Loading = () => {
  return (
    <Shell>
      <Heading heading="Settings" text="Manage account and profile settings." />
      <div className="grid gap-10">
        <CardSkeleton />
      </div>
    </Shell>
  )
}

export default Loading
