import styled from 'styled-components';
import Icon from '/imports/ui/components/common/icon/component';
import {
  colorGrayIcons,
  colorGrayUserListToolbar,
  colorPrimary,
  colorSuccess,
} from '/imports/ui/stylesheets/styled-components/palette';

const ToolbarContainer = styled.div`
  border-radius: 1.5rem;
  background-color: ${colorGrayUserListToolbar};
  display: flex;
  gap: 0.5rem;
  padding: 0.25rem 1rem;
  align-items: center;
`;

const ToolbarItem = styled.div<{ disabled?: boolean, hasText?: boolean }>`
  cursor: pointer;
  color: ${({ hasText }) => (hasText ? colorPrimary : colorGrayIcons)};

  line-height: 1;

  ${({ disabled }) => disabled && `
    cursor: not-allowed;
  `}
`;

const MicMeter = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  overflow: hidden;
`;

const MicMeterFill = styled.span`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${colorSuccess};
  opacity: 0.5;
  transition: height 0.3s ease-out;
`;

const MicMeterIcon = styled(Icon)`
  position: relative;
`;

const MoreItems = styled.div`
  cursor: pointer;
  color: ${colorGrayIcons};
`;

const Pipe = styled.span`
  color: ${colorGrayIcons};
`;

export default {
  ToolbarContainer,
  ToolbarItem,
  MicMeter,
  MicMeterFill,
  MicMeterIcon,
  MoreItems,
  Pipe,
};
