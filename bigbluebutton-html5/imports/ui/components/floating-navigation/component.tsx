import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { layoutDispatch, layoutSelectInput } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { USER_AGGREGATE_COUNT_SUBSCRIPTION } from '/imports/ui/core/graphql/queries/users';
import { UserAggregateCountSubscriptionResponse } from '/imports/ui/components/user-list/types';
import SettingsContainer from '/imports/ui/components/settings/container';
import Icon from '/imports/ui/components/common/icon/component';
import useIsMicroViewport from '/imports/ui/components/layout/hooks/useIsMicroViewport';
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
  const layoutContextDispatch = layoutDispatch();
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const isUserListOpen = sidebarContent.isOpen
    && sidebarContent.sidebarContentPanel === PANELS.USERLIST;
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const isMicro = useIsMicroViewport();

  const {
    data: usersCountData,
  } = useDeduplicatedSubscription<UserAggregateCountSubscriptionResponse>(
    USER_AGGREGATE_COUNT_SUBSCRIPTION,
  );
  const usersCount = usersCountData?.user_aggregate?.aggregate?.count ?? 0;

  const isSidebarContentOpen = sidebarContent.isOpen;

  if (isMicro) return null;

  const toggleUserList = () => {
    const willOpen = !isUserListOpen;
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: willOpen,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: willOpen ? PANELS.USERLIST : PANELS.NONE,
    });
  };

  return (
    <>
      {!isSidebarContentOpen && (
      <>
        <Styled.ParticipantsPill
          type="button"
          data-test="floatingParticipants"
          aria-label={intl.formatMessage(intlMessages.usersListLabel)}
          aria-expanded={isUserListOpen}
          onClick={toggleUserList}
        >
          <Icon iconName="user_list" />
          {usersCount}
        </Styled.ParticipantsPill>
        <Styled.SettingsButton
          type="button"
          data-test="floatingSettings"
          aria-label={intl.formatMessage(intlMessages.settingsLabel)}
          onClick={() => setIsSettingsModalOpen(true)}
        >
          <Icon iconName="settings" />
        </Styled.SettingsButton>
      </>
      )}
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
