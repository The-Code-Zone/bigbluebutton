import styled from 'styled-components';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';

const Stack = styled.div`
  position: fixed;
  top: 4rem;
  left: 0.75rem;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 16rem;
  max-height: calc(100vh - 10rem);
  overflow-y: auto;
  overflow-x: hidden;
`;

const Bubble = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.8rem;
  border-radius: 1.4rem;
  background-color: rgba(22, 24, 30, 0.72);
  color: ${colorWhite};
`;

const AvatarInitials = styled.span`
  flex: none;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colorWhite};
  font-size: 0.85rem;
  text-transform: capitalize;
`;

const AvatarImage = styled.img`
  flex: none;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  object-fit: cover;
`;

const Text = styled.span`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
  flex: 1;
`;

const Name = styled.span`
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Sub = styled.span`
  font-size: 0.75rem;
  color: #7addd5;
`;

const DeafenedBadge = styled.span`
  flex: none;
  font-size: 0.7rem;
  padding: 0.15rem 0.55rem;
  border-radius: 0.7rem;
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
};
