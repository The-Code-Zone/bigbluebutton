// @ts-nocheck
/* eslint-disable */
import styled from 'styled-components';
import Icon from '/imports/ui/components/common/icon/component';
import { colorDanger, colorSuccess, colorWhite } from '/imports/ui/stylesheets/styled-components/palette';

const Voice = styled(Icon)`
  height: 1.1rem;
  width: 1.1rem;
  margin-left: 0.5rem;
  color: ${colorWhite};
  border-radius: 50%;

  &::before {
    font-size: 80%;
  }

  background-color: ${colorSuccess};
`;

const Muted = styled(Icon)`
  height: 1.1rem;
  width: 1.1rem;
  color: ${colorWhite};
  border-radius: 50%;
  margin-left: 0.5rem;

  &::before {
    font-size: 80%;
  }

  background-color: ${colorDanger};
`;

const VoiceMeter = styled.span`
  position: relative;
  display: inline-block;
  height: 1.1rem;
  width: 1.1rem;
  margin-left: 0.5rem;
  border-radius: 50%;
  overflow: hidden;
  background-color: rgba(10, 24, 16, 0.65);
`;

const VoiceMeterFill = styled.span`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${colorSuccess};
  transition: height 0.1s linear;
`;

const VoiceMeterIcon = styled(Icon)`
  position: absolute;
  top: 0;
  left: 0;
  height: 1.1rem;
  width: 1.1rem;
  color: ${colorWhite};
  text-align: center;

  &::before {
    font-size: 80%;
    line-height: 1.1rem;
  }
`;

export default {
  Voice,
  Muted,
  VoiceMeter,
  VoiceMeterFill,
  VoiceMeterIcon,
};
