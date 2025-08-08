import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './JoinAlias.scss';

import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';
import { join } from '../../../client/action/room';

import Text from '../../atoms/text/Text';
import IconButton from '../../atoms/button/IconButton';
import Button from '../../atoms/button/Button';
import Input from '../../atoms/input/Input';
import Spinner from '../../atoms/spinner/Spinner';
import Dialog from '../../molecules/dialog/Dialog';

import CrossIC from '../../../../public/res/ic/outlined/cross.svg';

import { useStore } from '../../hooks/useStore';
import { useRoomNavigate } from '../../hooks/useRoomNavigate';
import { useMatrixClient } from '../../hooks/useMatrixClient';

const ALIAS_OR_ID_REG = /^[#|!].+:.+\..+$/;

function JoinAliasContent({ term, requestClose }) {
  const { t } = useTranslation();
  const [process, setProcess] = useState(false);
  const [error, setError] = useState(undefined);

  const mx = useMatrixClient();
  const mountStore = useStore();

  const { navigateRoom } = useRoomNavigate();

  const openRoom = (roomId) => {
    navigateRoom(roomId);
    requestClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    mountStore.setItem(true);
    const alias = e.target.alias.value;
    if (alias?.trim() === '') return;
    if (alias.match(ALIAS_OR_ID_REG) === null) {
      setError(t('organisms.joinAlias.invalidAddress'));
      return;
    }
    setProcess(t('organisms.joinAlias.lookingForAddress'));
    setError(undefined);
    let via;
    if (alias.startsWith('#')) {
      try {
        const aliasData = await mx.getRoomIdForAlias(alias);
        via = aliasData?.servers.slice(0, 3) || [];
        if (mountStore.getItem()) {
          setProcess(t('organisms.joinAlias.joining', { alias }));
        }
      } catch (err) {
        if (!mountStore.getItem()) return;
        setProcess(false);
        setError(
          t('organisms.joinAlias.unableToFind', { alias })
        );
      }
    }
    try {
      const roomId = await join(mx, alias, false, via);
      if (!mountStore.getItem()) return;
      openRoom(roomId);
    } catch {
      if (!mountStore.getItem()) return;
      setProcess(false);
      setError(t('organisms.joinAlias.unableToJoin', { alias }));
    }
  };

  return (
    <form className="join-alias" onSubmit={handleSubmit}>
      <Input label={t('organisms.joinAlias.address')} value={term} name="alias" required autoFocus />
      {error && (
        <Text className="join-alias__error" variant="b3">
          {error}
        </Text>
      )}
      <div className="join-alias__btn">
        {process ? (
          <>
            <Spinner size="small" />
            <Text>{process}</Text>
          </>
        ) : (
          <Button variant="primary" type="submit">
            {t('organisms.joinAlias.join')}
          </Button>
        )}
      </div>
    </form>
  );
}
JoinAliasContent.defaultProps = {
  term: undefined,
};
JoinAliasContent.propTypes = {
  term: PropTypes.string,
  requestClose: PropTypes.func.isRequired,
};

function useWindowToggle() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const handleOpen = (term) => {
      setData({ term });
    };
    navigation.on(cons.events.navigation.JOIN_ALIAS_OPENED, handleOpen);
    return () => {
      navigation.removeListener(cons.events.navigation.JOIN_ALIAS_OPENED, handleOpen);
    };
  }, []);

  const onRequestClose = () => setData(null);

  return [data, onRequestClose];
}

function JoinAlias() {
  const { t } = useTranslation();
  const [data, requestClose] = useWindowToggle();

  return (
    <Dialog
      isOpen={data !== null}
      title={
        <Text variant="s1" weight="medium" primary>
          {t('organisms.joinAlias.title')}
        </Text>
      }
      contentOptions={<IconButton src={CrossIC} onClick={requestClose} tooltip={t('common.close')} />}
      onRequestClose={requestClose}
    >
      {data ? <JoinAliasContent term={data.term} requestClose={requestClose} /> : <div />}
    </Dialog>
  );
}

export default JoinAlias;
