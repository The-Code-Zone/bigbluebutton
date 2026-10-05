import { layoutSelect } from '/imports/ui/components/layout/context';
import { DEVICE_TYPE } from '/imports/ui/components/layout/enums';

const useIsSimplifiedMobileView = (): boolean => {
  // @ts-ignore - layout context is untyped JS
  const deviceType = layoutSelect((i) => i.deviceType) as string | null;
  const enabled = window.meetingClientSettings?.public?.app?.simplifiedMobileLayout ?? false;

  return enabled && deviceType === DEVICE_TYPE.MOBILE;
};

export default useIsSimplifiedMobileView;
