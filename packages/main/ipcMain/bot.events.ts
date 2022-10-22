import { BrowserWindow } from "electron";
import { PlayerInfo } from "packages/UpdatedIpc";
import { Bot } from "../classes/Bot";
import { ipcMain } from "../ipcMain";

export const bot = new Bot();

/**
 * Add {@link Bot.onGuildCreate} event to notify all windows that guilds
 * have changed.
 */
bot.onGuildCreate = async (_) => {
  const guilds = await bot.getGuilds();
  BrowserWindow.getAllWindows().forEach(async (window) => 
    window.webContents.send("guilds-change", guilds)
  );
};

/**
 * handle a "bot-login" request.
 * Attempt to login the bot with the provided ID and reply with status.
 * Also send 'bot-login' event
 */
ipcMain.handle("bot-login", async (_event, id) => {
  // Check for window
  const win = BrowserWindow.fromWebContents(_event.sender);
  if (!win) return false;

  const result = await bot.login(id);
  win.webContents.send("bot-login-change", result);
  return result;
});

/**
 * Handle a "bot-info" request.
 * Return {@link BotInfo} about the bot. If this fails, return false.
 * This will fail if the bot is not logged in.
 */
ipcMain.handle("bot-info", async (_event) => {
  console.log(`logged in: ${bot.isLoggedIn()}`);
  return (await bot.getBotInfo()) || undefined;
});

/**
 * Handle a "bot-logout" request.
 * Attempt to logout the bot. Return the result & send a "bot-login-change" event with the current
 * login status.
 */
ipcMain.handle("bot-logout", async (_event) => {
  // Check for window
  const win = BrowserWindow.fromWebContents(_event.sender);
  if (!win) return false;

  // Return result & send
  const result = bot.logout();
  console.log(`bot logout: ${result}`);
  win.webContents.send("bot-login-change", !result);
  return result;
});

/**
 * Handle a "get-guilds" request.
 * Attempt to return a collection containing all guilds the bot is on.
 */
ipcMain.handle("guilds-info", async (_event) => {
  // Return result & send
  const result = bot.getGuilds();
  console.log(`get guilds: ${result}`);
  return result;
});

/**
 * Handle a "get-guild" request.
 * This collects detailed information on a guild, found with it's ID.
 */
ipcMain.handle("guild-info", async (_event, id) => {
  console.log(`get guild info: ${id}`)
  return await bot.getGuildInfo(id);
})

/**
 * Handle a "player-info" request.
 * This collects detailed information on the player session at a specific guild, found with it's ID.
 */
ipcMain.handle("player-info", async (_event, id) => {
  const session = bot.getAudioPlayerSession(id);
  if (!session) return undefined;
  const channel = session.getChannel()
  const playerInfo: PlayerInfo = {
    channel: channel,
    users: channel.members.map(member => member.user),
    currentlyPlaying: await session.getCurrentSong()?.getDetails(),
    songQueue: []
  }
  session.getQueue().list().forEach(async song => playerInfo.songQueue.push(await song.getDetails()))
  return playerInfo
})