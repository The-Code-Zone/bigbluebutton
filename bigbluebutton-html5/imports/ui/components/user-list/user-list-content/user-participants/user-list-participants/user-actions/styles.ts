import styled from 'styled-components';

import {
  smPaddingY,
  borderSize,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  listItemBgHover,
  listItemBg,
  itemFocusBorder,
} from '/imports/ui/stylesheets/styled-components/palette';

interface UserActionsTriggerProps {
  selected: boolean;
  isActionsOpen: boolean;
}

const UserActionsTrigger = styled.div<UserActionsTriggerProps>`
    & > div {
        border: none;
        padding: 0.2rem;

        background-color: ${listItemBg};
        border-top-left-radius: ${smPaddingY};
        border-bottom-left-radius: ${smPaddingY};
        border-top-right-radius: ${smPaddingY};
        border-bottom-right-radius: ${smPaddingY};

        ${({ selected }) => selected && `
        background-color: ${listItemBgHover};

        &:focus {
          box-shadow: inset 0 0 0 ${borderSize} ${itemFocusBorder}, inset 1px 0 0 1px ${itemFocusBorder};
        }
      `}
      
      ${({ isActionsOpen }) => isActionsOpen && `
      outline: transparent;
      outline-width: ${borderSize};
      outline-style: solid;
      background-color: ${listItemBgHover};
      box-shadow: inset 0 0 0 ${borderSize} ${itemFocusBorder}, inset 1px 0 0 1px ${itemFocusBorder};
      border-top-left-radius: ${smPaddingY};
      border-bottom-left-radius: ${smPaddingY};
  
      &:focus {
        outline-style: solid;
        outline-color: transparent !important;
      }
    `}
    }
`;

const NoPointerEvents = styled.div`
  pointer-events: none;
`;

export default {
  UserActionsTrigger,
  NoPointerEvents,
};
