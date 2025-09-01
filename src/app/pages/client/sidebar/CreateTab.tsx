import React, { MouseEventHandler, useState } from 'react';
import { Box, config, Icon, Icons, Menu, PopOut, RectCords, Text } from 'folds';
import { useTranslation } from 'react-i18next';
import FocusTrap from 'focus-trap-react';
import { useNavigate } from 'react-router-dom';
import { SidebarAvatar, SidebarItem, SidebarItemTooltip } from '../../../components/sidebar';
import { stopPropagation } from '../../../utils/keyboard';
import { SequenceCard } from '../../../components/sequence-card';
import { SettingTile } from '../../../components/setting-tile';
import { ContainerColor } from '../../../styles/ContainerColor.css';
import {
  encodeSearchParamValueArray,
  getCreatePath,
  getSpacePath,
  withSearchParam,
} from '../../pathUtils';
import { useCreateSelected } from '../../../hooks/router/useCreateSelected';
import { JoinAddressPrompt } from '../../../components/join-address-prompt';
import { _RoomSearchParams } from '../../paths';

export function CreateTab() {
  const { t } = useTranslation();
  const createSelected = useCreateSelected();

  const navigate = useNavigate();
  const [menuCords, setMenuCords] = useState<RectCords>();
  const [joinAddress, setJoinAddress] = useState(false);

  const handleMenu: MouseEventHandler<HTMLButtonElement> = (evt) => {
    setMenuCords(menuCords ? undefined : evt.currentTarget.getBoundingClientRect());
  };

  const handleCreateSpace = () => {
    navigate(getCreatePath());
    setMenuCords(undefined);
  };

  const handleJoinWithAddress = () => {
    setJoinAddress(true);
    setMenuCords(undefined);
  };

  return (
    <SidebarItem active={createSelected}>
      <SidebarItemTooltip tooltip={t('pages:client.sidebar.add_space')}>
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
                        <Text size="H6">{t('pages:client.sidebar.create_space')}</Text>
                        <Text size="T300" priority="300">
                          {t('pages:client.sidebar.build_a_space_for_your_community')}
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
                        <Text size="H6">{t('pages:client.sidebar.join_with_address')}</Text>
                        <Text size="T300" priority="300">
                          {t('pages:client.sidebar.become_a_part_of_existing_community')}
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
            {joinAddress && (
              <JoinAddressPrompt
                onCancel={() => setJoinAddress(false)}
                onOpen={(roomIdOrAlias, viaServers) => {
                  setJoinAddress(false);
                  const path = getSpacePath(roomIdOrAlias);
                  navigate(
                    viaServers
                      ? withSearchParam<_RoomSearchParams>(path, {
                        viaServers: encodeSearchParamValueArray(viaServers),
                      })
                      : path
                  );
                }}
              />
            )}
          </PopOut>
        )}
      </SidebarItemTooltip>
    </SidebarItem>
  );
}
