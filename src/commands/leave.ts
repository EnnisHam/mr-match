import { Interaction, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder } from "discord.js"
import { MatchMaker } from "../classes/MatchMaker";

export const useLeave = (MrMatch: MatchMaker) => {
    const handler = (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const name = interaction.user.username;
        MrMatch.leaveList(name);
        interaction.reply({ content: `${name} has left the list`});
        console.log(`marked ${name} as no longer waiting`);
    };

    const metadata = new SlashCommandBuilder()
        .setName('leave')
        .setDescription('leave list');

    return [handler, metadata.toJSON()] as [(interaction: Interaction) => void, RESTPostAPIChatInputApplicationCommandsJSONBody];
}