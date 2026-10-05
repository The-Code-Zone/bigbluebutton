import React, { useEffect } from 'react';
import {
  AudioTrack, TrackReference, useTracks, useRoomContext,
} from '@livekit/components-react';
import { RemoteParticipant, RoomEvent, Track } from 'livekit-client';
import Auth from '/imports/ui/services/auth';
import { getBbbUserIdForParticipant } from '/imports/ui/components/livekit/selective-subscription/service';
import {
  useUserVolumes,
  trackAudioLevels,
  attachLevelAnalyser,
  useLiveAudioLevelIndicators,
} from './service';

interface PerUserAudioRendererProps {
  volume?: number;
}

const TrackLevelAnalyser: React.FC<{ userId: string; trackRef: TrackReference }> = ({
  userId,
  trackRef,
}) => {
  const mediaStreamTrack = trackRef.publication?.track?.mediaStreamTrack;

  useEffect(() => {
    if (!mediaStreamTrack) return undefined;
    return attachLevelAnalyser(userId, mediaStreamTrack);
  }, [userId, mediaStreamTrack]);

  return null;
};

const useLocalLevelAnalyser = (room: ReturnType<typeof useRoomContext>, enabled: boolean) => {
  useEffect(() => {
    if (!room || !enabled) return undefined;

    let detach = () => {};
    const attach = () => {
      detach();
      detach = () => {};
      const publication = room.localParticipant?.getTrackPublication(Track.Source.Microphone);
      const mediaStreamTrack = publication?.track?.mediaStreamTrack;
      const userId = typeof Auth.userID === 'string' ? Auth.userID : '';
      if (mediaStreamTrack && userId) detach = attachLevelAnalyser(userId, mediaStreamTrack);
    };

    attach();
    room.on(RoomEvent.LocalTrackPublished, attach);
    room.on(RoomEvent.LocalTrackUnpublished, attach);

    return () => {
      room.off(RoomEvent.LocalTrackPublished, attach);
      room.off(RoomEvent.LocalTrackUnpublished, attach);
      detach();
    };
  }, [room, enabled]);
};

const PerUserAudioRenderer: React.FC<PerUserAudioRendererProps> = ({ volume }) => {
  const room = useRoomContext();
  const userVolumes = useUserVolumes();
  const liveLevelIndicators = useLiveAudioLevelIndicators();

  useEffect(() => {
    if (room) trackAudioLevels(room);
  }, [room]);

  useLocalLevelAnalyser(room, liveLevelIndicators);

  const tracks = useTracks(
    [Track.Source.Microphone, Track.Source.ScreenShareAudio, Track.Source.Unknown],
    {
      updateOnlyOn: [],
      onlySubscribed: true,
    },
  ).filter((ref) => !ref.participant.isLocal && ref.publication.kind === Track.Kind.Audio);

  return (
    <div style={{ display: 'none' }}>
      {tracks.map((trackRef) => {
        const isMicrophone = trackRef.source === Track.Source.Microphone;
        const bbbUserId = isMicrophone
          ? getBbbUserIdForParticipant(trackRef.participant as RemoteParticipant)
          : '';
        const userVolume = isMicrophone ? userVolumes[bbbUserId] ?? 1 : 1;

        return (
          <React.Fragment key={trackRef.publication.trackSid}>
            <AudioTrack
              trackRef={trackRef}
              volume={(volume ?? 1) * userVolume}
            />
            {liveLevelIndicators && isMicrophone && bbbUserId && (
              <TrackLevelAnalyser userId={bbbUserId} trackRef={trackRef} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default PerUserAudioRenderer;
