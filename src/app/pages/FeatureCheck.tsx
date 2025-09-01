import React, { ReactNode, useEffect } from 'react';
import { Box, Dialog, Text, config } from 'folds';
import { useTranslation } from 'react-i18next';
import { AsyncStatus, useAsyncCallback } from '../hooks/useAsyncCallback';
import { checkIndexedDBSupport } from '../utils/featureCheck';
import { SplashScreen } from '../components/splash-screen';

export function FeatureCheck({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [idbSupportState, checkIDBSupport] = useAsyncCallback(checkIndexedDBSupport);

  useEffect(() => {
    checkIDBSupport();
  }, [checkIDBSupport]);

  if (idbSupportState.status === AsyncStatus.Success && idbSupportState.data === false) {
    return (
      <SplashScreen>
        <Box grow="Yes" alignItems="Center" justifyContent="Center">
          <Dialog>
            <Box style={{ padding: config.space.S400 }} direction="Column" gap="400">
              <Text>{t('pages:missing_browser_feature')}</Text>
              <Text size="T300" priority="400">
                {t('pages:no_indexeddb_support')}
              </Text>
              <Text size="T200">
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {t('pages:what_is_indexeddb')}
                </a>
              </Text>
            </Box>
          </Dialog>
        </Box>
      </SplashScreen>
    );
  }

  return children;
}
