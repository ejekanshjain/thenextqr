import { Metadata } from 'next'

import { siteConfig } from '@/lib/siteConfig'

export const metadata: Metadata = {
  title: 'Privacy Policy - ' + siteConfig.name,
  description: siteConfig.description
}

const PrivacyPage = () => {
  return <div>Privacy</div>
}

export default PrivacyPage
