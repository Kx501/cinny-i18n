import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StateEvent } from '../../../../types/matrix/room';
import { PermissionGroup } from '../../common-settings/permissions';

export const usePermissionGroups = (): PermissionGroup[] => {
  const { t } = useTranslation();
  const groups: PermissionGroup[] = useMemo(() => {
    const messagesGroup: PermissionGroup = {
      name: t('features:space-settings.permissions.manage'),
      items: [
        {
          location: {
            state: true,
            key: StateEvent.SpaceChild,
          },
          name: t('features:space-settings.permissions.manage_space_rooms'),
        },
        {
          location: {},
          name: t('features:space-settings.permissions.message_events'),
        },
      ],
    };

    const moderationGroup: PermissionGroup = {
      name: t('features:space-settings.permissions.moderation'),
      items: [
        {
          location: {
            action: true,
            key: 'invite',
          },
          name: t('features:space-settings.permissions.invite'),
        },
        {
          location: {
            action: true,
            key: 'kick',
          },
          name: t('features:space-settings.permissions.kick'),
        },
        {
          location: {
            action: true,
            key: 'ban',
          },
          name: t('features:space-settings.permissions.ban'),
        },
      ],
    };

    const roomOverviewGroup: PermissionGroup = {
      name: t('features:space-settings.permissions.space_overview'),
      items: [
        {
          location: {
            state: true,
            key: StateEvent.RoomAvatar,
          },
          name: t('features:space-settings.permissions.space_avatar'),
        },
        {
          location: {
            state: true,
            key: StateEvent.RoomName,
          },
          name: t('features:space-settings.permissions.space_name'),
        },
        {
          location: {
            state: true,
            key: StateEvent.RoomTopic,
          },
          name: t('features:space-settings.permissions.space_topic'),
        },
      ],
    };

    const roomSettingsGroup: PermissionGroup = {
      name: t('features:space-settings.permissions.settings'),
      items: [
        {
          location: {
            state: true,
            key: StateEvent.RoomJoinRules,
          },
          name: t('features:space-settings.permissions.change_space_access'),
        },
        {
          location: {
            state: true,
            key: StateEvent.RoomCanonicalAlias,
          },
          name: t('features:space-settings.permissions.publish_address'),
        },
        {
          location: {
            state: true,
            key: StateEvent.RoomPowerLevels,
          },
          name: t('features:space-settings.permissions.change_all_permission'),
        },
        {
          location: {
            state: true,
            key: StateEvent.PowerLevelTags,
          },
          name: t('features:space-settings.permissions.edit_power_levels'),
        },
        {
          location: {
            state: true,
            key: StateEvent.RoomTombstone,
          },
          name: t('features:space-settings.permissions.upgrade_space'),
        },
        {
          location: {
            state: true,
          },
          name: t('features:space-settings.permissions.other_settings'),
        },
      ],
    };

    const otherSettingsGroup: PermissionGroup = {
      name: t('features:space-settings.permissions.other'),
      items: [
        {
          location: {
            state: true,
            key: StateEvent.RoomServerAcl,
          },
          name: t('features:space-settings.permissions.change_server_acls'),
        },
      ],
    };

    return [
      messagesGroup,
      moderationGroup,
      roomOverviewGroup,
      roomSettingsGroup,
      otherSettingsGroup,
    ];
  }, [t]);

  return groups;
};
