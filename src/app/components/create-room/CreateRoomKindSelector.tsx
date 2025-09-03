import React from 'react';
import { Box, Text, Icon, Icons, config, IconSrc } from 'folds';
import { useTranslation } from 'react-i18next';
import { SequenceCard } from '../sequence-card';
import { SettingTile } from '../setting-tile';

export enum CreateRoomKind {
  Private = 'private',
  Restricted = 'restricted',
  Public = 'public',
}
type CreateRoomKindSelectorProps = {
  value?: CreateRoomKind;
  onSelect: (value: CreateRoomKind) => void;
  canRestrict?: boolean;
  disabled?: boolean;
  getIcon: (kind: CreateRoomKind) => IconSrc;
};
export function CreateRoomKindSelector({
  value,
  onSelect,
  canRestrict,
  disabled,
  getIcon,
}: CreateRoomKindSelectorProps) {
  const { t } = useTranslation();

  return (
    <Box shrink="No" direction="Column" gap="100">
      {canRestrict && (
        <SequenceCard
          style={{ padding: config.space.S300 }}
          variant={value === CreateRoomKind.Restricted ? 'Primary' : 'SurfaceVariant'}
          direction="Column"
          gap="100"
          as="button"
          type="button"
          aria-pressed={value === CreateRoomKind.Restricted}
          onClick={() => onSelect(CreateRoomKind.Restricted)}
          disabled={disabled}
        >
          <SettingTile
            before={<Icon size="400" src={getIcon(CreateRoomKind.Restricted)} />}
            after={value === CreateRoomKind.Restricted && <Icon src={Icons.Check} />}
          >
            <Text size="H6">{t('components:create-room.restricted')}</Text>
            <Text size="T300" priority="300">
              {t('components:create-room.only_member_of_parent_space_can_join')}
            </Text>
          </SettingTile>
        </SequenceCard>
      )}
      <SequenceCard
        style={{ padding: config.space.S300 }}
        variant={value === CreateRoomKind.Private ? 'Primary' : 'SurfaceVariant'}
        direction="Column"
        gap="100"
        as="button"
        type="button"
        aria-pressed={value === CreateRoomKind.Private}
        onClick={() => onSelect(CreateRoomKind.Private)}
        disabled={disabled}
      >
        <SettingTile
          before={<Icon size="400" src={getIcon(CreateRoomKind.Private)} />}
          after={value === CreateRoomKind.Private && <Icon src={Icons.Check} />}
        >
          <Text size="H6">{t('components:create-room.private')}</Text>
          <Text size="T300" priority="300">
            {t('components:create-room.only_people_with_invite_can_join')}
          </Text>
        </SettingTile>
      </SequenceCard>
      <SequenceCard
        style={{ padding: config.space.S300 }}
        variant={value === CreateRoomKind.Public ? 'Primary' : 'SurfaceVariant'}
        direction="Column"
        gap="100"
        as="button"
        type="button"
        aria-pressed={value === CreateRoomKind.Public}
        onClick={() => onSelect(CreateRoomKind.Public)}
        disabled={disabled}
      >
        <SettingTile
          before={<Icon size="400" src={getIcon(CreateRoomKind.Public)} />}
          after={value === CreateRoomKind.Public && <Icon src={Icons.Check} />}
        >
          <Text size="H6">{t('components:create-room.public')}</Text>
          <Text size="T300" priority="300">
            {t('components:create-room.anyone_with_the_address_can_join')}
          </Text>
        </SettingTile>
      </SequenceCard>
    </Box>
  );
}
