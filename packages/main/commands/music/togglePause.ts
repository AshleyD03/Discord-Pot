import { SlashCommandBuilder } from "@discordjs/builders";
import { buildVoiceExecute } from "../../functions/buildVoiceExecute";

const command: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("toggle-pause")
    .setDescription("pause/unpause the current song to the different mode"),

  execute: buildVoiceExecute(async ({ session, interaction }) => {
    const song = session.currentSong;
    if (!song) return interaction.reply(`no song to toggle-pause :stuck_out_tongue:`)
    const title = (await song.getDetails() || { title: "the current song"}).title;

    if (session.togglePause()) interaction.reply(`:play_pause: **toggle-paused** ${title}`)
    else interaction.reply(`uhh... Idkw but I failed to toggle-pause ${title} :sweat:`)
  })
}

export { command as togglePauseCommand }