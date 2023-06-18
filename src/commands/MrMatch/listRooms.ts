import { Interaction, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder } from 'discord.js'
import { RoomSearchOptions, PlatformOptions, GameOptions } from '../../types/match';
import { MatchMaker } from '../../classes/MatchMaker';
import { roomInformation } from '../../utils/Formatter';

export const useListRooms = (MrMatch: MatchMaker) => {
    const metadata = new SlashCommandBuilder()
        .setName('list-rooms')
        .setDescription('list waiting rooms')
        .addStringOption((option) => option.setName('platform').setDescription('What platform are you on?')
            .setChoices(
                ...PlatformOptions
            ))
        .addStringOption((option) => option.setName('game').setDescription('enter a number between 1-6 inclusive')
            .setChoices(
                ...GameOptions
            ))
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

            const game = interaction.options.getString('game');
            const format = interaction.options.getString('format');
            const patchcards = interaction.options.getBoolean('patchcards');
            const region = interaction.options.getString('region');
            const platform = interaction.options.getString('platform');

            const searchOptions: Partial<RoomSearchOptions> = {
                game: game ? `Battle Network ${game}` : undefined,
                format: format ?? undefined,
                patchCards: patchcards ?? undefined,
                region: region ?? undefined,
                platform: platform ?? undefined
            }

            MrMatch.cleanUp();
            const waitingRooms = MrMatch.listRooms(searchOptions);

            let message = 'List of Rooms\n';

            waitingRooms.forEach((room) => {
                message = message.concat(`${roomInformation(room)}\n`);
            });

            await interaction.editReply({content: message});
            return;
        }
    };

    return [handler, metadata.toJSON()] as [(interaction: Interaction) => void, RESTPostAPIChatInputApplicationCommandsJSONBody];
}