import { Home, QrCode, Settings, Users } from 'lucide-react'
import { SidebarNavGroup } from '~/components/navigation-sidebar'

export type UserOrganization = {
  id: string
  name: string
  slug: string
  logo: string | null
  role: string
  userId: string
  memberId: string
}

export const canManageOrganization = (role: string): boolean =>
  role === 'owner' || role === 'admin'

export const getAppNavigation = (
  orgId: string,
  role: string
): SidebarNavGroup[] => {
  const groups: SidebarNavGroup[] = [
    {
      label: 'Overview',
      items: [
        {
          title: 'Dashboard',
          url: `/app/${orgId}/dashboard`,
          icon: Home
        },
        {
          title: 'QR Codes',
          url: `/app/${orgId}/qr-codes`,
          icon: QrCode
        }
      ]
    }
  ]

  if (canManageOrganization(role)) {
    groups.push({
      label: 'Settings',
      items: [
        {
          title: 'General',
          url: `/app/${orgId}/settings`,
          icon: Settings,
          exact: true
        },
        {
          title: 'Members',
          url: `/app/${orgId}/settings/members`,
          icon: Users
        }
      ]
    })
  }

  return groups
}
