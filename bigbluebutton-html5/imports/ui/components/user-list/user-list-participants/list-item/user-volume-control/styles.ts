import styled from 'styled-components';
import { colorGrayLighter, colorPrimary } from '/imports/ui/stylesheets/styled-components/palette';

const VolumeControlContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0 0.25rem;
`;

const VolumeSlider = styled.input`
  --level-fill: 0%;
  -webkit-appearance: none;
  appearance: none;
  width: 3.5rem;
  height: 0.3rem;
  border-radius: 0.25rem;
  background: linear-gradient(
    to right,
    ${colorPrimary} 0%,
    ${colorPrimary} var(--level-fill),
    ${colorGrayLighter} var(--level-fill),
    ${colorGrayLighter} 100%
  );
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    border: none;
    background: ${colorPrimary};
  }

  &::-moz-range-thumb {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    border: none;
    background: ${colorPrimary};
  }
`;

export default {
  VolumeControlContainer,
  VolumeSlider,
};
