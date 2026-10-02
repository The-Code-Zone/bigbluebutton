import styled from 'styled-components';
import { colorPrimary, colorWhite } from '/imports/ui/stylesheets/styled-components/palette';

const islandBg = 'rgba(22, 24, 30, 0.72)';

const FloatingButton = styled.button`
  position: fixed;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  background-color: ${islandBg};
  color: ${colorWhite};
  font-family: inherit;

  &:hover {
    filter: brightness(1.3);
  }

  &:focus-visible {
    outline: 2px solid ${colorPrimary};
    outline-offset: 2px;
  }

  i {
    color: inherit;
  }
`;

const ParticipantsPill = styled(FloatingButton)`
  top: 0.75rem;
  left: 0.75rem;
  height: 2.6rem;
  padding: 0 1rem;
  gap: 0.45rem;
  border-radius: 1.3rem;
  font-size: 1rem;

  &[aria-expanded='true'] {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.35);
  }
`;

const SettingsDot = styled(FloatingButton)`
  top: 0.75rem;
  right: 0.75rem;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 50%;
  font-size: 1rem;
`;

export default {
  ParticipantsPill,
  SettingsDot,
};
