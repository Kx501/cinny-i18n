import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageLayout } from '../state/settings';

export type MessageLayoutItem = {
  name: string;
  layout: MessageLayout;
};

export const useMessageLayoutItems = (): MessageLayoutItem[] => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        layout: MessageLayout.Modern,
        name: t('settings.messages.layoutOptions.Modern'),
      },
      {
        layout: MessageLayout.Compact,
        name: t('settings.messages.layoutOptions.Compact'),
      },
      {
        layout: MessageLayout.Bubble,
        name: t('settings.messages.layoutOptions.Bubble'),
      },
    ],
    [t]
  );
};
