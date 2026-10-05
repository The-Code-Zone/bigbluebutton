import React from 'react';
import Styled from './styles';
import { User, VideoItem } from '/imports/ui/components/video-provider/types';
import { VIDEO_TYPES } from '/imports/ui/components/video-provider/enums';
import {
  useUserAudioLevel,
  useLiveAudioLevelIndicators,
} from '/imports/ui/components/livekit/user-volume/service';

interface UserStatusProps {
  user: Partial<User>;
  stream: VideoItem;
  voiceUser: {
    muted: boolean;
    listenOnly: boolean;
    joined: boolean;
    deafened: boolean;
  };
}

const UserStatus: React.FC<UserStatusProps> = (props) => {
  const { voiceUser, user, stream } = props;
  const data = { ...user, ...stream };
  const liveLevelIndicators = useLiveAudioLevelIndicators();
  const level = useUserAudioLevel(stream.userId);
  const levelFill = Math.round(level * 100);

  const listenOnly = voiceUser?.listenOnly;
  const muted = voiceUser?.muted;
  const deafened = voiceUser?.deafened;
  const voiceUserJoined = voiceUser?.joined && !deafened;
  const emoji = data?.reactionEmoji;
  const away = data?.away;

  const cameraMasked = stream.type === VIDEO_TYPES.GRID && !!stream.cameraMasked;

  return (
    <div data-test="webcamUserStatus">
      {away && <span>⏰</span>}
      {(emoji && emoji !== 'none' && !away) && <span>{emoji}</span>}

      {cameraMasked && <Styled.Voice iconName="video" data-test="webcamMaskedCameraOn" />}
      {voiceUserJoined && (
        <>
          {(muted && !listenOnly) && <Styled.Muted iconName="unmute_filled" />}
          {listenOnly && <Styled.Voice iconName="listen" />}
          {!muted && (liveLevelIndicators ? (
            <Styled.VoiceMeter data-test="webcamVoiceMeter">
              <Styled.VoiceMeterFill style={{ height: `${levelFill}%` }} />
              <Styled.VoiceMeterIcon iconName="unmute" />
            </Styled.VoiceMeter>
          ) : (
            <Styled.Voice iconName="unmute" />
          ))}
        </>
      )}
    </div>
  );
};

export default UserStatus;
