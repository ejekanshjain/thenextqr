import { Metadata } from 'next'

import { siteConfig } from '@/lib/siteConfig'

export const metadata: Metadata = {
  title: siteConfig.name + ' Privacy Policy',
  description: siteConfig.description
}

const Privacy = () => {
  return <div>Privacy</div>
}

export default Privacy
