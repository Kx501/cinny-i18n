import React from 'react';
import { Box, Icon, Icons, Scroll, IconButton } from 'folds';
import {
  Page,
  PageContent,
  PageContentCenter,
  PageHeader,
  PageHero,
  PageHeroSection,
} from '../../../components/page';
import { ScreenSize, useScreenSizeContext } from '../../../hooks/useScreenSize';
import { BackRouteHandler } from '../../../components/BackRouteHandler';
import { CreateRoomForm } from '../../../features/create-room';
import { useRoomNavigate } from '../../../hooks/useRoomNavigate';
import { useTranslation } from 'react-i18next';

export function HomeCreateRoom() {
  const { t } = useTranslation();
  const screenSize = useScreenSizeContext();

  const { navigateRoom } = useRoomNavigate();

  return (
    <Page>
      {screenSize === ScreenSize.Mobile && (
        <PageHeader balance outlined={false}>
          <Box grow="Yes" alignItems="Center" gap="200">
            <BackRouteHandler>
              {(onBack) => (
                <IconButton onClick={onBack}>
                  <Icon src={Icons.ArrowLeft} />
                </IconButton>
              )}
            </BackRouteHandler>
          </Box>
        </PageHeader>
      )}
      <Box grow="Yes">
        <Scroll hideTrack visibility="Hover">
          <PageContent>
            <PageContentCenter>
              <PageHeroSection>
                <Box direction="Column" gap="700">
                  <PageHero
                    icon={<Icon size="600" src={Icons.Hash} />}
                    title={t('client.home.createRoomTitle')}
                    subTitle={t('client.home.createRoomSubtitle')}
                  />
                  <CreateRoomForm onCreate={navigateRoom} />
                </Box>
              </PageHeroSection>
            </PageContentCenter>
          </PageContent>
        </Scroll>
      </Box>
    </Page>
  );
}
