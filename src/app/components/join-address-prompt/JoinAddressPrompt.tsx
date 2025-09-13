import React, { FormEventHandler, useState } from 'react';
import FocusTrap from 'focus-trap-react';
import {
  Dialog,
  Overlay,
  OverlayCenter,
  OverlayBackdrop,
  Header,
  config,
  Box,
  Text,
  IconButton,
  Icon,
  Icons,
  Button,
  Input,
  color,
} from 'folds';
import { stopPropagation } from '../../utils/keyboard';
import { isRoomAlias, isRoomId } from '../../utils/matrix';
import { parseMatrixToRoom, parseMatrixToRoomEvent, testMatrixTo } from '../../plugins/matrix-to';
import { tryDecodeURIComponent } from '../../utils/dom';
import { useTranslation } from 'react-i18next';

type JoinAddressProps = {
  onOpen: (roomIdOrAlias: string, via?: string[], eventId?: string) => void;
  onCancel: () => void;
};
export function JoinAddressPrompt({ onOpen, onCancel }: JoinAddressProps) {
  const [invalid, setInvalid] = useState(false);
  const { t } = useTranslation();

  const handleSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault();
    setInvalid(false);

    const target = evt.target as HTMLFormElement | undefined;
    const addressInput = target?.addressInput as HTMLInputElement | undefined;
    const address = addressInput?.value.trim();
    if (!address) return;

    if (isRoomId(address) || isRoomAlias(address)) {
      onOpen(address);
      return;
    }

    if (testMatrixTo(address)) {
      const decodedAddress = tryDecodeURIComponent(address);
      const toRoom = parseMatrixToRoom(decodedAddress);
      if (toRoom) {
        onOpen(toRoom.roomIdOrAlias, toRoom.viaServers);
        return;
      }

      const toEvent = parseMatrixToRoomEvent(decodedAddress);
      if (toEvent) {
        onOpen(toEvent.roomIdOrAlias, toEvent.viaServers, toEvent.eventId);
        return;
      }
    }

    setInvalid(true);
  };

  return (
    <Overlay open backdrop={<OverlayBackdrop />}>
      <OverlayCenter>
        <FocusTrap
          focusTrapOptions={{
            initialFocus: false,
            onDeactivate: onCancel,
            clickOutsideDeactivates: true,
            escapeDeactivates: stopPropagation,
          }}
        >
          <Dialog variant="Surface">
            <Header
              style={{
                padding: `0 ${config.space.S200} 0 ${config.space.S400}`,
              }}
              variant="Surface"
              size="500"
            >
              <Box grow="Yes">
                <Text size="H4">{t('components:join-address-prompt.join_address')}</Text>
              </Box>
              <IconButton size="300" onClick={onCancel} radii="300">
                <Icon src={Icons.Cross} />
              </IconButton>
            </Header>
            <Box
              as="form"
              onSubmit={handleSubmit}
              style={{ padding: config.space.S400, paddingTop: 0 }}
              direction="Column"
              gap="400"
            >
              <Box direction="Column" gap="200">
                <Text priority="400" size="T300">
                  {t('components:join-address-prompt.enter_public_address')}
                </Text>
                <Text as="ul" size="T200" priority="300" style={{ paddingLeft: config.space.S400 }}>
                  <li>{t('components:join-address-prompt.community_server')}</li>
                  <li>{t('components:join-address-prompt.https_matrix_to_community_server')}</li>
                  <li>{t('components:join-address-prompt.https_matrix_to')}</li>
                </Text>
              </Box>
              <Box direction="Column" gap="100">
                <Text size="L400">{t('components:join-address-prompt.address')}</Text>
                <Input
                  size="500"
                  autoFocus
                  name="addressInput"
                  variant="Background"
                  placeholder={t('components:join-address-prompt.community_server')}
                  required
                />
                {invalid && (
                  <Text size="T200" style={{ color: color.Critical.Main }}>
                    <b>{t('components:join-address-prompt.invalid_address')}</b>
                  </Text>
                )}
              </Box>
              <Button type="submit" variant="Primary">
                <Text size="B400">{t('components:join-address-prompt.open')}</Text>
              </Button>
            </Box>
          </Dialog>
        </FocusTrap>
      </OverlayCenter>
    </Overlay>
  );
}
