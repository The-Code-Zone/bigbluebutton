import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import { useIsUsingLiveKitAudio } from '/imports/ui/core/hooks/livekit/useShouldUseLiveKitAudioState';
import {
  setUserVolume,
  useUserVolume,
} from '/imports/ui/components/livekit/user-volume/service';

const intlMessages = defineMessages({
  volumeLabel: {
    id: 'app.userList.userVolumeLabel',
    description: 'Aria label for the per-user volume slider',
  },
});

interface UserVolumeControlProps {
  userId: string;
  userName: string;
}

const UserVolumeControl: React.FC<UserVolumeControlProps> = ({ userId, userName }) => {
  const intl = useIntl();
  const isUsingLiveKitAudio = useIsUsingLiveKitAudio();
  const volume = useUserVolume(userId);

  if (!isUsingLiveKitAudio) return null;

  const volumeFill = Math.round(volume * 100);

  return (
    <Styled.VolumeControlContainer>
      <Styled.VolumeSlider
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        aria-label={intl.formatMessage(intlMessages.volumeLabel, { 0: userName })}
        data-test="userVolumeSlider"
        style={{ '--level-fill': `${volumeFill}%` } as React.CSSProperties}
        onChange={(event) => setUserVolume(userId, parseFloat(event.target.value))}
        onClick={(event) => event.stopPropagation()}
      />
    </Styled.VolumeControlContainer>
  );
};

export default UserVolumeControl;
