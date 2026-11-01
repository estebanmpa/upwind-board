import { Avatar, type AvatarProps } from '@mantine/core';
import type { PersonSummary } from '@/types/api';
import { avatarColor, fullName, initials } from '@/utils/format';

interface PersonAvatarProps extends Omit<AvatarProps, 'children' | 'color'> {
  person: PersonSummary;
}

export function PersonAvatar({ person, ...props }: PersonAvatarProps) {
  return (
    <Avatar color={avatarColor(person.id)} alt={fullName(person)} {...props}>
      {initials(person)}
    </Avatar>
  );
}
