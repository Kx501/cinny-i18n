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
        name: t('hooks:none'),
      },
      {
        spacing: '100',
        name: t('hooks:ultra_small'),
      },
      {
        spacing: '200',
        name: t('hooks:extra_small'),
      },
      {
        spacing: '300',
        name: t('hooks:small'),
      },
      {
        spacing: '400',
        name: t('hooks:normal'),
      },
      {
        spacing: '500',
        name: t('hooks:large'),
      },
    ],
    [t]
  );
};
