import { getTrackReferenceId } from '@livekit/components-core';
import { AudioTrack, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import * as React from 'react';
import logger from '/imports/startup/client/logger';
import { useReactiveVar } from '@apollo/client';
import VideoService from '/imports/ui/components/video-provider/service';

/** @public */
export interface PerUserAudioRendererProps {
    /**
     * If set to `true`, mutes all audio tracks rendered by the component.
     * @remarks
     * If set to `true`, the server will stop sending audio track data to the client.
     * @alpha
     */
    muted?: boolean;
}

/**
 * The `PerUserAudioRenderer` component reads audio track volumes from
 * the `VideoService.volumes` reactive variable and renders audio tracks
 * for each participant in the room, excluding the local participant.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <PerUserAudioRenderer />
 * </LiveKitRoom>
 * ```
 * @public
 */
export function PerUserAudioRenderer({ muted }: PerUserAudioRendererProps) {
    const tracks = useTracks(
        [Track.Source.Microphone, Track.Source.ScreenShareAudio, Track.Source.Unknown],
        {
            updateOnlyOn: [],
            onlySubscribed: true,
        },
    ).filter((ref) => !ref.participant.isLocal && ref.publication.kind === Track.Kind.Audio);

    logger.info({
        logCode: 'peruser_audiorenderer_render',
        extraInfo: {
            muted,
            trackCount: tracks.length,
        },
    }, 'Rendered PerUserAudioRenderer.');

    const volumes = useReactiveVar(VideoService.volumes);

    return (
        <div style={{ display: 'none' }}>
            {tracks.map((trackRef) => {
                const userId = trackRef.participant.identity;
                const userVolume = volumes[userId] ?? 1;

                logger.info({
                    logCode: 'peruser_audiorenderer_track_render',
                    extraInfo: {
                        trackRef: getTrackReferenceId(trackRef),
                        trackKind: trackRef.publication.kind,
                        userId: userId,
                        volume: userVolume,
                    },
                }, `Rendering AudioTrack ${userId} at ${userVolume} volume.`);

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

