import { layoutSelectInput } from '/imports/ui/components/layout/context';

export const MICRO_VIEWPORT_MAX_WIDTH = 400;
export const MICRO_VIEWPORT_MAX_HEIGHT = 320;

export const isMicroViewport = (width: number, height: number): boolean => (
  width <= MICRO_VIEWPORT_MAX_WIDTH && height <= MICRO_VIEWPORT_MAX_HEIGHT
);

interface BrowserInput {
  width: number;
  height: number;
}

const useIsMicroViewport = (): boolean => {
  // @ts-ignore - layout context is untyped JS
  const browser = layoutSelectInput((i) => i.browser) as BrowserInput;

  return isMicroViewport(browser.width, browser.height);
};

export default useIsMicroViewport;
