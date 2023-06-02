import { Interaction, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder } from "discord.js"
import { MatchMaker } from "../classes/MatchMaker";

export const useDirectJoin = (MrMatch: MatchMaker) => {
    const handler = (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const name = interaction.options.getString('name');
        if (name === null) {
            return;
        }

        const roomCode = interaction.options.getString('roomcode')
        if (roomCode === null) {
            return;
        }

        MrMatch.joinDirect(name, roomCode);
    };

    const metadata = new SlashCommandBuilder()
        .setName('join')
        .setDescription('immediately assign yourself to a room as a guest')
        .addStringOption(
            (option) => option.setName('name')
                .setDescription('your discord name')
                .setRequired(true)
        )
        .addStringOption(
            (option) => option.setName('roomcode')
                .setDescription('code to the room you are joining')
                .setRequired(true)
        );

    return [handler, metadata.toJSON()] as [(interaction: Interaction) => void, RESTPostAPIChatInputApplicationCommandsJSONBody];
}