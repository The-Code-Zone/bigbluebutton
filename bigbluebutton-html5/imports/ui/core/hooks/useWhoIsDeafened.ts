import { useEffect } from 'react';
import { isEqual } from 'radash';
import { makeVar, useReactiveVar, useSubscription } from '@apollo/client';
import { USER_LIST_SUBSCRIPTION } from '../graphql/queries/users';

export interface DeafenedUser {
  userId: string;
  voice: {
    deafened: boolean;
  } | null;
}

const createUseWhoIsDeafened = () => {
  const countVar = makeVar(0);
  const stateVar = makeVar<Record<string, boolean>>({});
  const loadingVar = makeVar(true);

  const dispatchWhoIsDeafenedUpdate = (data?: DeafenedUser[]) => {
    if (countVar() === 0) return;

    if (!data) {
      stateVar({});
      return;
    }

    const newDeafenedUsers: Record<string, boolean> = {};

    data.forEach((user) => {
      const { userId, voice } = user;
      if (voice?.deafened) {
        newDeafenedUsers[userId] = true;
      }
    });

    if (isEqual(stateVar(), newDeafenedUsers)) {
      return;
    }

    stateVar(newDeafenedUsers);
  };

  const useWhoIsDeafened = () => {
    const deafenedUsers = useReactiveVar(stateVar);
    const loading = useReactiveVar(loadingVar);
    const consumersCount = useReactiveVar(countVar);

    const { data: subscriptionData, loading: subscriptionLoading } = useSubscription(
      USER_LIST_SUBSCRIPTION,
      {
        skip: consumersCount === 0,
        variables: {
          offset: 0,
          limit: 9999,
        },
      },
    );

    useEffect(() => {
      countVar(countVar() + 1);

      return () => {
        const newCount = countVar() - 1;
        countVar(newCount);
        if (newCount === 0) {
          stateVar({});
          loadingVar(true);
        }
      };
    }, []);

    useEffect(() => {
      loadingVar(subscriptionLoading);

      if (subscriptionData?.user) {
        dispatchWhoIsDeafenedUpdate(subscriptionData.user);
      }
    }, [subscriptionData, subscriptionLoading]);

    return {
      data: deafenedUsers,
      loading,
    };
  };

  const useWhoIsDeafenedConsumersCount = () => useReactiveVar(countVar);

  return [
    useWhoIsDeafened,
    useWhoIsDeafenedConsumersCount,
  ] as const;
};

const [
  useWhoIsDeafened,
  useWhoIsDeafenedConsumersCount,
] = createUseWhoIsDeafened();

export {
  useWhoIsDeafened,
  useWhoIsDeafenedConsumersCount,
};

export default useWhoIsDeafened;
