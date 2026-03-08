import React from 'react';
import { Box, Text, Icon, Icons, config, IconSrc } from 'folds';
import { useTranslation } from 'react-i18next';
import { SequenceCard } from '../sequence-card';
import { SettingTile } from '../setting-tile';
import { CreateRoomAccess } from './types';

type CreateRoomAccessSelectorProps = {
  value?: CreateRoomAccess;
  onSelect: (value: CreateRoomAccess) => void;
  canRestrict?: boolean;
  disabled?: boolean;
  getIcon: (access: CreateRoomAccess) => IconSrc;
};
export function CreateRoomAccessSelector({
  value,
  onSelect,
  canRestrict,
  disabled,
  getIcon,
}: CreateRoomAccessSelectorProps) {
  const { t } = useTranslation();
  return (
    <Box shrink="No" direction="Column" gap="100">
      {canRestrict && (
        <SequenceCard
          style={{ padding: config.space.S300 }}
          variant={value === CreateRoomAccess.Restricted ? 'Primary' : 'SurfaceVariant'}
          direction="Column"
          gap="100"
          as="button"
          type="button"
          aria-pressed={value === CreateRoomAccess.Restricted}
          onClick={() => onSelect(CreateRoomAccess.Restricted)}
          disabled={disabled}
        >
          <SettingTile
            before={<Icon size="400" src={getIcon(CreateRoomAccess.Restricted)} />}
            after={value === CreateRoomAccess.Restricted && <Icon src={Icons.Check} />}
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
        variant={value === CreateRoomAccess.Private ? 'Primary' : 'SurfaceVariant'}
        direction="Column"
        gap="100"
        as="button"
        type="button"
        aria-pressed={value === CreateRoomAccess.Private}
        onClick={() => onSelect(CreateRoomAccess.Private)}
        disabled={disabled}
      >
        <SettingTile
          before={<Icon size="400" src={getIcon(CreateRoomAccess.Private)} />}
          after={value === CreateRoomAccess.Private && <Icon src={Icons.Check} />}
        >
          <Text size="H6">{t('components:create-room.private')}</Text>
          <Text size="T300" priority="300">
            {t('components:create-room.only_people_with_invite_can_join')}
          </Text>
        </SettingTile>
      </SequenceCard>
      <SequenceCard
        style={{ padding: config.space.S300 }}
        variant={value === CreateRoomAccess.Public ? 'Primary' : 'SurfaceVariant'}
        direction="Column"
        gap="100"
        as="button"
        type="button"
        aria-pressed={value === CreateRoomAccess.Public}
        onClick={() => onSelect(CreateRoomAccess.Public)}
        disabled={disabled}
      >
        <SettingTile
          before={<Icon size="400" src={getIcon(CreateRoomAccess.Public)} />}
          after={value === CreateRoomAccess.Public && <Icon src={Icons.Check} />}
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
