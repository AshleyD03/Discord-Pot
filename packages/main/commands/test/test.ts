import { SlashCommandBuilder } from "@discordjs/builders";
import type { DiscordCommand } from "../../global";
import { generateDependencyReport } from "@discordjs/voice";

const command: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription('say "Hi Mum o/"'),
  execute: async (interaction) => {
    console.log("execute");
    if (!interaction.isCommand()) return;
    interaction.reply(`Hi Mum o/\n${generateDependencyReport()}`);
  },
};

export { command as testCommand };
