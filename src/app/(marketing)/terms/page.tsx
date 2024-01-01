import { Metadata } from 'next'

import { siteConfig } from '@/lib/siteConfig'

export const metadata: Metadata = {
  title: 'Terms of Service - ' + siteConfig.name,
  description: siteConfig.description
}

const TermsPage = () => {
  return <div>Terms</div>
}

export default TermsPage
