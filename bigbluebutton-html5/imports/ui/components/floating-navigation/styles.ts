import styled from 'styled-components';
import { colorPrimary, colorWhite } from '/imports/ui/stylesheets/styled-components/palette';

const islandBg = 'rgba(22, 24, 30, 0.72)';

const FloatingButton = styled.button`
  position: fixed;
  top: 4px;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  border: none;
  cursor: pointer;
  background-color: ${islandBg};
  color: ${colorWhite};
  font-family: inherit;
  font-size: 15px;

  &:hover {
    filter: brightness(1.3);
  }

  &:focus-visible {
    outline: 2px solid ${colorPrimary};
    outline-offset: 2px;
  }

  i {
    color: inherit;
    font-size: 15px;
  }
`;

const ParticipantsPill = styled(FloatingButton)`
  left: 8px;
  padding: 0 14px;
  gap: 7px;
  border-radius: 17px;

  &[aria-expanded='true'] {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.35);
  }
`;

const SettingsDot = styled(FloatingButton)`
  right: 8px;
  width: 34px;
  border-radius: 50%;
`;

export default {
  ParticipantsPill,
  SettingsDot,
};
