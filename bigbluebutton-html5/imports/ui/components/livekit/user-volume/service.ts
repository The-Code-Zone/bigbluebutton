import { useMemo } from 'react';
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

  return {
    setValue,
    setState,
    useValue,
    useAll,
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

const LEVEL_QUANTUM = 0.05;
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

      const level = Math.min(1, Math.round(participant.audioLevel / LEVEL_QUANTUM) * LEVEL_QUANTUM);

      if (level > 0) next[userId] = level;
    });

    userAudioLevels.setState(next);
  });
};
