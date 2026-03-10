import { Box, Chip, Icon, IconButton, Icons, Spinner, Text, Tooltip, TooltipProvider } from 'folds';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import { StatusDivider } from './components';
import { CallEmbed, useCallControlState } from '../../plugins/call';
import { AsyncStatus, useAsyncCallback } from '../../hooks/useAsyncCallback';
import { callEmbedAtom } from '../../state/callEmbed';

type MicrophoneButtonProps = {
  enabled: boolean;
  onToggle: () => Promise<unknown>;
  disabled?: boolean;
};
function MicrophoneButton({ enabled, onToggle, disabled }: MicrophoneButtonProps) {
  const { t } = useTranslation();
  return (
    <TooltipProvider
      position="Top"
      tooltip={
        <Tooltip>
          <Text size="T200">{enabled ? t('features:call-status.turn_off_microphone') : t('features:call-status.turn_on_microphone')}</Text>
        </Tooltip>
      }
    >
      {(anchorRef) => (
        <IconButton
          ref={anchorRef}
          variant={enabled ? 'Surface' : 'Warning'}
          fill="Soft"
          radii="300"
          size="300"
          onClick={() => onToggle()}
          outlined
          disabled={disabled}
        >
          <Icon size="100" src={enabled ? Icons.Mic : Icons.MicMute} filled={!enabled} />
        </IconButton>
      )}
    </TooltipProvider>
  );
}

type SoundButtonProps = {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
};
function SoundButton({ enabled, onToggle, disabled }: SoundButtonProps) {
  const { t } = useTranslation();
  return (
    <TooltipProvider
      position="Top"
      tooltip={
        <Tooltip>
          <Text size="T200">{enabled ? t('features:call-status.turn_off_sound') : t('features:call-status.turn_on_sound')}</Text>
        </Tooltip>
      }
    >
      {(anchorRef) => (
        <IconButton
          ref={anchorRef}
          variant={enabled ? 'Surface' : 'Warning'}
          fill="Soft"
          radii="300"
          size="300"
          onClick={() => onToggle()}
          outlined
          disabled={disabled}
        >
          <Icon
            size="100"
            src={enabled ? Icons.Headphone : Icons.HeadphoneMute}
            filled={!enabled}
          />
        </IconButton>
      )}
    </TooltipProvider>
  );
}

type VideoButtonProps = {
  enabled: boolean;
  onToggle: () => Promise<unknown>;
  disabled?: boolean;
};
function VideoButton({ enabled, onToggle, disabled }: VideoButtonProps) {
  const { t } = useTranslation();
  return (
    <TooltipProvider
      position="Top"
      tooltip={
        <Tooltip>
          <Text size="T200">{enabled ? t('features:call-status.stop_camera') : t('features:call-status.start_camera')}</Text>
        </Tooltip>
      }
    >
      {(anchorRef) => (
        <IconButton
          ref={anchorRef}
          variant={enabled ? 'Success' : 'Surface'}
          fill="Soft"
          radii="300"
          size="300"
          onClick={() => onToggle()}
          outlined
          disabled={disabled}
        >
          <Icon
            size="100"
            src={enabled ? Icons.VideoCamera : Icons.VideoCameraMute}
            filled={enabled}
          />
        </IconButton>
      )}
    </TooltipProvider>
  );
}

type ScreenShareButtonProps = {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
};
function ScreenShareButton({ enabled, onToggle, disabled }: ScreenShareButtonProps) {
  const { t } = useTranslation();
  return (
    <TooltipProvider
      position="Top"
      tooltip={
        <Tooltip>
          <Text size="T200">{enabled ? t('features:call-status.stop_screenshare') : t('features:call-status.start_screenshare')}</Text>
        </Tooltip>
      }
    >
      {(anchorRef) => (
        <IconButton
          ref={anchorRef}
          variant={enabled ? 'Success' : 'Surface'}
          fill="Soft"
          radii="300"
          size="300"
          onClick={onToggle}
          outlined
          disabled={disabled}
        >
          <Icon size="100" src={Icons.ScreenShare} filled={enabled} />
        </IconButton>
      )}
    </TooltipProvider>
  );
}

export function CallControl({
  callEmbed,
  compact,
  callJoined,
}: {
  callEmbed: CallEmbed;
  compact: boolean;
  callJoined: boolean;
}) {
  const { t } = useTranslation();
  const { microphone, video, sound, screenshare } = useCallControlState(callEmbed.control);
  const setCallEmbed = useSetAtom(callEmbedAtom);

  const [hangupState, hangup] = useAsyncCallback(
    useCallback(() => callEmbed.hangup(), [callEmbed])
  );
  const exiting =
    hangupState.status === AsyncStatus.Loading || hangupState.status === AsyncStatus.Success;

  const handleHangup = () => {
    if (!callJoined) {
      setCallEmbed(undefined);
      return;
    }
    hangup();
  };

  return (
    <Box shrink="No" alignItems="Center" gap="300">
      <Box alignItems="Inherit" gap="200">
        <MicrophoneButton
          enabled={microphone}
          onToggle={() => callEmbed.control.toggleMicrophone()}
          disabled={!callJoined}
        />
        <SoundButton
          enabled={sound}
          onToggle={() => callEmbed.control.toggleSound()}
          disabled={!callJoined}
        />
        {!compact && <StatusDivider />}
        <VideoButton
          enabled={video}
          onToggle={() => callEmbed.control.toggleVideo()}
          disabled={!callJoined}
        />
        {!compact && (
          <ScreenShareButton
            enabled={screenshare}
            onToggle={() => callEmbed.control.toggleScreenshare()}
            disabled={!callJoined}
          />
        )}
      </Box>
      <StatusDivider />
      <Chip
        variant="Critical"
        radii="Pill"
        fill="Soft"
        before={
          exiting ? (
            <Spinner variant="Critical" fill="Soft" size="50" />
          ) : (
            <Icon size="50" src={Icons.PhoneDown} filled />
          )
        }
        disabled={exiting}
        outlined
        onClick={handleHangup}
      >
        {!compact && (
          <Text as="span" size="L400">
            {t('features:call-status.end')}
          </Text>
        )}
      </Chip>
    </Box>
  );
}
