import styled from 'styled-components';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  padding: 46px 8px 8px 8px;
  overflow-y: auto;
  overflow-x: hidden;
`;

const Bubble = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 100%;
  padding: 7px 14px 7px 8px;
  border-radius: 24px;
  background-color: rgba(22, 24, 30, 0.72);
  color: ${colorWhite};
`;

const VolumeSlot = styled.span`
  flex: none;
  margin-left: auto;
  display: flex;
  align-items: center;
`;

const AvatarInitials = styled.span`
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colorWhite};
  font-size: 14px;
  text-transform: capitalize;
`;

const AvatarImage = styled.img`
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
`;

const Text = styled.span`
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
`;

const Name = styled.span`
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Sub = styled.span`
  font-size: 12px;
  color: #7addd5;
`;

const DeafenedBadge = styled.span`
  flex: none;
  font-size: 11px;
  padding: 2px 9px;
  border-radius: 11px;
  background-color: rgba(223, 89, 114, 0.35);
  color: #ffb9c7;
`;

export default {
  Stack,
  Bubble,
  AvatarInitials,
  AvatarImage,
  Text,
  Name,
  Sub,
  DeafenedBadge,
  VolumeSlot,
};
