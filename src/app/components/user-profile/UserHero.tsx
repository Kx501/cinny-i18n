import React from 'react';
import { Avatar, Box, Icon, Icons, Text } from 'folds';
import classNames from 'classnames';
import * as css from './styles.css';
import { UserAvatar } from '../user-avatar';
import colorMXID from '../../../util/colorMXID';
import { getMxIdLocalPart } from '../../utils/matrix';
import { BreakWord, LineClamp3 } from '../../styles/Text.css';
import { UserPresence } from '../../hooks/useUserPresence';
import { AvatarPresence, PresenceBadge } from '../presence';

type UserHeroProps = {
  userId: string;
  avatarUrl?: string;
  presence?: UserPresence;
};
export function UserHero({ userId, avatarUrl, presence }: UserHeroProps) {
  return (
    <Box direction="Column" className={css.UserHero}>
      <div
        className={css.UserHeroCoverContainer}
        style={{
          backgroundColor: colorMXID(userId),
          filter: avatarUrl ? undefined : 'brightness(50%)',
        }}
      >
        {avatarUrl && <img className={css.UserHeroCover} src={avatarUrl} alt={userId} />}
      </div>
      <div className={css.UserHeroAvatarContainer}>
        <AvatarPresence
          className={css.UserAvatarContainer}
          badge={
            presence && <PresenceBadge presence={presence.presence} status={presence.status} />
          }
        >
          <Avatar className={css.UserHeroAvatar} size="500">
            <UserAvatar
              userId={userId}
              src={avatarUrl}
              alt={userId}
              renderFallback={() => <Icon size="500" src={Icons.User} filled />}
            />
          </Avatar>
        </AvatarPresence>
      </div>
    </Box>
  );
}

type UserHeroNameProps = {
  displayName?: string;
  userId: string;
};
export function UserHeroName({ displayName, userId }: UserHeroNameProps) {
  const username = getMxIdLocalPart(userId);

  return (
    <Box grow="Yes" direction="Column" gap="0">
      <Box alignItems="Baseline" gap="200" wrap="Wrap">
        <Text
          size="H4"
          className={classNames(BreakWord, LineClamp3)}
          title={displayName ?? username}
        >
          {displayName ?? username ?? userId}
        </Text>
      </Box>
      <Box alignItems="Center" gap="100" wrap="Wrap">
        <Text size="T200" className={classNames(BreakWord, LineClamp3)} title={username}>
          @{username}
        </Text>
      </Box>
    </Box>
  );
}
