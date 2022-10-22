import { UpdatedIpcRenderer } from '../../UpdatedIpc'
import type { Clipboard } from 'electron';
import { BotInfo as _BotInfo } from '../../UpdatedIpc';

export {};

declare global {
  interface Window {
    // Expose some Api through preload script
    fs: typeof import("fs");
    ipcRenderer: UpdatedIpcRenderer;
    removeLoading: () => void;
    clipboard: Clipboard
  }

  type BotInfo = _BotInfo
}