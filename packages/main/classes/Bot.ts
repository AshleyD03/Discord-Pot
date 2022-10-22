import {
  Client,
  ClientApplication,
  User,
  Collection,
  Intents,
  OAuth2Guild,
  GuildManager,
} from "discord.js";
import type { Interaction, BaseGuildVoiceChannel, Guild } from "discord.js";

/**
 * All Commands to be imported
 */
import { testCommand } from "../commands/test/test";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v8";
import { joinCommand } from "../commands/music/join";
import { leaveCommand } from "../commands/music/leave";
import { testNoiseCommand } from "../commands/test/test_noise";
import { addCommand } from "../commands/music/add";
import { AudioPlayerSession } from "./AudioPlayerSession";
import { VoiceConnection } from "@discordjs/voice";
import { listCommand } from "../commands/music/list";
import { pauseCommand } from "../commands/music/pause";
import { unpauseCommand } from "../commands/music/unpause";
import { togglePauseCommand } from "../commands/music/togglePause";
import { skipCommand } from "../commands/music/skip";
import { GuildInfo, PlayerChangeEvent } from "packages/UpdatedIpc";
import { BrowserWindow } from "electron";

/**
 * Link to add in testing:
 * https://discord.com/api/oauth2/authorize?client_id=835866610690293760&permissions=274881136704&scope=applications.commands%20bot
 */
export class Bot {
  private _token = "";
  private _client;
  private _intents = new Intents();
  private _commands: Collection<string, DiscordCommand> = new Collection();
  private _audioPlayerSessions: Collection<string, AudioPlayerSession> =
    new Collection();

  public onGuildCreate?: (guild: Guild) => void;

  /**
   * Initialise a new {@link Bot}. This links all onMethods
   * to event listeners to pre-empt the bot for when it is logged on.
   */
  constructor() {
    /**
     * Add intents the bot will use.
     */
    this._intents.add(Intents.FLAGS.GUILD_VOICE_STATES);
    this._intents.add([
      "GUILDS",
      "GUILD_MESSAGES",
      "GUILD_PRESENCES",
      "GUILD_MEMBERS",
    ]);

    /**
     * Load initialised commands.
     */
    this.loadCommands();

    /**
     * Create fresh client.
     */
    this._client = this.newClient();
  }

  /**
   * Create a new client with the needed event handlers.
   * Useful after {@link Client.destroy} has been called, to replace old client.
   * @returns a new {@link Client} for {@link this._client}
   */
  private newClient() {
    const client = new Client({
      intents: this._intents,
    });

    // When the bot recieves an interaction
    client.on("interactionCreate", (interaction) =>
      this.onInteractionCreate(interaction)
    );

    // When the bot joins a new server
    client.on("guildCreate", (guild) => {
      if (!this.onGuildCreate) return;
      this.onGuildCreate(guild);
    });

    // When the bot is ready
    client.once("ready", () => this.onceReady());

    return client;
  }

  /**
   * Have the bot attempt to login. If it logs in return true, else false.
   * If no token was provided, use previous {@link _token}.
   * @params the token to log in with. If empty use previous
   * @returns the status of if the login worked
   */
  async login(token: string | undefined): Promise<boolean> {
    if (token) this._token = token;
    console.log(`login token: "${this._token}"`);
    if (this._client.readyAt !== null) return true;
    return this._client
      .login(this._token)
      .then(() => {
        console.log("logged in");
        return true;
      })
      .catch((err) => {
        console.error(err);
        return false;
      });
  }

  /**
   * Have the bot attempt to log out. If not logged in, return true.
   * @returns the login status of the bot
   */
  public logout() {
    if (!this.isLoggedIn()) return true;

    this._client.destroy();
    this._client = this.newClient();
    return !this.isLoggedIn();
  }

  /**
   * Handles an interaction with the bot externally, such as commands being called.
   * @param interaction the interaction that has been made
   */
  private async onInteractionCreate(interaction: Interaction) {
    // Handle command interaction
    if (interaction.isCommand()) {
      const command = this._commands.get(interaction.commandName);
      if (command) command.execute(interaction, this);
    }
  }

  /**
   * Handles the bot being logged in and loaded.
   */
  private async onceReady() {
    this._client.guilds.fetch().then((guilds) => {
      console.log("logged in id: ", this._client.application?.id);
      guilds.forEach((guild) => console.log(`${guild.name} : ${guild.id}`));
    });
    this.registerCommands();
  }

