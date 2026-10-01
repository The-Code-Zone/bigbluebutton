import { useEffect, useRef } from 'react';
import { throttle } from '/imports/utils/throttle';
import { layoutDispatch, layoutSelect, layoutSelectInput } from '/imports/ui/components/layout/context';
import DEFAULT_VALUES from '/imports/ui/components/layout/defaultValues';
import { ACTIONS, CAMERADOCK_POSITION } from '/imports/ui/components/layout/enums';
import Session from '/imports/ui/services/storage/in-memory';

const windowWidth = () => window.document.documentElement.clientWidth;
const windowHeight = () => window.document.documentElement.clientHeight;

const MicroLayout = (props) => {
  const { isPresentationEnabled } = props;

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  const input = layoutSelect((i) => i.input);
  const deviceType = layoutSelect((i) => i.deviceType);
  const isRTL = layoutSelect((i) => i.isRTL);
  const fullscreen = layoutSelect((i) => i.fullscreen);
  const fontSize = layoutSelect((i) => i.fontSize);
  const currentPanelType = layoutSelect((i) => i.currentPanelType);

  const presentationInput = layoutSelectInput((i) => i.presentation);
  const cameraDockInput = layoutSelectInput((i) => i.cameraDock);
  const actionbarInput = layoutSelectInput((i) => i.actionBar);
  const externalVideoInput = layoutSelectInput((i) => i.externalVideo);
  const genericMainContentInput = layoutSelectInput((i) => i.genericMainContent);
  const screenShareInput = layoutSelectInput((i) => i.screenShare);
  const sharedNotesInput = layoutSelectInput((i) => i.sharedNotes);
  const layoutContextDispatch = layoutDispatch();

  const prevDeviceType = usePrevious(deviceType);

  const hasContent = () => {
    const { isOpen, slidesLength } = presentationInput;
    const { hasExternalVideo } = externalVideoInput;
    const { genericContentId } = genericMainContentInput;
    const { hasScreenShare } = screenShareInput;
    const { isPinned: isSharedNotesPinned } = sharedNotesInput;

    const hasPresentation = isPresentationEnabled && slidesLength !== 0 && isOpen;

    return hasPresentation || hasExternalVideo || hasScreenShare
      || isSharedNotesPinned || !!genericContentId;
  };

  const calculatesLayout = () => {
    const { calculatesActionbarHeight } = props;

    const contentActive = hasContent();
    const fullWindowBounds = {
      width: windowWidth(),
      height: windowHeight(),
      top: 0,
      left: 0,
    };
    const actionbarHeight = calculatesActionbarHeight();

    const mediaBounds = contentActive
      ? { ...fullWindowBounds, zIndex: 1 }
      : {
        width: 0, height: 0, top: 0, left: 0, zIndex: 0,
      };

    layoutContextDispatch({
      type: ACTIONS.SET_NAVBAR_OUTPUT,
      value: {
        display: false,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        tabOrder: DEFAULT_VALUES.navBarTabOrder,
        zIndex: 0,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_ACTIONBAR_OUTPUT,
      value: {
        display: actionbarInput.hasActionBar,
        width: fullWindowBounds.width,
        height: actionbarHeight.height,
        innerHeight: actionbarHeight.innerHeight,
        top: fullWindowBounds.height - actionbarHeight.height,
        left: 0,
        padding: actionbarHeight.padding,
        tabOrder: DEFAULT_VALUES.actionBarTabOrder,
        zIndex: 3,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_NAVIGATION_OUTPUT,
      value: {
        display: false,
        minWidth: 0,
        width: 0,
        maxWidth: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        tabOrder: DEFAULT_VALUES.sidebarNavTabOrder,
        isResizable: false,
        zIndex: 0,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_OUTPUT,
      value: {
        display: false,
        minWidth: 0,
        width: 0,
        maxWidth: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        currentPanelType,
        tabOrder: DEFAULT_VALUES.sidebarContentTabOrder,
        isResizable: false,
        zIndex: 0,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_RESIZABLE_EDGE,
      value: {
        top: false,
        right: false,
        bottom: false,
        left: false,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_MEDIA_AREA_SIZE,
      value: {
        width: fullWindowBounds.width,
        height: fullWindowBounds.height,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_CAMERA_DOCK_OUTPUT,
      value: {
        display: cameraDockInput.numCameras > 0 && !contentActive,
        position: CAMERADOCK_POSITION.CONTENT_TOP,
        minWidth: fullWindowBounds.width,
        width: fullWindowBounds.width,
        maxWidth: fullWindowBounds.width,
        minHeight: fullWindowBounds.height,
        height: fullWindowBounds.height,
        maxHeight: fullWindowBounds.height,
        top: 0,
        left: 0,
        right: isRTL ? 0 : null,
        tabOrder: 4,
        isDraggable: false,
        resizableEdge: {
          top: false,
          right: false,
          bottom: false,
          left: false,
        },
        zIndex: 1,
        focusedId: input.cameraDock.focusedId,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_PRESENTATION_OUTPUT,
      value: {
        display: presentationInput.isOpen,
        width: mediaBounds.width,
        height: mediaBounds.height,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: isRTL ? 0 : null,
        tabOrder: DEFAULT_VALUES.presentationTabOrder,
        isResizable: false,
        zIndex: mediaBounds.zIndex,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_SCREEN_SHARE_OUTPUT,
      value: {
        width: mediaBounds.width,
        height: mediaBounds.height,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: isRTL ? 0 : null,
        zIndex: mediaBounds.zIndex,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_EXTERNAL_VIDEO_OUTPUT,
      value: {
        display: externalVideoInput.hasExternalVideo,
        width: mediaBounds.width,
        height: mediaBounds.height,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: isRTL ? 0 : null,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_GENERIC_CONTENT_OUTPUT,
      value: {
        width: mediaBounds.width,
        height: mediaBounds.height,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: isRTL ? 0 : null,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_SHARED_NOTES_OUTPUT,
      value: {
        width: mediaBounds.width,
        height: mediaBounds.height,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: isRTL ? 0 : null,
      },
    });
  };

  const throttledCalculatesLayout = throttle(() => calculatesLayout(), 50, {
    trailing: true,
    leading: true,
  });

  useEffect(() => {
    Session.setItem('layoutReady', true);
    throttledCalculatesLayout();
  }, []);

  useEffect(() => {
    if (deviceType === null) return;

    throttledCalculatesLayout();
  }, [input, deviceType, prevDeviceType, isRTL, fontSize, fullscreen, isPresentationEnabled]);

  return null;
};

export default MicroLayout;
