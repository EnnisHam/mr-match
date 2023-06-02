import { Interaction, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder } from "discord.js"
import { stringToEnumValue } from '../types/match';
import { MatchMaker } from "../classes/MatchMaker";

export const useJoinAsHost = (MrMatch: MatchMaker) => {
    const handler = (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const host = interaction.user.username;
        const roomCode = interaction.options.getString('roomcode', true);
        const format = interaction.options.getString('format', true);
        const patchCards = interaction.options.getBoolean('patchcards', true);
        const region = interaction.options.getString('region', true);

        const options = {
            format: stringToEnumValue(format),
            patchCards: patchCards,
            game: 6,
            region: region
        };

        MrMatch.joinAsHost(host, roomCode, options);
        interaction.reply({ content: `added ${host} to queue`});
        console.log(`Match Appended ${host} ${roomCode} ${JSON.stringify(options)}`);
    }


    const metadata = new SlashCommandBuilder()
        .setName('join-as-host')
        .setDescription('host a game')
        .addStringOption((option) => option.setName('roomcode').setDescription('your room code')
            .setRequired(true))
        .addBooleanOption((option) => option.setName('patchcards').setDescription('enable patch cards?')
            .setRequired(true))
        .addStringOption((option) => option.setName('format').setDescription('battle format')
            .setRequired(true)
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
        .addStringOption((option) => option.setName('region').setDescription('where are you playing from?')
            .setRequired(true));
    
    return [handler, metadata.toJSON()] as [(interaction: Interaction) => void, RESTPostAPIChatInputApplicationCommandsJSONBody];
}