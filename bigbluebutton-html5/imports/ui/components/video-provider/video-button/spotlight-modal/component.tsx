import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import CameraAsContentView from '/imports/ui/components/actions-bar/media-area/media-sharing/camera-as-content/component';

const intlMessages = defineMessages({
  title: {
    id: 'app.actionsBar.actionsDropdown.shareCameraAsContent',
    description: 'Spotlight modal title',
  },
});

interface SpotlightModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  priority: string;
  hasCameraAsContent: boolean;
  stopExternalVideoShare: () => void;
}

const SpotlightModal: React.FC<SpotlightModalProps> = ({
  isOpen,
  onRequestClose,
  priority,
  hasCameraAsContent,
  stopExternalVideoShare,
}) => {
  const intl = useIntl();

  return (
    <ModalSimple
      title={intl.formatMessage(intlMessages.title)}
      data-test="spotlightModal"
      {...{
        isOpen,
        onRequestClose,
        priority,
      }}
    >
      <CameraAsContentView
        intl={intl}
        hasCameraAsContent={hasCameraAsContent}
        onActionCompleted={onRequestClose}
        stopExternalVideoShare={stopExternalVideoShare}
      />
    </ModalSimple>
  );
};

export default SpotlightModal;
