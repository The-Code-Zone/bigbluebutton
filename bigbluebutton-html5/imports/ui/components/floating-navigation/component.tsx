import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import deviceInfo from '/imports/utils/deviceInfo';
import { layoutDispatch, layoutSelectInput } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { USER_AGGREGATE_COUNT_SUBSCRIPTION } from '/imports/ui/core/graphql/queries/users';
import { UserAggregateCountSubscriptionResponse } from '/imports/ui/components/user-list/types';
import SettingsContainer from '/imports/ui/components/settings/container';
import Icon from '/imports/ui/components/common/icon/component';
import useIsSimplifiedMobileView from '/imports/ui/components/layout/hooks/useIsSimplifiedMobileView';
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
  const isSimplifiedMobile = useIsSimplifiedMobileView();

  const {
    data: usersCountData,
  } = useDeduplicatedSubscription<UserAggregateCountSubscriptionResponse>(
    USER_AGGREGATE_COUNT_SUBSCRIPTION,
  );
  const usersCount = usersCountData?.user_aggregate?.aggregate?.count ?? 0;

  const setUserListOpen = (open: boolean) => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: open,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: open ? PANELS.USERLIST : PANELS.NONE,
    });
  };

  useEffect(() => {
    if (!deviceInfo.isMobile) {
      setUserListOpen(true);
    }
  }, []);

  if (isSimplifiedMobile) return null;

  return (
    <>
      <Styled.ParticipantsPill
        type="button"
        data-test="floatingParticipants"
        aria-label={intl.formatMessage(intlMessages.usersListLabel)}
        aria-expanded={isUserListOpen}
        onClick={() => setUserListOpen(!isUserListOpen)}
      >
        <Icon iconName="user_list" />
        {usersCount}
      </Styled.ParticipantsPill>
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
