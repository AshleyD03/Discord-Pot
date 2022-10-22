import { SlashCommandBuilder } from "@discordjs/builders";
import { buildVoiceExecute } from "../../functions/buildVoiceExecute";
import { MessageEmbed } from "discord.js";

/**
 * Command to have the bot list the current song queue for the current {@link AudioPlayerSession}
 * that is running on that server.
 */
const command: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription("list which songs are in the queue")
    .addIntegerOption((option) =>
      option
        .setName("number")
        .setDescription("the number of the page in the list you want to view")
    ),

  execute: buildVoiceExecute(async ({ session, interaction}) => {
    const playlist = session.queue.list();

    /**
     * Collect pageNumber & pages. If pageNumber is too big go to end. If pageNumber is too small go to start.
     */
    let pageNumber =
      interaction.options.getInteger("number") || 1;
    const pages = Math.ceil(playlist.length / 10);
    if (pageNumber > pages) pageNumber = pages;
    if (pageNumber < 1) pageNumber = 1;

    /**
     * Initialise embed
     */
    const replyEmbed = new MessageEmbed().setColor("#0099ff").setTimestamp();
    await interaction.deferReply();

    /**
     * Check if a song is playing
     */
    const currentSong = session.currentSong;
    if (currentSong) {
      const currentInfo = await currentSong.getDetails();

      /**
       * Add title to embed
       */
      replyEmbed
        .setTitle(
          `Currently Playing: ${currentInfo.title} [${currentInfo.lengthString}]`
        )
        .setURL(currentSong.url);

      /**
       * If no songs are in the playlist return empty message.
       */
      if (playlist.length == 0) {
        replyEmbed
          .setDescription("The queue is empty :confused:")
          .setFooter({ text: "Page [1/1]" });
      }
      /**
       * Else print contents of that page.
       */
      else {
        let description = "";
        let i = 0;
        while (i < playlist.length - (pageNumber - 1) * 10 && i < 10) {
          const pos = i + (pageNumber - 1) * 10;
          const song = playlist[pos];
          if (!song) {
            console.log(pos)
            break;
          }
          const { title, lengthString } = await song.getDetails();
          description += `**${pos + 1}.** ${title} [${lengthString}]\n`;
          i++;
        }
        description.slice(0, -2);
        replyEmbed
          .setDescription(description)
          .setFooter({ text: `Page [${pageNumber}/${pages}]` });
      }
    } else {
      /**
       * No song playing reply
       */
      replyEmbed
        .setTitle(`No song's playing - Search on YouTube or with /search`)
        .setURL(`https://www.youtube.com/`)
        .setFooter({ text: "Page [1/1]" })
        .setDescription(`:confused: The queue is empty :confused:`);
    }

    
    interaction.editReply({
      embeds: [replyEmbed],
    });
  }),
};

export { command as listCommand };
