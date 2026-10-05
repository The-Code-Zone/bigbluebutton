import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { makeVar, useReactiveVar, ReactiveVar } from '@apollo/client';
import {
  Participant,
  RemoteParticipant,
  Room,
  RoomEvent,
} from 'livekit-client';
import Auth from '/imports/ui/services/auth';
import Storage from '/imports/ui/services/storage/session';
import { getBbbUserIdForParticipant } from '/imports/ui/components/livekit/selective-subscription/service';

const USER_VOLUMES_KEY = 'userVolumes';

const createKeyedNumberStore = (defaultValue: number, persistKey?: string) => {
  const persisted = persistKey
    ? (Storage.getItem(persistKey) as Record<string, number> | undefined)
    : undefined;
  const fullVar = makeVar<Record<string, number>>(persisted ?? {});
  const keyVars = new Map<string, ReactiveVar<number>>();

  const getKeyVar = (key: string): ReactiveVar<number> => {
    let keyVar = keyVars.get(key);

    if (!keyVar) {
      keyVar = makeVar<number>(fullVar()[key] ?? defaultValue);
      keyVars.set(key, keyVar);
    }

    return keyVar;
  };

  const setValue = (key: string, value: number) => {
    fullVar({ ...fullVar(), [key]: value });

    const keyVar = getKeyVar(key);
    if (keyVar() !== value) keyVar(value);

    if (persistKey) Storage.setItem(persistKey, fullVar());
  };

  const setState = (next: Record<string, number>) => {
    fullVar(next);

    keyVars.forEach((keyVar, key) => {
      const value = next[key] ?? defaultValue;
      if (keyVar() !== value) keyVar(value);
    });
  };

  const useValue = (key: string): number => {
    const keyVar = useMemo(() => getKeyVar(key), [key]);

    return useReactiveVar(keyVar);
  };

  const useAll = (): Record<string, number> => useReactiveVar(fullVar);

  const getValue = (key: string): number => fullVar()[key] ?? defaultValue;

  return {
    setValue,
    setState,
    useValue,
    useAll,
    getValue,
  };
};

const userVolumes = createKeyedNumberStore(1, USER_VOLUMES_KEY);
const userAudioLevels = createKeyedNumberStore(0);

export const setUserVolume = (userId: string, volume: number) => {
  userVolumes.setValue(userId, volume);
};

export const useUserVolume = (userId: string): number => userVolumes.useValue(userId);

export const useUserVolumes = (): Record<string, number> => userVolumes.useAll();

export const useUserAudioLevel = (userId: string): number => userAudioLevels.useValue(userId);

export const useLiveAudioLevelIndicators = (): boolean => (
  window.meetingClientSettings?.public?.app?.liveAudioLevelIndicators ?? false
);

const LEVEL_REFERENCE_MAX = 0.32;
const LEVEL_DISPLAY_EXPONENT = 1.2;

const serverLevelToNormalized = (level: number): number => {
  const normalized = Math.min(1, level / LEVEL_REFERENCE_MAX);
  return Math.round((normalized ** LEVEL_DISPLAY_EXPONENT) * 100) / 100;
};

const LEVEL_RMS_REFERENCE = 0.2;
const LEVEL_RMS_EXPONENT = 0.75;
const ANALYSER_INTERVAL_MS = 100;

let sharedAudioContext: AudioContext | null = null;
const analyzedUsers = new Set<string>();

const getSharedAudioContext = (): AudioContext | null => {
  if (!sharedAudioContext) {
    try {
      sharedAudioContext = new AudioContext();
    } catch {
      return null;
    }
  }
  return sharedAudioContext;
};

export const attachLevelAnalyser = (
  userId: string,
  mediaStreamTrack: MediaStreamTrack,
): (() => void
) => {
  const ctx = getSharedAudioContext();
  if (!ctx || !userId) return () => {};
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const source = ctx.createMediaStreamSource(new MediaStream([mediaStreamTrack]));
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);
  const samples = new Float32Array(analyser.fftSize);
  analyzedUsers.add(userId);

  const timer = setInterval(() => {
    analyser.getFloatTimeDomainData(samples);
    let sum = 0;
    for (let i = 0; i < samples.length; i += 1) sum += samples[i] * samples[i];
    const rms = Math.sqrt(sum / samples.length);
    const normalized = Math.min(1, rms / LEVEL_RMS_REFERENCE) ** LEVEL_RMS_EXPONENT;
    userAudioLevels.setValue(userId, Math.round(normalized * 100) / 100);
  }, ANALYSER_INTERVAL_MS);

  return () => {
    clearInterval(timer);
    analyzedUsers.delete(userId);
    userAudioLevels.setValue(userId, 0);
    source.disconnect();
  };
};

const SUSTAINED_LOUD_LEVEL_NORMALIZED = 0.85;
const SUSTAINED_LOUD_HOLD_MS = 10000;
const SUSTAINED_LOUD_RELEASE_MS = 5000;
const SUSTAINED_LOUD_TICK_MS = 1000;

export const useSustainedLoud = (userId: string): boolean => {
  const level = useUserAudioLevel(userId);
  const levelRef = useRef(level);
  levelRef.current = level;
  const [sustained, setSustained] = useState(false);
  const loudSinceRef = useRef<number | null>(null);
  const quietSinceRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = setInterval(() => {
      const now = Date.now();
      if (levelRef.current >= SUSTAINED_LOUD_LEVEL_NORMALIZED) {
        quietSinceRef.current = null;
        if (loudSinceRef.current == null) loudSinceRef.current = now;
        if (now - loudSinceRef.current >= SUSTAINED_LOUD_HOLD_MS) setSustained(true);
      } else {
        loudSinceRef.current = null;
        if (quietSinceRef.current == null) quietSinceRef.current = now;
        if (now - quietSinceRef.current >= SUSTAINED_LOUD_RELEASE_MS) setSustained(false);
      }
    }, SUSTAINED_LOUD_TICK_MS);
    return () => clearInterval(tick);
  }, []);

  return sustained;
};

const sampledRooms = new WeakSet<Room>();

export const trackAudioLevels = (room: Room) => {
  if (sampledRooms.has(room)) return;

  sampledRooms.add(room);

  room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
    const next: Record<string, number> = {};

    speakers.forEach((participant) => {
      const userId = participant.isLocal
        ? Auth.userID as string | null
        : getBbbUserIdForParticipant(participant as RemoteParticipant);

      if (!userId) return;

      if (analyzedUsers.has(userId)) return;

      const level = serverLevelToNormalized(participant.audioLevel);
      if (level > 0) next[userId] = level;
    });

    analyzedUsers.forEach((id) => {
      const current = userAudioLevels.getValue(id);
      if (current > 0) next[id] = current;
    });

    userAudioLevels.setState(next);
  });
};
