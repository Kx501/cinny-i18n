import { createContext, useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useElementSizeObserver } from './useElementSizeObserver';

export const TABLET_BREAKPOINT = 1124;
export const MOBILE_BREAKPOINT = 750;

export enum ScreenSize {
  Desktop = 'Desktop',
  Tablet = 'Tablet',
  Mobile = 'Mobile',
}

export const getScreenSize = (width: number): ScreenSize => {
  if (width > TABLET_BREAKPOINT) return ScreenSize.Desktop;
  if (width > MOBILE_BREAKPOINT) return ScreenSize.Tablet;
  return ScreenSize.Mobile;
};

export const useScreenSize = (): ScreenSize => {
  const [size, setSize] = useState<ScreenSize>(getScreenSize(document.body.clientWidth));

  useElementSizeObserver(
    useCallback(() => document.body, []),
    useCallback((width) => setSize(getScreenSize(width)), [])
  );

  return size;
};

export const useScreenSizeLabels = (): Record<ScreenSize, string> => {
  const { t } = useTranslation();

  return {
    [ScreenSize.Desktop]: t('hooks:desktop'),
    [ScreenSize.Tablet]: t('hooks:tablet'),
    [ScreenSize.Mobile]: t('hooks:mobile'),
  };
};

const ScreenSizeContext = createContext<ScreenSize | null>(null);
export const ScreenSizeProvider = ScreenSizeContext.Provider;

export const useScreenSizeContext = (): ScreenSize => {
  const { t } = useTranslation();
  const screenSize = useContext(ScreenSizeContext);
  if (screenSize === null) {
    throw new Error(t('hooks:screen_size_not_provided'));
  }
  return screenSize;
};
