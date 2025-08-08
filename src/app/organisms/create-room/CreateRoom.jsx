import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './CreateRoom.scss';

import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';
import { openReusableContextMenu } from '../../../client/action/navigation';
import * as roomActions from '../../../client/action/room';
import { isRoomAliasAvailable, getIdServer } from '../../../util/matrixUtil';
import { getEventCords } from '../../../util/common';

import Text from '../../atoms/text/Text';
import Button from '../../atoms/button/Button';
import Toggle from '../../atoms/button/Toggle';
import IconButton from '../../atoms/button/IconButton';
import { MenuHeader, MenuItem } from '../../atoms/context-menu/ContextMenu';
import Input from '../../atoms/input/Input';
import Spinner from '../../atoms/spinner/Spinner';
import SegmentControl from '../../atoms/segmented-controls/SegmentedControls';
import Dialog from '../../molecules/dialog/Dialog';
import SettingTile from '../../molecules/setting-tile/SettingTile';

import HashPlusIC from '../../../../public/res/ic/outlined/hash-plus.svg';
import SpacePlusIC from '../../../../public/res/ic/outlined/space-plus.svg';
import HashIC from '../../../../public/res/ic/outlined/hash.svg';
import HashLockIC from '../../../../public/res/ic/outlined/hash-lock.svg';
import HashGlobeIC from '../../../../public/res/ic/outlined/hash-globe.svg';
import SpaceIC from '../../../../public/res/ic/outlined/space.svg';
import SpaceLockIC from '../../../../public/res/ic/outlined/space-lock.svg';
import SpaceGlobeIC from '../../../../public/res/ic/outlined/space-globe.svg';
import ChevronBottomIC from '../../../../public/res/ic/outlined/chevron-bottom.svg';
import CrossIC from '../../../../public/res/ic/outlined/cross.svg';
import { useRoomNavigate } from '../../hooks/useRoomNavigate';
import { useMatrixClient } from '../../hooks/useMatrixClient';

