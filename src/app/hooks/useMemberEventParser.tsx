import React, { ReactNode } from 'react';
import { IconSrc, Icons } from 'folds';
import { MatrixEvent } from 'matrix-js-sdk';
import { useTranslation } from 'react-i18next';
import { IMemberContent, Membership } from '../../types/matrix/room';
import { getMxIdLocalPart } from '../utils/matrix';
import { isMembershipChanged } from '../utils/room';

export type ParsedResult = {
  icon: IconSrc;
  body: ReactNode;
};

export type MemberEventParser = (mEvent: MatrixEvent) => ParsedResult;

export const useMemberEventParser = (): MemberEventParser => {
  const { t } = useTranslation();

  const parseMemberEvent: MemberEventParser = (mEvent) => {
    const content = mEvent.getContent<IMemberContent>();
    const prevContent = mEvent.getPrevContent() as IMemberContent;
    const senderId = mEvent.getSender();
    const userId = mEvent.getStateKey();
    const reason = typeof content.reason === 'string' ? content.reason : undefined;

    if (!senderId || !userId)
      return {
        icon: Icons.User,
        body: t('hooks:broken_membership_event'),
      };

    const senderName = getMxIdLocalPart(senderId);
    const userName =
      typeof content.displayname === 'string'
        ? content.displayname || getMxIdLocalPart(userId)
        : getMxIdLocalPart(userId);

    if (isMembershipChanged(mEvent)) {
      if (content.membership === Membership.Invite) {
        if (prevContent.membership === Membership.Knock) {
          return {
            icon: Icons.ArrowGoRightPlus,
            body: (
              <>
                <b>{senderName}</b>
                {t('hooks:_accepted_')}
                <b>{userName}</b>
                {t('hooks:s_join_request_')}
                {reason}
              </>
            ),
          };
        }

        return {
          icon: Icons.ArrowGoRightPlus,
          body: (
            <>
              <b>{senderName}</b>
              {t('hooks:_invited_')}
              <b>{userName}</b> {reason}
            </>
          ),
        };
      }

      if (content.membership === Membership.Knock) {
        return {
          icon: Icons.ArrowGoRightPlus,
          body: (
            <>
              <b>{userName}</b>
              {t('hooks:_request_to_join_room_')}
              {reason}
            </>
          ),
        };
      }

      if (content.membership === Membership.Join) {
        return {
          icon: Icons.ArrowGoRight,
          body: (
            <>
              <b>{userName}</b>
              {t('hooks:_joined_the_room_')}
            </>
          ),
        };
      }

      if (content.membership === Membership.Leave) {
        if (prevContent.membership === Membership.Invite) {
          return {
            icon: Icons.ArrowGoRightCross,
            body:
              senderId === userId ? (
                <>
                  <b>{userName}</b>
                  {t('hooks:_rejected_the_invitation_')}
                  {reason}
                </>
              ) : (
                <>
                  <b>{senderName}</b>
                  {t('hooks:_rejected_')}
                  <b>{userName}</b>
                  {t('hooks:s_join_request_')}
                  {reason}
                </>
              ),
          };
        }

        if (prevContent.membership === Membership.Knock) {
          return {
            icon: Icons.ArrowGoRightCross,
            body:
              senderId === userId ? (
                <>
                  <b>{userName}</b>
                  {t('hooks:_revoked_joined_request_')}
                  {reason}
                </>
              ) : (
                <>
                  <b>{senderName}</b>
                  {t('hooks:_revoked_')}
                  <b>{userName}</b>
                  {t('hooks:s_invite_')}
                  {reason}
                </>
              ),
          };
        }

        if (prevContent.membership === Membership.Ban) {
          return {
            icon: Icons.ArrowGoLeft,
            body: (
              <>
                <b>{senderName}</b>
                {t('hooks:_unbanned_')}
                <b>{userName}</b> {reason}
              </>
            ),
          };
        }

        return {
          icon: Icons.ArrowGoLeft,
          body:
            senderId === userId ? (
              <>
                <b>{userName}</b>
                {t('hooks:_left_the_room_')}
                {reason}
              </>
            ) : (
              <>
                <b>{senderName}</b>
                {t('hooks:_kicked_')}
                <b>{userName}</b> {reason}
              </>
            ),
        };
      }

      if (content.membership === Membership.Ban) {
        return {
          icon: Icons.ArrowGoLeft,
          body: (
            <>
              <b>{senderName}</b>
              {t('hooks:_banned_')}
              <b>{userName}</b> {reason}
            </>
          ),
        };
      }
    }

    if (content.displayname !== prevContent.displayname) {
      const prevUserName =
        typeof prevContent.displayname === 'string'
          ? prevContent.displayname || getMxIdLocalPart(userId)
          : getMxIdLocalPart(userId);

      return {
        icon: Icons.Mention,
        body:
          typeof content.displayname === 'string' ? (
            <>
              <b>{prevUserName}</b>
              {t('hooks:_changed_display_name_to_')}
              <b>{userName}</b>
            </>
          ) : (
            <>
              <b>{prevUserName}</b>
              {t('hooks:_removed_their_display_name_')}
            </>
          ),
      };
    }
    if (content.avatar_url !== prevContent.avatar_url) {
      return {
        icon: Icons.User,
        body:
          content.avatar_url && typeof content.avatar_url === 'string' ? (
            <>
              <b>{userName}</b>
              {t('hooks:_changed_their_avatar_')}
            </>
          ) : (
            <>
              <b>{userName}</b>
              {t('hooks:_removed_their_avatar_')}
            </>
          ),
      };
    }

    return {
      icon: Icons.User,
      body: t('hooks:membership_event_with_no_changes'),
    };
  };

  return parseMemberEvent;
};
