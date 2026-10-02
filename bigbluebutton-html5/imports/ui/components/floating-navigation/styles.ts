import styled from 'styled-components';
import {
  btnDefaultBg,
  btnDefaultColor,
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';

const FloatingButton = styled.button`
  position: fixed;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  background-color: ${btnDefaultBg};
  color: ${btnDefaultColor};
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
`;

const SettingsButton = styled(FloatingButton)`
  bottom: 0.9rem;
  left: 0.9rem;
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 50%;
  font-size: 1.1rem;
`;

export default {
  ParticipantsPill,
  SettingsButton,
};
