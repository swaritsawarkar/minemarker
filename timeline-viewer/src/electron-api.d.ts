import type { DesktopLatestSessionResult, DesktopModStatus } from './types';

declare global {
  interface Window {
    mineMarkerDesktop?: {
      getModStatus: () => Promise<DesktopModStatus>;
      installMod: () => Promise<DesktopModStatus>;
      openModsFolder: () => Promise<{ modsDirectory: string }>;
      getLatestSession: () => Promise<DesktopLatestSessionResult>;
      openSessionsFolder: () => Promise<{ sessionsDirectory: string }>;
    };
  }
}

export {};
