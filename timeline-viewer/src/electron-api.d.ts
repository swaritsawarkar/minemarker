import type { DesktopModStatus } from './types';

declare global {
  interface Window {
    mineMarkerDesktop?: {
      getModStatus: () => Promise<DesktopModStatus>;
      installMod: () => Promise<DesktopModStatus>;
      openModsFolder: () => Promise<{ modsDirectory: string }>;
    };
  }
}

export {};
