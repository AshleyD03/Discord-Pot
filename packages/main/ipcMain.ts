import { ipcMain as _ipcMain } from "electron";
import { UpdatedIpcMain } from "packages/UpdatedIpc";

/**
 * This file patches the UpdatedIpcMain interface over the
 * base ipcMain, so you can only add handles that are typed.
 */

// @ts-ignore
export const ipcMain: UpdatedIpcMain = _ipcMain