  /**
   * Register all commands
   * TODO:: Register it for global later, currently use test servers id
   */
  private registerCommands() {
    const json = this._commands.map((command) => command.data.toJSON());
    const rest = new REST({ version: "9" }).setToken(this._token);

    const id = this._client.application?.id;
    if (!id) return;

    const testGuildId = "985369277022474301";
    // 835875235860971551

    rest // @ts-ignore
      .put(Routes.applicationCommands(id), {
        body: json,
      })
      .then(() => console.log("Registered Commands :D"))
      .catch(console.error);
  }

  /**
   * Loads all the commands that have been imported for this bot.
   * Add new commands here.
   */
  private loadCommands() {
    this._commands = new Collection();
    const commands: DiscordCommand[] = [
      testCommand,
      joinCommand,
      leaveCommand,
      testNoiseCommand,
      addCommand,
      listCommand,
      pauseCommand,
      unpauseCommand,
      togglePauseCommand,
      skipCommand,
    ];
    commands.forEach((cmd) => this._commands.set(cmd.data.name, cmd));
  }

  /**
   * Get the current audio player session running at a guild.
   * @param guildId the guild id
   */
  public getAudioPlayerSession(
    guildId: string
  ): AudioPlayerSession | undefined {
    return this._audioPlayerSessions.get(guildId);
  }

  /**
   * Attempt to create an {@link AudioPlayerSession} in a specified channel and append session
   * to {@link _audioPlayerSessions}.
   * @param channel the channel for the session to start in
   */
  public createAudioPlayerSession(
    channel: BaseGuildVoiceChannel
  ): VoiceConnection | undefined {
    const session = new AudioPlayerSession(channel, this);
    this._audioPlayerSessions.set(channel.guildId, session);
    return session.connection;
  }

  /**
   * Remove a {@link AudioPlayerSession} from {@link this._audioPlayerSessions}.
   * @param guildId the guild that session is being removed
   */
  public removeAudioPlayerSession(guildId: string) {
    this._audioPlayerSessions.delete(guildId);
  }

  /**
   * Returns the status of the bot being logged in.
   * @returns is the bot logged in or not
   */
  public isLoggedIn(): boolean {
    return this._client.isReady();
  }

  /**
   * Returns the {@link BotInfo} related to the current bot.
   * Only works when logged in.
   * @returns the user & application info about this bot
   */
  public async getBotInfo(): Promise<BotInfo | void> {
    if (!this.isLoggedIn()) return console.log("not logged in");

    // Get user info
    let user: User | null = this._client.user;
    if (user === null) return console.log("missing user");
    user = await user.fetch();

    // Get application info
    let application = this._client.application;
    if (application === null) return console.log("missing application");
    application = await application.fetch();

    // Get iconURL as methods parsed over don't work
    let iconURL = user.avatarURL() || application.iconURL() || "";

    return {
      user,
      application,
      iconURL,
    };
  }

  /**
   * Get a Collection of all guilds (servers) the bot is on.
   * @returns a collection of guilds
   */
  public async getGuilds(): Promise<
    Collection<string, OAuth2Guild> | undefined
  > {
    if (!this.isLoggedIn()) {
      console.log("can't get guilds, not logged in");
      return;
    }

    const guildManager = this._client.guilds;
    if (guildManager === null) {
      console.log("can't get guilds, no guildManager");
      return;
    }

    try {
      return await guildManager.fetch();
    } catch (err) {
      return undefined;
    }
  }

  /**
   * Get detailed information on a single guild, found by it's ID.
   * @param id the guild's ID
   * @returns information on the guild
   */
  public async getGuildInfo(id: string): Promise<GuildInfo | undefined> {
    try {
      console.log(id);
      const guild = await this._client.guilds.fetch(id);
      if (!guild) return undefined;

      const members = await guild.members.fetch();
      if (!members) return undefined;

      const owner = members.get(guild.ownerId)?.user;
      if (!owner) return undefined;

      return {
        name: guild.name,
        id,
        members: members,
        memberCount: guild.memberCount,
        ownerId: guild.ownerId,
        owner: owner,
        iconURL: guild.iconURL() || "",
        channels: await guild.channels.fetch(),
        users: members.map((member) => member.user),
      };
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }

  /**
   * Dispatch a music player change event to all electron windows.
   * @param event what change has happened to a player session
   */
  public dispatchPlayerEvent(event: PlayerChangeEvent) {
    console.log(event)
    BrowserWindow.getAllWindows().forEach(async (window) =>
      window.webContents.send("player-change", event)
    );
  }
}
