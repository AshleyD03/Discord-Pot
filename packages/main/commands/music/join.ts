import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember } from "discord.js";
import {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  entersState,
} from "@discordjs/voice";

/**
 * Command to have the bot join a voice channel.
 */
const command: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("ask bot to join your voice channel"),

  execute: async (interaction, bot) => {
    if (!interaction.isCommand()) return;
    if (!interaction.inGuild())
      return interaction.reply(
        `Sorry but you've got to be a guild to use this command`
      );

    /**
     * Check if the command comes from a guild member
     */
    const member = interaction.member;
    if (!member || !(member instanceof GuildMember)) return;

    /**
     * Check if they are in a voice channel
     */
    const voice = member.voice;
    if (!voice.channelId)
      return interaction.reply(
        `Sorry @${member.displayName} but you're not in a channel I can join`
      );

    /**
     * Attempt to fetch voice channel
     */
    const guild = interaction.guild;
    if (!guild) return;
    const channel = await guild.channels.fetch(voice.channelId);
    if (!channel || !channel.isVoice())
      return interaction.reply(`Sorry I'm having trouble finding that channel`);
    /**
     * Check if they are already connected to that channel
     */
    const oldConnection = getVoiceConnection(interaction.guildId);
    if (oldConnection && oldConnection.joinConfig.channelId === channel.id)
      return interaction.reply(`I'm already in here silly :sweat_smile:`);

    /**
     * Join the voice channel
     */
    const connection = bot.createAudioPlayerSession(channel);
    if (!connection) return interaction.reply(`Sorry something weird happened...`)

    /**
     * Event listener to handle the changing state of the connection as it attempts to join.
     * This listener is removed if it achieves any of the following {@link VoiceConnectionState}:
     * "ready", "disconnected", "destroyed".
     */
    const stateChangeEvent = () => {
      switch (connection.state.status) {
        case "signalling":
          interaction.editReply(`:red_circle: Signalling Discord :red_circle:`);
          break;
        case "connecting":
          interaction.editReply(`:orange_circle: Connecting :orange_circle:`);
          break;
        case "ready":
          interaction.editReply(`:green_circle: Ready to Play :green_circle:`);
          connection.removeListener("stateChange", stateChangeEvent);
          break;
        case "disconnected":
        case "destroyed":
          interaction.editReply(`:skull: Failed to Connect :skull:`);
          connection.removeListener("stateChange", stateChangeEvent);
          break;
      }
    };

    /**
     * Reply and add listener.
     * It is done in this order to ensure {@link Interaction.editReply} is used after {@link Interaction.reply}.
     * Please note the bot has already began to join the channel before the event listener is added.
     */
    interaction
      .reply(`:red_circle: Signalling Discord :red_circle:`)
      .then(() => {
        connection.on("stateChange", stateChangeEvent);
        stateChangeEvent();
      });

    /**
     * Handler for disconnects, taken from the discord.js/voice guide:
     * {@link https://discordjs.guide/voice/voice-connections.html#handling-disconnects}
     */
    connection.on(
      VoiceConnectionStatus.Disconnected,
      async (oldState, newState) => {
        try {
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
          ]);
          // Seems to be reconnecting to a new channel - ignore disconnect
        } catch (error) {
          // Seems to be a real disconnect which SHOULDN'T be recovered from
          connection.destroy();
        }
      }
    );
  },
};

export { command as joinCommand };
