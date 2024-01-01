import { User } from '@prisma/client'
import { AvatarProps } from '@radix-ui/react-avatar'
import { FC } from 'react'

import { Icons } from '@/components/icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserAvatarProps extends AvatarProps {
  user?: Pick<User, 'image' | 'name'> | null
}

export const UserAvatar: FC<UserAvatarProps> = ({ user, ...props }) => {
  if (user)
    return (
      <Avatar {...props}>
        {user.image ? (
          <AvatarImage alt="Picture" src={user.image} />
        ) : (
          <AvatarFallback>
            <span className="sr-only">{user.name}</span>
            <Icons.user className="h-4 w-4" />
          </AvatarFallback>
        )}
      </Avatar>
    )

  return (
    <Avatar {...props}>
      <AvatarFallback className="bg-transparent border hover:bg-muted transition-all">
        <Icons.menu className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
  )
}
