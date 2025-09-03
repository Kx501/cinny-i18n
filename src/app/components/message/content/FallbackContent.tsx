import { Box, Icon, Icons, Text, as, color, config } from 'folds';
import React from 'react';
import { useTranslation } from 'react-i18next';

const warningStyle = { color: color.Warning.Main, opacity: config.opacity.P300 };
const criticalStyle = { color: color.Critical.Main, opacity: config.opacity.P300 };

export const MessageDeletedContent = as<'div', { children?: never; reason?: string }>(
  ({ reason, ...props }, ref) => {
    const { t } = useTranslation();
    return (
      <Box as="span" alignItems="Center" gap="100" style={warningStyle} {...props} ref={ref}>
        <Icon size="50" src={Icons.Delete} />
        {reason ? (
          <i>{t('components:message.content.this_message_has_been_deleted_reason', { reason })}</i>
        ) : (
          <i>{t('components:message.content.this_message_has_been_deleted')}</i>
        )}
      </Box>
    );
  }
);

export const MessageUnsupportedContent = as<'div', { children?: never }>(({ ...props }, ref) => {
  const { t } = useTranslation();
  return (
    <Box as="span" alignItems="Center" gap="100" style={criticalStyle} {...props} ref={ref}>
      <Icon size="50" src={Icons.Warning} />
      <i>{t('components:message.content.unsupported_message')}</i>
    </Box>
  );
});

export const MessageFailedContent = as<'div', { children?: never }>(({ ...props }, ref) => {
  const { t } = useTranslation();
  return (
    <Box as="span" alignItems="Center" gap="100" style={criticalStyle} {...props} ref={ref}>
      <Icon size="50" src={Icons.Warning} />
      <i>{t('components:message.content.failed_to_load_message')}</i>
    </Box>
  );
});

export const MessageBadEncryptedContent = as<'div', { children?: never }>(({ ...props }, ref) => {
  const { t } = useTranslation();
  return (
    <Box as="span" alignItems="Center" gap="100" style={warningStyle} {...props} ref={ref}>
      <Icon size="50" src={Icons.Lock} />
      <i>{t('components:message.content.unable_to_decrypt_message')}</i>
    </Box>
  );
});

export const MessageNotDecryptedContent = as<'div', { children?: never }>(({ ...props }, ref) => {
  const { t } = useTranslation();
  return (
    <Box as="span" alignItems="Center" gap="100" style={warningStyle} {...props} ref={ref}>
      <Icon size="50" src={Icons.Lock} />
      <i>{t('components:message.content.this_message_is_not_decrypted_yet')}</i>
    </Box>
  );
});

export const MessageBrokenContent = as<'div', { children?: never }>(({ ...props }, ref) => {
  const { t } = useTranslation();
  return (
    <Box as="span" alignItems="Center" gap="100" style={criticalStyle} {...props} ref={ref}>
      <Icon size="50" src={Icons.Warning} />
      <i>{t('components:message.content.broken_message')}</i>
    </Box>
  );
});

export const MessageEmptyContent = as<'div', { children?: never }>(({ ...props }, ref) => {
  const { t } = useTranslation();
  return (
    <Box as="span" alignItems="Center" gap="100" style={criticalStyle} {...props} ref={ref}>
      <Icon size="50" src={Icons.Warning} />
      <i>{t('components:message.content.empty_message')}</i>
    </Box>
  );
});

export const MessageEditedContent = as<'span', { children?: never }>(({ ...props }, ref) => {
  const { t } = useTranslation();
  return (
    <Text as="span" size="T200" priority="300" {...props} ref={ref}>
      {t('components:message.content.edited')}
    </Text>
  );
});
