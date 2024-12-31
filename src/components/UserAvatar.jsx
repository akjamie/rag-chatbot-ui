import { Avatar } from '@mui/material';

function UserAvatar({ name, ...props }) {
  // Generate initials from name
  const initials = name
    ?.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <Avatar {...props}>
      {initials}
    </Avatar>
  );
}

export default UserAvatar; 