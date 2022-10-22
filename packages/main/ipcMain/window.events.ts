import { BrowserWindow } from "electron";
import { ipcMain } from "../ipcMain";

ipcMain.handle("window-change", async (_event, status) => {
  const window = BrowserWindow.fromWebContents(_event.sender);
  if (!status || !window) return;

  switch (status) {
    case "minimize":
      return window.minimize();
    case "maximize":
      return window.isMaximized() ? window.restore() : window.maximize();
    case "close":
      return window.close();
  }
});
