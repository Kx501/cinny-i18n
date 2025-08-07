import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSpacing } from '../state/settings';

export type MessageSpacingItem = {
  name: string;
  spacing: MessageSpacing;
};

export const useMessageSpacingItems = (): MessageSpacingItem[] => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        spacing: '0',
        name: t('settings.messages.spacingOptions.None'),
      },
      {
        spacing: '100',
        name: t('settings.messages.spacingOptions.Ultra Small'),
      },
      {
        spacing: '200',
        name: t('settings.messages.spacingOptions.Extra Small'),
      },
      {
        spacing: '300',
        name: t('settings.messages.spacingOptions.Small'),
      },
      {
        spacing: '400',
        name: t('settings.messages.spacingOptions.Normal'),
      },
      {
        spacing: '500',
        name: t('settings.messages.spacingOptions.Large'),
      },
    ],
    [t]
  );
};
