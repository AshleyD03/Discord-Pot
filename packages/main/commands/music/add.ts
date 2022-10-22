import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";
import getTimeStamp from "../../functions/getTimeStamp";
import { getSongs } from "../../functions/getSongs";

/**
 * Command to have the bot add a song(s) to the current playlist. If no song is currently playing, automatically
 * play the first song added.
 * This command uses {@link getSongs} to find songs from the given url / name.
 * /add [link/name: String (required)]
 */
const command: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("add a song(s) to the queue")
    .addStringOption((option) =>
      option
        .setName("link-or-name")
        .setDescription("the link to play from or the name to search for")
        .setRequired(true)
    ),

  execute: async (interaction, bot) => {
    if (!interaction.isCommand()) return;
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.inGuild())
      return interaction.editReply(
        `Sorry but you've got to be a guild to use this command`
      );

    /**
     * Check if the command comes from a guild member
     */
    const member = interaction.member;
    if (!member || !(member instanceof GuildMember)) return;

    /**
     * Check that the bot is connected & that there is a session
     */
    const session = bot.getAudioPlayerSession(interaction.guildId);
    const connection = session?.isConnected();
    if (!session || !connection)
      return interaction.editReply(`I'm not in a channel right now`);

    /**
     * Check if the member is in the same voice channel
     */
    const voice = member.voice;
    if (!voice.channelId || voice.channelId !== connection.joinConfig.channelId)
      return interaction.editReply(
        `Sorry @${member.displayName} but you're not my channel`
      );

    /**
     * Attempt to find songs at url
     */
    const url = interaction.options.getString("link-or-name") || "";

    const songs = await getSongs(url, interaction.user.id).catch((err) => console.error(err));
    if (!songs || songs.length === 0)
      return interaction.editReply(`Couldn't find any songs at ${url}`);

    songs.forEach((song) => session.addSong(song));
    interaction.editReply(
      `Adding ${songs.length > 1 ? `${songs.length} songs` : `${songs[0].url}`}`
    );

    /**
     * If the first song of {@link songs} is the current song,
     * add a follow up to say now playing
     */
    if (session.currentSong && session.currentSong === songs[0]) {
      const currentInfo = await session.currentSong?.getDetails();
      let description = currentInfo.description;

      // description.replace(/[\\n]/g, ""
      if (description.length > 250) {
        description = description.substring(0, 250);
        description =
          description.substring(
            0,
            Math.min(description.length, description.lastIndexOf(" "))
          ) + "...";
      }

      interaction.followUp({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `Now Playing: ${currentInfo.title} [${currentInfo.lengthString}]`
            )
            .setURL(currentInfo.url)
            .setColor("#0099ff")
            .setDescription(description)
            .setFooter({ text: `[${currentInfo.lengthString}]` })
            .setTimestamp(),
        ],
      });
    }

    /**
     * Wait for all songs to fully load into system,
     * then update messaged to 
     */
    Promise.all(songs.map((song) => song.getDetails())).then(() => {
      interaction.editReply(
        `Successfully Added ${
          songs.length > 1 ? `all ${songs.length} songs` : `${songs[0].url}`
        }`
      );
    });

    // Dispatch event change
    bot.dispatchPlayerEvent({
      id: interaction.guildId,
      type: "add",
      message: `${getTimeStamp()} ${member.displayName} added ${songs.length} song(s) with input: "${url}"`
    })
  },
};

export { command as addCommand };
