import {
    Interaction,
    SlashCommandBuilder,
    RESTPostAPIChatInputApplicationCommandsJSONBody
} from 'discord.js'
import { MatchMaker } from 'src/classes/MatchMaker'

export const useExtendTimer = (MrMatch: MatchMaker) => {
    const metadata = new SlashCommandBuilder()
        .setName('extend-timer')
        .setDescription('extends the lifetime of your entry in the board');

    const handler = async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const user = interaction.user.username;
        await interaction.reply({ content: `extending timer for ${user}'s room`});
        MrMatch.extendLifespan(user);
    }

    return [handler, metadata.toJSON()] as [(interaction: Interaction) => void, RESTPostAPIChatInputApplicationCommandsJSONBody];
}