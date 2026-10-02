import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Auth from '/imports/ui/services/auth';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { USER_LIST_SUBSCRIPTION } from '/imports/ui/core/graphql/queries/users';
import { User } from '/imports/ui/Types/user';
import UserVolumeControl from '/imports/ui/components/user-list/user-list-participants/list-item/user-volume-control/component';
import Styled from './styles';

const intlMessages = defineMessages({
  presenter: {
    id: 'app.userList.presenter',
    description: 'Presenter sublabel in the floating user list',
  },
  moderator: {
    id: 'app.userList.moderator',
    description: 'Mentor sublabel in the floating user list',
  },
  deafened: {
    id: 'app.userList.deafened',
    description: 'Deafened badge in the floating user list',
  },
  you: {
    id: 'app.userList.you',
    description: 'Own-user marker in the floating user list',
  },
});

interface UserListSubscriptionResponse {
  user: User[];
}

const FloatingUserList: React.FC = () => {
  const intl = useIntl();
  const { data } = useDeduplicatedSubscription<UserListSubscriptionResponse>(
    USER_LIST_SUBSCRIPTION,
    { variables: { offset: 0, limit: 60, where: { bot: { _eq: false } } } },
  );
  const users = data?.user ?? [];
  const ENABLE_AVATARS = window.meetingClientSettings.public.app.enableAvatars;

  return (
    <Styled.Stack data-test="floatingUserList">
      {users.map((user) => {
        const isMe = user.userId === Auth.userID;
        const subs = [];
        if (user.presenter) subs.push(intl.formatMessage(intlMessages.presenter));
        if (user.isModerator) subs.push(intl.formatMessage(intlMessages.moderator));

        return (
          <Styled.Bubble key={user.userId} data-test="floatingUserBubble">
            {ENABLE_AVATARS && user.avatar ? (
              <Styled.AvatarImage src={user.avatar} alt="" />
            ) : (
              <Styled.AvatarInitials style={{ backgroundColor: user.color }}>
                {user.name?.slice(0, 2)}
              </Styled.AvatarInitials>
            )}
            <Styled.Text>
              <Styled.Name>
                {user.name}
                {isMe && ` (${intl.formatMessage(intlMessages.you)})`}
              </Styled.Name>
              {subs.length > 0 && <Styled.Sub>{subs.join(' · ')}</Styled.Sub>}
              {!isMe && user.voice?.joined && !user.voice?.listenOnly && (
                <UserVolumeControl userId={user.userId} userName={user.name} />
              )}
            </Styled.Text>
            {user.voice?.deafened && (
              <Styled.DeafenedBadge>
                {intl.formatMessage(intlMessages.deafened)}
              </Styled.DeafenedBadge>
            )}
          </Styled.Bubble>
        );
      })}
    </Styled.Stack>
  );
};

export default FloatingUserList;
