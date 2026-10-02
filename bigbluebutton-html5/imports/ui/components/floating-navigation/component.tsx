import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { USER_AGGREGATE_COUNT_SUBSCRIPTION } from '/imports/ui/core/graphql/queries/users';
import { UserAggregateCountSubscriptionResponse } from '/imports/ui/components/user-list/types';
import SettingsContainer from '/imports/ui/components/settings/container';
import Icon from '/imports/ui/components/common/icon/component';
import useIsMicroViewport from '/imports/ui/components/layout/hooks/useIsMicroViewport';
import FloatingUserList from './user-list/component';
import Styled from './styles';

const intlMessages = defineMessages({
  usersListLabel: {
    id: 'app.userList.participantsTitle',
    description: 'Label for the floating participants button',
  },
  settingsLabel: {
    id: 'app.userList.settingsTitle',
    description: 'Label for the floating settings button',
  },
});

const FloatingNavigation: React.FC = () => {
  const intl = useIntl();
  const [isListOpen, setIsListOpen] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const isMicro = useIsMicroViewport();

  const {
    data: usersCountData,
  } = useDeduplicatedSubscription<UserAggregateCountSubscriptionResponse>(
    USER_AGGREGATE_COUNT_SUBSCRIPTION,
  );
  const usersCount = usersCountData?.user_aggregate?.aggregate?.count ?? 0;

  if (isMicro) return null;

  return (
    <>
      <Styled.ParticipantsPill
        type="button"
        data-test="floatingParticipants"
        aria-label={intl.formatMessage(intlMessages.usersListLabel)}
        aria-expanded={isListOpen}
        onClick={() => setIsListOpen((open) => !open)}
      >
        <Icon iconName="user_list" />
        {usersCount}
      </Styled.ParticipantsPill>
      {isListOpen && <FloatingUserList />}
      <Styled.SettingsDot
        type="button"
        data-test="floatingSettings"
        aria-label={intl.formatMessage(intlMessages.settingsLabel)}
        onClick={() => setIsSettingsModalOpen(true)}
      >
        <Icon iconName="settings" />
      </Styled.SettingsDot>
      {isSettingsModalOpen && (
        <SettingsContainer
          isOpen={isSettingsModalOpen}
          setIsOpen={setIsSettingsModalOpen}
        />
      )}
    </>
  );
};

export default FloatingNavigation;
