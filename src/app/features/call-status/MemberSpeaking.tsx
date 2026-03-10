import { Room } from 'matrix-js-sdk';
import React from 'react';
import { Box, Icon, Icons, Text } from 'folds';
import { useTranslation } from 'react-i18next';
import { getMemberDisplayName } from '../../utils/room';
import { getMxIdLocalPart } from '../../utils/matrix';

type MemberSpeakingProps = {
  room: Room;
  speakers: Set<string>;
};
export function MemberSpeaking({ room, speakers }: MemberSpeakingProps) {
  const { t } = useTranslation();
  const speakingNames = Array.from(speakers).map(
    (userId) => getMemberDisplayName(room, userId) ?? getMxIdLocalPart(userId) ?? userId
  );
  return (
    <Box alignItems="Center" gap="100">
      <Icon size="100" src={Icons.Mic} filled />
      <Text size="T200" truncate>
        {speakingNames.length === 1 && (
          <>
            <b>{speakingNames[0]}</b>
            <Text as="span" size="Inherit" priority="300">
              {t('features:call-status.is_speaking')}
            </Text>
          </>
        )}
        {speakingNames.length === 2 && (
          <>
            <b>{speakingNames[0]}</b>
            <Text as="span" size="Inherit" priority="300">
              {' '}{t('features:room.and')}{' '}
            </Text>
            <b>{speakingNames[1]}</b>
            <Text as="span" size="Inherit" priority="300">
              {t('features:call-status.are_speaking')}
            </Text>
          </>
        )}
        {speakingNames.length === 3 && (
          <>
            <b>{speakingNames[0]}</b>
            <Text as="span" size="Inherit" priority="300">
              {', '}
            </Text>
            <b>{speakingNames[1]}</b>
            <Text as="span" size="Inherit" priority="300">
              {' '}{t('features:room.and')}{' '}
            </Text>
            <b>{speakingNames[2]}</b>
            <Text as="span" size="Inherit" priority="300">
              {t('features:call-status.are_speaking')}
            </Text>
          </>
        )}
        {speakingNames.length > 3 && (
          <>
            <b>{speakingNames[0]}</b>
            <Text as="span" size="Inherit" priority="300">
              {', '}
            </Text>
            <b>{speakingNames[1]}</b>
            <Text as="span" size="Inherit" priority="300">
              {', '}
            </Text>
            <b>{speakingNames[2]}</b>
            <Text as="span" size="Inherit" priority="300">
              {' '}{t('features:room.and')}{' '}
            </Text>
            <b>{t('features:call-status.others', { count: speakingNames.length - 3 })}</b>
            <Text as="span" size="Inherit" priority="300">
              {t('features:call-status.are_speaking')}
            </Text>
          </>
        )}
      </Text>
    </Box>
  );
}
