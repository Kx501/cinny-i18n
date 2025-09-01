import React, { useEffect } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { ClientConfigLoader } from '../components/ClientConfigLoader';
import { ClientConfigProvider } from '../hooks/useClientConfig';
import { ConfigConfigError, ConfigConfigLoading } from './ConfigConfig';
import { FeatureCheck } from './FeatureCheck';
import { createRouter } from './Router';
import { ScreenSizeProvider, useScreenSize } from '../hooks/useScreenSize';

const queryClient = new QueryClient();

const useLastNodeToDetectReactPortalEntry = () => {
  useEffect(() => {
    const lastDiv = document.createElement('div');
    lastDiv.setAttribute('data-last-node', 'true');
    document.body.appendChild(lastDiv);
  }, []);
};

function App() {
  const screenSize = useScreenSize();

  useLastNodeToDetectReactPortalEntry();

  return (
    <ScreenSizeProvider value={screenSize}>
      <FeatureCheck>
        <ClientConfigLoader
          fallback={() => <ConfigConfigLoading />}
          error={(err, retry, ignore) => (
            <ConfigConfigError error={err} retry={retry} ignore={ignore} />
          )}
        >
          {(clientConfig) => (
            <ClientConfigProvider value={clientConfig}>
              <QueryClientProvider client={queryClient}>
                <JotaiProvider>
                  <RouterProvider router={createRouter(clientConfig, screenSize)} />
                </JotaiProvider>
                <ReactQueryDevtools initialIsOpen={false} />
              </QueryClientProvider>
            </ClientConfigProvider>
          )}
        </ClientConfigLoader>
      </FeatureCheck>
    </ScreenSizeProvider>
  );
}

export default App;