function CreateRoomContent({ isSpace, parentId, onRequestClose }) {
  const { t } = useTranslation();
  const [joinRule, setJoinRule] = useState(parentId ? 'restricted' : 'invite');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [creatingError, setCreatingError] = useState(null);
  const { navigateRoom, navigateSpace } = useRoomNavigate();

  const [isValidAddress, setIsValidAddress] = useState(null);
  const [addressValue, setAddressValue] = useState(undefined);
  const [roleIndex, setRoleIndex] = useState(0);

  const addressRef = useRef(null);

  const mx = useMatrixClient();
  const userHs = getIdServer(mx.getUserId());

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const { target } = evt;

    if (isCreatingRoom) return;
    setIsCreatingRoom(true);
    setCreatingError(null);

    const name = target.name.value;
    let topic = target.topic.value;
    if (topic.trim() === '') topic = undefined;
    let roomAlias;
    if (joinRule === 'public') {
      roomAlias = addressRef?.current?.value;
      if (roomAlias.trim() === '') roomAlias = undefined;
    }

    const powerLevel = roleIndex === 1 ? 101 : undefined;

    try {
      const data = await roomActions.createRoom(mx, {
        name,
        topic,
        joinRule,
        alias: roomAlias,
        isEncrypted: isSpace || joinRule === 'public' ? false : isEncrypted,
        powerLevel,
        isSpace,
        parentId,
      });
      setIsCreatingRoom(false);
      setCreatingError(null);
      setIsValidAddress(null);
      setAddressValue(undefined);
      onRequestClose();
      if (isSpace) {
        navigateSpace(data.room_id);
      } else {
        navigateRoom(data.room_id);
      }
    } catch (e) {
      if (e.message === 'M_UNKNOWN: Invalid characters in room alias') {
        setCreatingError(t('organisms.createRoom.invalidCharactersInAddress'));
        setIsValidAddress(false);
      } else if (e.message === 'M_ROOM_IN_USE: Room alias already taken') {
        setCreatingError(t('organisms.createRoom.addressAlreadyInUse'));
        setIsValidAddress(false);
      } else setCreatingError(e.message);
      setIsCreatingRoom(false);
    }
  };

  const validateAddress = (e) => {
    const myAddress = e.target.value;
    setIsValidAddress(null);
    setAddressValue(e.target.value);
    setCreatingError(null);

    setTimeout(async () => {
      if (myAddress !== addressRef.current.value) return;
      const roomAlias = addressRef.current.value;
      if (roomAlias === '') return;
      const roomAddress = `#${roomAlias}:${userHs}`;

      if (await isRoomAliasAvailable(mx, roomAddress)) {
        setIsValidAddress(true);
      } else {
        setIsValidAddress(false);
      }
    }, 1000);
  };

  const joinRules = ['invite', 'restricted', 'public'];
  const joinRuleShortText = [t('organisms.createRoom.private'), t('organisms.createRoom.restricted'), t('organisms.createRoom.public')];
  const joinRuleText = [
    t('organisms.createRoom.privateDescription'),
    t('organisms.createRoom.restrictedDescription'),
    t('organisms.createRoom.publicDescription'),
  ];
  const jrRoomIC = [HashLockIC, HashIC, HashGlobeIC];
  const jrSpaceIC = [SpaceLockIC, SpaceIC, SpaceGlobeIC];
  const handleJoinRule = (evt) => {
    openReusableContextMenu('bottom', getEventCords(evt, '.btn-surface'), (closeMenu) => (
      <>
        <MenuHeader>{t('organisms.createRoom.visibilityMenuTitle')}</MenuHeader>
        {joinRules.map((rule) => (
          <MenuItem
            key={rule}
            variant={rule === joinRule ? 'positive' : 'surface'}
            iconSrc={
              isSpace ? jrSpaceIC[joinRules.indexOf(rule)] : jrRoomIC[joinRules.indexOf(rule)]
            }
            onClick={() => {
              closeMenu();
              setJoinRule(rule);
            }}
            disabled={!parentId && rule === 'restricted'}
          >
            {joinRuleText[joinRules.indexOf(rule)]}
          </MenuItem>
        ))}
      </>
    ));
  };

  return (
    <div className="create-room">
      <form className="create-room__form" onSubmit={handleSubmit}>
        <SettingTile
          title={t('organisms.createRoom.visibility')}
          options={
            <Button onClick={handleJoinRule} iconSrc={ChevronBottomIC}>
              {joinRuleShortText[joinRules.indexOf(joinRule)]}
            </Button>
          }
          content={
            <Text variant="b3">{t('organisms.createRoom.visibilityDescription', { type: isSpace ? 'space' : 'room' })}</Text>
          }
        />
        {joinRule === 'public' && (
          <div>
            <Text className="create-room__address__label" variant="b2">
              {isSpace ? t('organisms.createRoom.spaceAddress') : t('organisms.createRoom.roomAddress')}
            </Text>
            <div className="create-room__address">
              <Text variant="b1">#</Text>
              <Input
                value={addressValue}
                onChange={validateAddress}
                state={isValidAddress === false ? 'error' : 'normal'}
                forwardRef={addressRef}
                placeholder={t('organisms.createRoom.addressPlaceholder')}
                required
              />
              <Text variant="b1">{`:${userHs}`}</Text>
            </div>
            {isValidAddress === false && (
              <Text className="create-room__address__tip" variant="b3">
                <span
                  style={{ color: 'var(--bg-danger)' }}
                >{t('organisms.createRoom.addressInUse', { address: addressValue, server: userHs })}</span>
              </Text>
            )}
          </div>
        )}
        {!isSpace && joinRule !== 'public' && (
          <SettingTile
            title={t('organisms.createRoom.enableEncryption')}
            options={<Toggle isActive={isEncrypted} onToggle={setIsEncrypted} />}
            content={
              <Text variant="b3">
                {t('organisms.createRoom.encryptionDescription')}
              </Text>
            }
          />
        )}
        <SettingTile
          title={t('organisms.createRoom.selectRole')}
          options={
            <SegmentControl
              selected={roleIndex}
              segments={[{ text: t('organisms.createRoom.admin') }, { text: t('organisms.createRoom.founder') }]}
              onSelect={setRoleIndex}
            />
          }
          content={
            <Text variant="b3">{t('organisms.createRoom.roleDescription')}</Text>
          }
        />
        <Input name="topic" minHeight={174} resizable label={t('organisms.createRoom.topic')} />
        <div className="create-room__name-wrapper">
          <Input name="name" label={isSpace ? t('organisms.createRoom.spaceName') : t('organisms.createRoom.roomName')} required />
          <Button
            disabled={isValidAddress === false || isCreatingRoom}
            iconSrc={isSpace ? SpacePlusIC : HashPlusIC}
            type="submit"
            variant="primary"
          >
            {t('organisms.createRoom.create')}
          </Button>
        </div>
        {isCreatingRoom && (
          <div className="create-room__loading">
            <Spinner size="small" />
            <Text>{isSpace ? t('organisms.createRoom.creatingSpace') : t('organisms.createRoom.creatingRoom')}</Text>
          </div>
        )}
        {typeof creatingError === 'string' && (
          <Text className="create-room__error" variant="b3">
            {creatingError}
          </Text>
        )}
      </form>
    </div>
  );
}
CreateRoomContent.defaultProps = {
  parentId: null,
};
CreateRoomContent.propTypes = {
  isSpace: PropTypes.bool.isRequired,
  parentId: PropTypes.string,
  onRequestClose: PropTypes.func.isRequired,
};

function useWindowToggle() {
  const [create, setCreate] = useState(null);

  useEffect(() => {
    const handleOpen = (isSpace, parentId) => {
      setCreate({
        isSpace,
        parentId,
      });
    };
    navigation.on(cons.events.navigation.CREATE_ROOM_OPENED, handleOpen);
    return () => {
      navigation.removeListener(cons.events.navigation.CREATE_ROOM_OPENED, handleOpen);
    };
  }, []);

  const onRequestClose = () => setCreate(null);

  return [create, onRequestClose];
}

function CreateRoom() {
  const { t } = useTranslation();
  const [create, onRequestClose] = useWindowToggle();
  const { isSpace, parentId } = create ?? {};
  const mx = useMatrixClient();
  const room = mx.getRoom(parentId);

  return (
    <Dialog
      isOpen={create !== null}
      title={
        <Text variant="s1" weight="medium" primary>
          {parentId ? room.name : t('organisms.createRoom.home')}
          <span style={{ color: 'var(--tc-surface-low)' }}>
            {` — ${isSpace ? t('organisms.createRoom.createSpace') : t('organisms.createRoom.createRoom')}`}
          </span>
        </Text>
      }
      contentOptions={<IconButton src={CrossIC} onClick={onRequestClose} tooltip="Close" />}
      onRequestClose={onRequestClose}
    >
      {create ? (
        <CreateRoomContent isSpace={isSpace} parentId={parentId} onRequestClose={onRequestClose} />
      ) : (
        <div />
      )}
    </Dialog>
  );
}

export default CreateRoom;
