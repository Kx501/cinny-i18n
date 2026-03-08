import React from 'react';
import { Icon, IconButton, Icons, Line, Text, Tooltip, TooltipProvider } from 'folds';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import * as css from './styles.css';
import { callChatAtom } from '../../state/callEmbed';

export function ControlDivider() {
  return (
    <Line variant="SurfaceVariant" size="300" direction="Vertical" className={css.ControlDivider} />
  );
}

type MicrophoneButtonProps = {
  enabled: boolean;
  onToggle: () => void;
};
export function MicrophoneButton({ enabled, onToggle }: MicrophoneButtonProps) {
  const { t } = useTranslation();
  return (
    <TooltipProvider
      position="Top"
      delay={500}
      tooltip={
        <Tooltip>
          <Text size="T200">{enabled ? t('features:call.turn_off_microphone') : t('features:call.turn_on_microphone')}</Text>
        </Tooltip>
      }
    >
      {(anchorRef) => (
        <IconButton
          ref={anchorRef}
          variant={enabled ? 'Surface' : 'Warning'}
          fill="Soft"
          radii="400"
          size="400"
          onClick={() => onToggle()}
          outlined
        >
          <Icon size="400" src={enabled ? Icons.Mic : Icons.MicMute} filled={!enabled} />
        </IconButton>
      )}
    </TooltipProvider>
  );
}

type SoundButtonProps = {
  enabled: boolean;
  onToggle: () => void;
};
export function SoundButton({ enabled, onToggle }: SoundButtonProps) {
  const { t } = useTranslation();
  return (
    <TooltipProvider
      position="Top"
      delay={500}
      tooltip={
        <Tooltip>
          <Text size="T200">{enabled ? t('features:call.turn_off_sound') : t('features:call.turn_on_sound')}</Text>
        </Tooltip>
      }
    >
      {(anchorRef) => (
        <IconButton
          ref={anchorRef}
          variant={enabled ? 'Surface' : 'Warning'}
          fill="Soft"
          radii="400"
          size="400"
          onClick={() => onToggle()}
          outlined
        >
          <Icon
            size="400"
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
  onToggle: () => void;
};
export function VideoButton({ enabled, onToggle }: VideoButtonProps) {
  const { t } = useTranslation();
  return (
    <TooltipProvider
      position="Top"
      delay={500}
      tooltip={
        <Tooltip>
          <Text size="T200">{enabled ? t('features:call.stop_camera') : t('features:call.start_camera')}</Text>
        </Tooltip>
      }
    >
      {(anchorRef) => (
        <IconButton
          ref={anchorRef}
          variant={enabled ? 'Success' : 'Surface'}
          fill="Soft"
          radii="400"
          size="400"
          onClick={() => onToggle()}
          outlined
        >
          <Icon
            size="400"
            src={enabled ? Icons.VideoCamera : Icons.VideoCameraMute}
            filled={enabled}
          />
        </IconButton>
      )}
    </TooltipProvider>
  );
}

export function ChatButton() {
  const [chat, setChat] = useAtom(callChatAtom);
  const { t } = useTranslation();

  return (
    <TooltipProvider
      position="Top"
      delay={500}
      tooltip={
        <Tooltip>
          <Text size="T200">{chat ? t('features:call.close_chat') : t('features:call.open_chat')}</Text>
        </Tooltip>
      }
    >
      {(anchorRef) => (
        <IconButton
          ref={anchorRef}
          variant={chat ? 'Success' : 'Surface'}
          fill="Soft"
          radii="400"
          size="400"
          onClick={() => setChat(!chat)}
          outlined
        >
          <Icon size="400" src={Icons.Message} filled={chat} />
        </IconButton>
      )}
    </TooltipProvider>
  );
}
