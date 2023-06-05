import { Interaction, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder } from "discord.js"
import { RoomOptions, stringToEnumValue } from '../types/match';
import { MatchMaker } from "../classes/MatchMaker";

export const useListRooms = (MrMatch: MatchMaker) => {
    const metadata = new SlashCommandBuilder()
        .setName('list-rooms')
        .setDescription('list waiting rooms')
        .addStringOption((option) => option.setName('game').setDescription('Which game are you playing?'))
        .addStringOption((option) => option.setName('format').setDescription('battle format')
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
        .addStringOption((option) => option.setName('patchcards').setDescription('enable patch cards?'))
        .addStringOption((option) => option.setName('region').setDescription('where are you playing from?'));

    const handler = async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        if (interaction.commandName === 'list-rooms') {
            await interaction.deferReply();

            const game = interaction.options.getNumber('game');
            const format = interaction.options.getString('format');
            const patchcards = interaction.options.getBoolean('patchcards');
            const region = interaction.options.getString('region');

            const searchOptions: Partial<RoomOptions> = {
                game: game ? game : undefined,
                format: format ? stringToEnumValue(format) : undefined,
                patchCards: patchcards ? patchcards : undefined,
                region: region ? region : undefined,
            }

            const waitingRooms = MrMatch.listRooms(searchOptions);

            let message = 'List of Rooms\n';

            waitingRooms.forEach((room) => {
                message = message.concat(`${JSON.stringify(room, null, 2)}\n`);
            });

            await interaction.editReply({content: message});
            return;
        }
    };

    return [handler, metadata.toJSON()] as [(interaction: Interaction) => void, RESTPostAPIChatInputApplicationCommandsJSONBody];
}