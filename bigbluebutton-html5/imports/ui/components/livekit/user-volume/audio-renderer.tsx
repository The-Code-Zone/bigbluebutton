import React, { useEffect } from 'react';
import { AudioTrack, useTracks, useRoomContext } from '@livekit/components-react';
import { RemoteParticipant, Track } from 'livekit-client';
import { getBbbUserIdForParticipant } from '/imports/ui/components/livekit/selective-subscription/service';
import { useUserVolumes, trackAudioLevels } from './service';

interface PerUserAudioRendererProps {
  volume?: number;
}

const PerUserAudioRenderer: React.FC<PerUserAudioRendererProps> = ({ volume }) => {
  const room = useRoomContext();
  const userVolumes = useUserVolumes();

  useEffect(() => {
    if (room) trackAudioLevels(room);
  }, [room]);

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
        const userVolume = trackRef.source === Track.Source.Microphone
          ? userVolumes[getBbbUserIdForParticipant(trackRef.participant as RemoteParticipant)] ?? 1
          : 1;

        return (
          <AudioTrack
            key={trackRef.publication.trackSid}
            trackRef={trackRef}
            volume={(volume ?? 1) * userVolume}
          />
        );
      })}
    </div>
  );
};

export default PerUserAudioRenderer;
