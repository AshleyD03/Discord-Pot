import { SlashCommandBuilder } from "@discordjs/builders";
import { buildVoiceExecute } from "../../functions/buildVoiceExecute";

/**
 * Command to skip to a different song in the current song queue.
 * /skip [index: Int (not required)]
 */
const command: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("skip the current song to the next one")
    .addIntegerOption((option) => 
      option
        .setName("index")
        .setDescription("the index you want to skip to in the list")),

  execute: buildVoiceExecute(async ({ session, interaction }) => {
    const song = session.currentSong;
    if (!song) return interaction.reply(`no song to skip :stuck_out_tongue:`)

    /**
     * Find out how far to skip to.
     */
    const index = interaction.options.getInteger("index") || 1
    const max: number = session.queue.list().length - 1;

    /**
     * Check in range.
     */
    if (index < 1) return interaction.reply({
      ephemeral: true,
      content: `Index must be higher then 1`
    })


    /**
     * Deque Index - 1 times
     */
    for (let i = 0; i < index - 1; i++) {
      session.queue.deque();
    }

    /**
     * Then call {@link session.currentSong}.
     */
    let title
    if (session.playNextSong()) {
      title = (await session.currentSong?.getDetails() || { title: "next song"}).title;
    } else {
      title = "Nothing..."
    }
    interaction.reply(`:track_next: Skipped to ${title}`)
  })
}

export { command as skipCommand }