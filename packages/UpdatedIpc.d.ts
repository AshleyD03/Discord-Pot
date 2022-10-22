import { IpcRenderer, IpcRendererEvent, IpcMain, IpcMainEvent } from "electron";
import type { ClientApplication, User, Collection, Guild, GuildChannel, GuildMember, BaseGuildVoiceChannel } from "discord.js";

/**
 * Type to create a {@link IpcRenderer.invoke} type.
 * @params channel
 * @params args
 * @params response
 */
type Invoke<channel, args = [], response = null> = (
  channel: channel,
  ...args: args
) => Promise<response>;

/**
 * Type to create a {@link IpcRenderer.on} type.
 * @params channel
 * @params recieve
 */
type On<channel, recieve = []> = (
  channel: channel,
  listener: (event: IpcRendererEvent, ...args: recieve) => void
) => this;

type Handle<channel, recieve = [], response = void> = (
  channel: channel,
  listener: (event: IpcMainEvent, ...args: recieve) => Promise<response>
) => void

/**
 * Invoke a change to the window's properties:
 * - minimize: minimize the window.
 * - maximize: toggle maximize the window.
 * - close: close the window, closing the program.
 */
type WindowInvoke = Invoke<
  "window-change",
  ["minimize" | "maximize" | "close"]
>;
type WindowHandle = Handle<
  "window-change",
  ["minimize" | "maximize" | "close"]
>;

/**
 * Invoke the bot to login with the provided string as token.
 * Returns the pass result and triggers {@link OnLogin}
 */
type BotLoginInvoke = Invoke<"bot-login", [string] | [], boolean>;
type BotLoginHandle = Handle<"bot-login", [string], boolean>;
type BotLogoutInvoke = Invoke<"bot-logout", [], boolean>;
type BotLogoutHandle = Handle<"bot-logout", [], boolean>;
type OnBotLoginChange = On<"bot-login-change", [boolean]>;

/**
 * Get information on the Bot.
 * Useful for informing users in UI.
 */
export type BotInfo = {
  user: User;
  application: ClientApplication;
  iconURL: string;
};
type BotInfoInvoke = Invoke<"bot-info", [], BotInfo | undefined>;
type BotInfoHandle = Handle<"bot-info", [], BotInfo | undefined>;

/**
 * Get information on the guilds the Bot is joined to.
 */
type GuildsInfoInvoke = Invoke<"guilds-info", [], Collection<string, OAuth2Guild> | undefined>;
type GuildsInfoHandle = Handle<"guilds-info", [], Collection<string, OAuth2Guild> | undefined>;

/**
 * Get detailed info on a single guild using it's ID.
 */
export type GuildInfo = {
  name: string
  id: string
  members: Collection<string, GuildMember>
  users: User[]
  memberCount: number
  ownerId: string
  owner: User
  iconURL: string
  channels: Collection<string, GuildChannel>
}
type GuildInfoInvoke = Invoke<"guild-info", [string], GuildInfo | undefined>
type GuildInfoHandle = Handle<"guild-info", [string], GuildInfo | undefined>

/**
 * Get information about the playlist playing at a specific guild.
 */
export type PlayerInfo = {
  channel: BaseGuildVoiceChannel
  users: User[]
  currentlyPlaying: SongDetails | undefined
  songQueue: SongDetails[]
}
type PlayerInfoInvoke = Invoke<"player-info", [string], PlayerInfo | undefined>
type PlayerInfoHandle = Handle<"player-info", [string], PlayerInfo | undefined>

/**
 * Listener for when a change occurs in a player session.
 * Provides the id of the guild where the session is, the type and a message for change log.
 */
export type PlayerChangeEvent = {
  id: string,
  type: "pause" | "unpase" | "skip" | "add" | "stop" | "joined" | "error"
  message: string
}
type OnPlayerChange = On<"player-change", [PlayerChangeEvent]>

/**
 * Store and retreieve data from electron store
 */
type ElectronStoreHandle = Handle<"electron-store", [string, any[]], [any]>
type ElectronStoreInvoke = Invoke<"electron-store", ['get', string], [any]> 
& Invoke<"electron-store", ['set', string, string]>
& Invoke<"electron-store", [string, ...any], [any]>

/**
 * Listener for when the guilds the bot is linked to has changed.
 * This could be it joining a guild, leaving or being removed.
 */
type OnGuildsChange = On<"guilds-change", [Collection<string, OAuth2Guild>]>;


/**
 * Listener for when the main process 'did-finish-load'.
 */
type OnMainProcessMessage = On<"main-process-message", [string]>

/**
 * =================================================
 * Extended version of IpcRenderer with added events
 * 
 * Make sure to link new ones here ^^
 * =================================================
 */
export interface UpdatedIpcRenderer extends IpcRenderer {
  invoke: WindowInvoke &
    BotLoginInvoke &
    BotInfoInvoke &
    BotLogoutInvoke &
    GuildsInfoInvoke &
    ElectronStoreInvoke &
    GuildInfoInvoke & PlayerInfoInvoke;

  on: OnBotLoginChange & OnGuildsChange & OnMainProcessMessage & OnPlayerChange;
}
export interface UpdatedIpcMain extends IpcMain {
  handle: WindowHandle &
    BotLoginHandle &
    BotLogoutHandle &
    GuildsInfoHandle &
    BotInfoHandle &
    ElectronStoreHandle &
    GuildInfoHandle & PlayerInfoHandle
}
