import React, { MouseEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, config, Icon, Icons, Menu, PopOut, RectCords, Text } from 'folds';
import FocusTrap from 'focus-trap-react';
import { useNavigate } from 'react-router-dom';
import { SidebarAvatar, SidebarItem, SidebarItemTooltip } from '../../../components/sidebar';
import { stopPropagation } from '../../../utils/keyboard';
import { SequenceCard } from '../../../components/sequence-card';
import { SettingTile } from '../../../components/setting-tile';
import { ContainerColor } from '../../../styles/ContainerColor.css';
import { openJoinAlias } from '../../../../client/action/navigation';
import { getCreatePath } from '../../pathUtils';
import { useCreateSelected } from '../../../hooks/router/useCreateSelected';

export function CreateTab() {
  const { t } = useTranslation();
  const createSelected = useCreateSelected();

  const navigate = useNavigate();
  const [menuCords, setMenuCords] = useState<RectCords>();

  const handleMenu: MouseEventHandler<HTMLButtonElement> = (evt) => {
    setMenuCords(menuCords ? undefined : evt.currentTarget.getBoundingClientRect());
  };

  const handleCreateSpace = () => {
    navigate(getCreatePath());
    setMenuCords(undefined);
  };

  const handleJoinWithAddress = () => {
    openJoinAlias();
    setMenuCords(undefined);
  };

  return (
    <SidebarItem active={createSelected}>
      <SidebarItemTooltip tooltip={t('client.sidebar.addSpace')}>
        {(triggerRef) => (
          <PopOut
            anchor={menuCords}
            position="Right"
            align="Center"
            content={
              <FocusTrap
                focusTrapOptions={{
                  returnFocusOnDeactivate: false,
                  initialFocus: false,
                  onDeactivate: () => setMenuCords(undefined),
                  clickOutsideDeactivates: true,
                  isKeyForward: (evt: KeyboardEvent) =>
                    evt.key === 'ArrowDown' || evt.key === 'ArrowRight',
                  isKeyBackward: (evt: KeyboardEvent) =>
                    evt.key === 'ArrowUp' || evt.key === 'ArrowLeft',
                  escapeDeactivates: stopPropagation,
                }}
              >
                <Menu>
                  <Box direction="Column">
                    <SequenceCard
                      style={{ padding: config.space.S300 }}
                      variant="Surface"
                      direction="Column"
                      gap="100"
                      radii="0"
                      as="button"
                      type="button"
                      onClick={handleCreateSpace}
                    >
                      <SettingTile before={<Icon size="400" src={Icons.Space} />}>
                        <Text size="H6">{t('client.sidebar.createSpace')}</Text>
                        <Text size="T300" priority="300">
                          {t('client.sidebar.buildCommunity')}
                        </Text>
                      </SettingTile>
                    </SequenceCard>
                    <SequenceCard
                      style={{ padding: config.space.S300 }}
                      variant="Surface"
                      direction="Column"
                      gap="100"
                      radii="0"
                      as="button"
                      type="button"
                      onClick={handleJoinWithAddress}
                    >
                      <SettingTile before={<Icon size="400" src={Icons.Link} />}>
                        <Text size="H6">{t('client.sidebar.joinWithAddress')}</Text>
                        <Text size="T300" priority="300">
                          {t('client.sidebar.becomePart')}
                        </Text>
                      </SettingTile>
                    </SequenceCard>
                  </Box>
                </Menu>
              </FocusTrap>
            }
          >
            <SidebarAvatar
              className={menuCords ? ContainerColor({ variant: 'Surface' }) : undefined}
              as="button"
              ref={triggerRef}
              outlined
              onClick={handleMenu}
            >
              <Icon src={Icons.Plus} />
            </SidebarAvatar>
          </PopOut>
        )}
      </SidebarItemTooltip>
    </SidebarItem>
  );
}
