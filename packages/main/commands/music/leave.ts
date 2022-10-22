import { SlashCommandBuilder } from "@discordjs/builders";
import { getVoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";

const command: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("ask bot to leave your voice channel"),
  execute: async (interaction) => {
    if (!interaction.isCommand()) return;
    if (!interaction.inGuild())
      return interaction.reply(
        `Sorry but you've got to be a guild to use this command`
      );

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
     * Event listener to handle the result of asking the bot to disconnect.
     * This updates the reply & will check if in 5 secounds the bot is still disconnected.
     * If true destroy the bot to save storage.
     */
    const disconnectEvent = () => {
      interaction.editReply(`:boom: Left Channel :boom:`);
      setTimeout(() => {
        if (connection.state.status == "disconnected") connection.destroy();
      }, 1000);
      connection.removeListener(
        VoiceConnectionStatus.Disconnected,
        disconnectEvent
      );
    };

    /**
     * Reply and then attempt to disconnect
     */
    interaction.reply(":bomb: Attempting to Leave :bomb: ").then(() => {
      connection.addListener(
        VoiceConnectionStatus.Disconnected,
        disconnectEvent
      );
      connection.disconnect();
    });
  },
};

export { command as leaveCommand };
