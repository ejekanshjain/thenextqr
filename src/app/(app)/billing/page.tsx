import { Heading } from '@/components/heading'
import { Shell } from '@/components/shell'
import { Render } from './render'

const BillingPage = () => {
  return (
    <Shell>
      <Heading
        heading="Billing"
        text="Manage billing and your subscription plan."
      />
      <div className="grid gap-10">
        <Render />
      </div>
    </Shell>
  )
}

export default BillingPage
