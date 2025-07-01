import { getTrackReferenceId, trackReferencesObservable } from '@livekit/components-core';
import { AudioTrack } from '@livekit/components-react/dist/components/participant/AudioTrack';
import { useTracks } from '@livekit/components-react/dist/hooks/useTracks';
import { Track } from 'livekit-client';
import * as React from 'react';
import logger from '/imports/startup/client/logger';
import { useReactiveVar } from '@apollo/client/react/hooks/useReactiveVar';
import VideoService from '/imports/ui/components/video-provider/service';

/** @public */
export interface RoomAudioRendererProps {
    /** Sets the volume for all audio tracks rendered by this component. By default, the range is between `0.0` and `1.0`. */
    volume?: number;
    /**
     * If set to `true`, mutes all audio tracks rendered by the component.
     * @remarks
     * If set to `true`, the server will stop sending audio track data to the client.
     * @alpha
     */
    muted?: boolean;
}

/**
 * The `RoomAudioRenderer` component is a drop-in solution for adding audio to your LiveKit app.
 * It takes care of handling remote participants’ audio tracks and makes sure that microphones and screen share are audible.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <RoomAudioRenderer />
 * </LiveKitRoom>
 * ```
 * @public
 */
export function PerUserAudioRenderer({ volume, muted }: RoomAudioRendererProps) {
    logger.warn({ logCode: 'peruseraudiorenderer_call' }, 'Initialised PerUserAudioRenderer.');
    const tracks = useTracks(
        [Track.Source.Microphone, Track.Source.ScreenShareAudio, Track.Source.Unknown],
        {
            updateOnlyOn: [],
            onlySubscribed: true,
        },
    ).filter((ref) => !ref.participant.isLocal && ref.publication.kind === Track.Kind.Audio);

    const volumes = useReactiveVar(VideoService.volumes);

    return (
        <div style={{ display: 'none' }}>
            {tracks.map((trackRef) => {
                const userId = trackRef.participant.identity;
                const userVolume = volumes[userId] ?? 1;

                logger.warn({ logCode: 'peruseraudiorenderer_track' }, `Rendering audio track for user ${userId} with volume ${userVolume}`);

                return (
                    <AudioTrack
                        key={getTrackReferenceId(trackRef)}
                        trackRef={trackRef}
                        volume={userVolume}
                        muted={muted}
                    />
                );
            })}
        </div>
    );
}

