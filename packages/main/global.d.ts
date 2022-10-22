import type { SlashCommandBuilder } from "@discordjs/builders";
import { AudioPlayer } from "@discordjs/voice";
import type {
  ClientApplication,
  Collection,
  Guild,
  Interaction,
  OAuth2Guild,
  User,
} from "discord.js";
import { Bot } from "./classes/Bot";
import { Readable } from "stream";
import ytdl from "ytdl-core";
import { updatedIpcMain } from "../UpdatedIpc"
export {};


declare global {
  /**
   * A command for the bot to execute when requested by users.
   */
  export interface DiscordCommand {
    data:
      | SlashCommandBuilder
      | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    execute(interaction: Interaction, bot: Bot);
  }

  /**
   * The details of a song that the bot can attempt to play.
   * Useful to provide users with information.
   */
  export interface SongDetails {
    url: string;
    title: string;
    lengthString: string;
    lengthSeconds: number;
    authorName: string;
    ytdlVideoInfo?: ytdl.videoInfo;
    isValid: boolean;
    description: string;
    ownerId: string;
  }

  /**
   * A song the bot can attempt to play.
   */
  export interface Song {
    url: string;
    ownerId: string;
    isValid: () => boolean;
    isYoutube: () => boolean;
    getStream: () => Readable | undefined;
    getDetails: () => Promise<SongDetails>;
  }

  export interface BotInfo {
    user: User;
    application: ClientApplication;
    iconURL: string;
  }
}
