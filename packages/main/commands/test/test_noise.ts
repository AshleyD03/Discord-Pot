import { SlashCommandBuilder } from "@discordjs/builders";
import { createAudioPlayer, createAudioResource, getVoiceConnection, NoSubscriberBehavior } from "@discordjs/voice";
import { GuildMember } from "discord.js";
import { DiscordCommand } from "../../global";

/**
 * Command to have the bot play a noise in the voice channel it is currently connected to.
 * This is a ping test for audio features.
 */
const command: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("test_noise")
    .setDescription("play a test audio in the currently joined voice channel")
    .addStringOption(option => 
      option.setName("path")
        .setDescription("the path to test noise")
        .setRequired(true)),

  execute: async (interaction) => {
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
     * Check that the bot is connected
     */
    const connection = getVoiceConnection(interaction.guildId);
    if (
      !connection ||
      connection.state.status === "disconnected" ||
      connection.state.status === "destroyed"
    )
      return interaction.reply(`I'm not in a channel right now`);

    /**
     * Check if the member is in the same voice channel
     */
    const voice = member.voice;
    if (!voice.channelId || voice.channelId !== connection.joinConfig.channelId)
      return interaction.reply(
        `Sorry @${member.displayName} but you're not my channel`
      );

    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause
      }
    })
    const path = interaction.options.getString("path") || "";
    const resource = createAudioResource(path)
    console.log(resource.playbackDuration)
    player.play(resource)
    connection.subscribe(player);

    /**
     * Working input : resources\test.mp4
     */
    interaction.reply(`path: ${path}`);
  },
};

export { command as testNoiseCommand };
