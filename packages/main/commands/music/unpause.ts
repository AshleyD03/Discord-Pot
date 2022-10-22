import { SlashCommandBuilder } from "@discordjs/builders";
import { buildVoiceExecute } from "../../functions/buildVoiceExecute";
import { DiscordCommand } from "../../global";

const command: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("unpause")
    .setDescription("unpause the current song"),

  execute: buildVoiceExecute(async ({ session, interaction }) => {
    const song = session.currentSong;
    if (!song) return interaction.reply(`no song to unpause :stuck_out_tongue:`)
    const title = (await song.getDetails() || { title: "the current song"}).title;

    if (session.unpause()) interaction.reply(`:arrow_forward: **unpaused** ${title}`)
    else interaction.reply(`uhh... Idkw but I failed to unpause ${title} :sweat:`)
  })
}

export { command as unpauseCommand }