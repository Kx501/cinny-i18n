import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageEvent, StateEvent } from '../../../../types/matrix/room';
import { PermissionGroup } from '../../common-settings/permissions';

export const usePermissionGroups = (): PermissionGroup[] => {
  const { t } = useTranslation();
  const groups: PermissionGroup[] = useMemo(() => {
    const messagesGroup: PermissionGroup = {
      name: t('features:room-settings.permissions.messages'),
      items: [
        {
          location: {
            key: MessageEvent.RoomMessage,
          },
          name: t('features:room-settings.permissions.send_messages'),
        },
        {
          location: {
            key: MessageEvent.Sticker,
          },
          name: t('features:room-settings.permissions.send_stickers'),
        },
        {
          location: {
            key: MessageEvent.Reaction,
          },
          name: t('features:room-settings.permissions.send_reactions'),
        },
        {
          location: {
            notification: true,
            key: 'room',
          },
          name: t('features:room-settings.permissions.ping_room'),
        },
        {
          location: {
            state: true,
            key: StateEvent.RoomPinnedEvents,
          },
          name: t('features:room-settings.permissions.pin_messages'),
        },
        {
          location: {},
          name: t('features:room-settings.permissions.other_message_events'),
        },
      ],
    };

    const moderationGroup: PermissionGroup = {
      name: t('features:room-settings.permissions.moderation'),
      items: [
        {
          location: {
            action: true,
            key: 'invite',
          },
          name: t('features:room-settings.permissions.invite'),
        },
        {
          location: {
            action: true,
            key: 'kick',
          },
          name: t('features:room-settings.permissions.kick'),
        },
        {
          location: {
            action: true,
            key: 'ban',
          },
          name: t('features:room-settings.permissions.ban'),
        },
        {
          location: {
            action: true,
            key: 'redact',
          },
          name: t('features:room-settings.permissions.delete_others_messages'),
        },
        {
          location: {
            key: MessageEvent.RoomRedaction,
          },
          name: t('features:room-settings.permissions.delete_self_messages'),
        },
      ],
    };

    const roomOverviewGroup: PermissionGroup = {
      name: t('features:room-settings.permissions.room_overview'),
      items: [
        {
          location: {
            state: true,
            key: StateEvent.RoomAvatar,
          },
          name: t('features:room-settings.permissions.room_avatar'),
        },
        {
          location: {
            state: true,
            key: StateEvent.RoomName,
          },
          name: t('features:room-settings.permissions.room_name'),
        },
        {
          location: {
            state: true,
            key: StateEvent.RoomTopic,
          },
          name: t('features:room-settings.permissions.room_topic'),
        },
      ],
    };

    const roomSettingsGroup: PermissionGroup = {
      name: t('features:room-settings.permissions.settings'),
      items: [
        {
          location: {
            state: true,
            key: StateEvent.RoomJoinRules,
          },
          name: t('features:room-settings.permissions.change_room_access'),
        },
        {
          location: {
            state: true,
            key: StateEvent.RoomCanonicalAlias,
          },
          name: t('features:room-settings.permissions.publish_address'),
        },
        {
          location: {
            state: true,
            key: StateEvent.RoomPowerLevels,
          },
          name: t('features:room-settings.permissions.change_all_permission'),
        },
        {
          location: {
            state: true,
            key: StateEvent.PowerLevelTags,
          },
          name: t('features:room-settings.permissions.edit_power_levels'),
        },
        {
          location: {
            state: true,
            key: StateEvent.RoomEncryption,
          },
          name: t('features:room-settings.permissions.enable_encryption'),
        },
        {
          location: {
            state: true,
            key: StateEvent.RoomHistoryVisibility,
          },
          name: t('features:room-settings.permissions.history_visibility'),
        },
        {
          location: {
            state: true,
            key: StateEvent.RoomTombstone,
          },
          name: t('features:room-settings.permissions.upgrade_room'),
        },
        {
          location: {
            state: true,
          },
          name: t('features:room-settings.permissions.other_settings'),
        },
      ],
    };

    const otherSettingsGroup: PermissionGroup = {
      name: t('features:room-settings.permissions.other'),
      items: [
        {
          location: {
            state: true,
            key: StateEvent.RoomServerAcl,
          },
          name: t('features:room-settings.permissions.change_server_acls'),
        },
        {
          location: {
            state: true,
            key: 'im.vector.modular.widgets',
          },
          name: t('features:room-settings.permissions.modify_widgets'),
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
