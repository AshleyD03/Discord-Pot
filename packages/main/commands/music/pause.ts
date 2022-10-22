import { SlashCommandBuilder } from "@discordjs/builders";
import { buildVoiceExecute } from "../../functions/buildVoiceExecute";

const command: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("pause the current song"),

  execute: buildVoiceExecute(async ({ session, interaction }) => {
    const song = session.currentSong;
    if (!song) return interaction.reply(`no song to pause :stuck_out_tongue:`)
    const title = (await song.getDetails() || { title: "the current song"}).title;
    
    if (session.pause()) interaction.reply(`:pause_button: **paused** ${title}`)
    else interaction.reply(`uhh... Idkw but I failed to pause ${title} :sweat:`)
  })
}

export { command as pauseCommand }