import { Box, Button, color, config, Icon, Icons, Spinner, Text } from 'folds';
import React, { useCallback } from 'react';
import { UserHero, UserHeroName } from './UserHero';
import { getDMRoomFor, getMxIdServer, mxcUrlToHttp } from '../../utils/matrix';
import { getMemberAvatarMxc, getMemberDisplayName } from '../../utils/room';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { useMediaAuthentication } from '../../hooks/useMediaAuthentication';
import { usePowerLevels, usePowerLevelsAPI } from '../../hooks/usePowerLevels';
import { useRoom } from '../../hooks/useRoom';
import { useUserPresence } from '../../hooks/useUserPresence';
import { IgnoredUserAlert, MutualRoomsChip, OptionsChip, ServerChip, ShareChip } from './UserChips';
import { AsyncStatus, useAsyncCallback } from '../../hooks/useAsyncCallback';
import { createDM, ignore } from '../../../client/action/room';
import { hasDevices } from '../../../util/matrixUtil';
import { useRoomNavigate } from '../../hooks/useRoomNavigate';
import { useAlive } from '../../hooks/useAlive';
import { useCloseUserRoomProfile } from '../../state/hooks/userRoomProfile';
import { PowerChip } from './PowerChip';
import { UserInviteAlert, UserBanAlert, UserModeration, UserKickAlert } from './UserModeration';
import { useIgnoredUsers } from '../../hooks/useIgnoredUsers';
import { useMembership } from '../../hooks/useMembership';
import { Membership } from '../../../types/matrix/room';

type UserRoomProfileProps = {
  userId: string;
};
export function UserRoomProfile({ userId }: UserRoomProfileProps) {
  const mx = useMatrixClient();
  const useAuthentication = useMediaAuthentication();
  const { navigateRoom } = useRoomNavigate();
  const alive = useAlive();
  const closeUserRoomProfile = useCloseUserRoomProfile();
  const ignoredUsers = useIgnoredUsers();
  const ignored = ignoredUsers.includes(userId);

  const room = useRoom();
  const powerlevels = usePowerLevels(room);
  const { getPowerLevel, canDoAction } = usePowerLevelsAPI(powerlevels);
  const myPowerLevel = getPowerLevel(mx.getSafeUserId());
  const userPowerLevel = getPowerLevel(userId);
  const canKick = canDoAction('kick', myPowerLevel) && myPowerLevel > userPowerLevel;
  const canBan = canDoAction('ban', myPowerLevel) && myPowerLevel > userPowerLevel;
  const canInvite = canDoAction('invite', myPowerLevel);

  const member = room.getMember(userId);
  const membership = useMembership(room, userId);

  const server = getMxIdServer(userId);
  const displayName = getMemberDisplayName(room, userId);
  const avatarMxc = getMemberAvatarMxc(room, userId);
  const avatarUrl = (avatarMxc && mxcUrlToHttp(mx, avatarMxc, useAuthentication)) ?? undefined;

  const presence = useUserPresence(userId);

  const [directMessageState, directMessage] = useAsyncCallback<string, Error, []>(
    useCallback(async () => {
      const result = await createDM(mx, userId, await hasDevices(mx, userId));
      return result.room_id as string;
    }, [userId, mx])
  );

  const handleMessage = () => {
    const dmRoomId = getDMRoomFor(mx, userId)?.roomId;
    if (dmRoomId) {
      navigateRoom(dmRoomId);
      closeUserRoomProfile();
      return;
    }
    directMessage().then((rId) => {
      if (alive()) {
        navigateRoom(rId);
        closeUserRoomProfile();
      }
    });
  };

  return (
    <Box direction="Column">
      <UserHero
        userId={userId}
        avatarUrl={avatarUrl}
        presence={presence && presence.lastActiveTs !== 0 ? presence : undefined}
      />
      <Box direction="Column" gap="500" style={{ padding: config.space.S400 }}>
        <Box direction="Column" gap="400">
          <Box gap="400" alignItems="Start">
            <UserHeroName displayName={displayName} userId={userId} />
            <Box shrink="No">
              <Button
                size="300"
                variant="Primary"
                fill="Solid"
                radii="300"
                disabled={directMessageState.status === AsyncStatus.Loading}
                before={
                  directMessageState.status === AsyncStatus.Loading ? (
                    <Spinner size="50" variant="Primary" fill="Solid" />
                  ) : (
                    <Icon size="50" src={Icons.Message} filled />
                  )
                }
                onClick={handleMessage}
              >
                <Text size="B300">Message</Text>
              </Button>
            </Box>
          </Box>
          {directMessageState.status === AsyncStatus.Error && (
            <Text style={{ color: color.Critical.Main }}>
              <b>{directMessageState.error.message}</b>
            </Text>
          )}
          <Box alignItems="Center" gap="200" wrap="Wrap">
            {server && <ServerChip server={server} />}
            <ShareChip userId={userId} />
            <PowerChip userId={userId} />
            <MutualRoomsChip userId={userId} />
            <OptionsChip userId={userId} />
          </Box>
        </Box>
        {ignored && <IgnoredUserAlert />}
        {member && membership === Membership.Ban && (
          <UserBanAlert
            userId={userId}
            reason={member.events.member?.getContent().reason}
            canUnban={canBan}
            bannedBy={member.events.member?.getSender()}
            ts={member.events.member?.getTs()}
          />
        )}
        {member &&
          membership === Membership.Leave &&
          member.events.member &&
          member.events.member.getSender() !== userId && (
            <UserKickAlert
              reason={member.events.member?.getContent().reason}
              kickedBy={member.events.member?.getSender()}
              ts={member.events.member?.getTs()}
            />
          )}
        {member && membership === Membership.Invite && (
          <UserInviteAlert
            userId={userId}
            reason={member.events.member?.getContent().reason}
            canKick={canKick}
            invitedBy={member.events.member?.getSender()}
            ts={member.events.member?.getTs()}
          />
        )}
        <UserModeration
          userId={userId}
          canInvite={canInvite && membership === Membership.Leave}
          canKick={canKick && membership === Membership.Join}
          canBan={canBan && membership !== Membership.Ban}
        />
      </Box>
    </Box>
  );
}
