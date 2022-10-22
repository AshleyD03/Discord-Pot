import { VoiceConnection } from "@discordjs/voice";
import { CommandInteraction, Interaction } from "discord.js";
import { AudioPlayerSession } from "packages/main/classes/AudioPlayerSession";
import { Bot } from "packages/main/classes/Bot";
import { GuildMember } from "discord.js";

/**
 * Build a {@link DiscordCommand.execute} that has premade checks and interactions. This
 * will save time getting and checking values whilst also cutting down code repeation.
 * @param execute an async function to be executed, after the checks, with a payload of gauranteed values
 * @returns the {@link DiscordCommand.execute}
 */
const buildVoiceExecute =
  (
    execute: (payload: {
      session: AudioPlayerSession;
      connection: VoiceConnection;
      member: GuildMember;
      interaction: CommandInteraction;
      bot: Bot;
    }) => Promise<void>
  ) =>
  (interaction: Interaction, bot: Bot) => {
    if (!interaction.isCommand()) return;

    /**
     * Check used in guild.
     */
    if (!interaction.inGuild())
      return interaction.reply(
        `Sorry but you've got to be a guild to use this command`
      );

    /**
     * Check if the command comes from a guild member.
     */
    const member = interaction.member;
    if (!member || !(member instanceof GuildMember)) return;

    /**
     * Check that the bot is connected & that there is a session.
     */
    const session = bot.getAudioPlayerSession(interaction.guildId);
    const connection = session?.isConnected();
    if (!session || !connection)
      return interaction.reply(`I'm not in a channel right now`);

    /**
     * Check if the member is in the same voice channel.
     */
    const voice = member.voice;
    if (!voice.channelId || voice.channelId !== connection.joinConfig.channelId)
      return interaction.reply(
        `Sorry @${member.displayName} but you're not my channel`
      );

    /**
     * Then execute with payload.
     */
    return execute({session, connection, member, interaction, bot});
  };

  export {
    buildVoiceExecute
  }