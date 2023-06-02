import { Interaction, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder } from "discord.js"
import { stringToEnumValue } from '../types/match';
import { MatchMaker } from "../classes/MatchMaker";

export const useJoinAsGuest = (MrMatch: MatchMaker) => {
    const handler = (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        if (interaction.commandName === 'join-as-guest') {
            const guest = interaction.options.getString('name');
            if (guest === null) return;

            const roomCode = interaction.options.getString('roomcode');

            if (roomCode !== null) {
                MrMatch.joinDirect(guest, roomCode);
                return;
            }

            const format = interaction.options.getString('format');
            if (format === null) return;

            const patchCards = interaction.options.getBoolean('patchcards');
            if (patchCards === null) return;

            const region = interaction.options.getString('region');
            if (region === null) return;

            const options = {
                format: stringToEnumValue(format),
                patchCards: patchCards,
                game: 6,
                region: region
            };

            MrMatch.joinAsGuest(guest, options);
            interaction.reply({ content: `added ${guest} to queue`});
            console.log(`Match Appended ${guest} ${roomCode} ${options.toString()}`);
            return;
        }
    };

    const metadata = new SlashCommandBuilder()
        .setName('join-as-guest')
        .setDescription('join a room')
        .addStringOption((option) => option.setName('name').setDescription('your discord name').setRequired(true))
        .addBooleanOption((option) => option.setName('patchcards').setDescription('enable patch cards?').setRequired(true))
        .addStringOption((option) => option.setName('format').setDescription('battle format').setRequired(true)
            .setChoices(
                {
                    name: 'triples',
                    value: 'triples'
                },
                {
                    name: 'singles',
                    value: 'singles'
                }
            ))
        .addStringOption((option) => option.setName('region').setDescription('where are you playing from?').setRequired(true))
        .addStringOption((option) => option.setName('roomcode').setDescription('your room code'));

    return [handler, metadata.toJSON()] as [(interaction: Interaction) => void, RESTPostAPIChatInputApplicationCommandsJSONBody];
}