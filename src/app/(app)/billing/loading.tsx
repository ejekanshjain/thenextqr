import { Heading } from '@/components/heading'
import { Shell } from '@/components/shell'
import { CardSkeleton } from '@/components/ui/card-skeleton'

const Loading = () => {
  return (
    <Shell>
      <Heading
        heading="Billing"
        text="Manage billing and your subscription plan."
      />
      <div className="grid gap-10">
        <CardSkeleton />
      </div>
    </Shell>
  )
}

export default Loading
