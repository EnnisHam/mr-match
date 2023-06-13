import { Interaction, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder } from 'discord.js'
import { MatchMaker } from '../../classes/MatchMaker';
import { PlatformOptions, Platforms, GameOptions } from '../../types/match';

export const useJoinAsGuest = (MrMatch: MatchMaker) => {

    const metadata = new SlashCommandBuilder()
        .setName('join-as-guest')
        .setDescription('join a room')
        .addStringOption((option) => option.setName('platform').setDescription('what platform are you on')
            .setRequired(true)
            .setChoices(
                ...PlatformOptions
            ))
        .addStringOption((option) => option.setName('game').setDescription('enter a number between 1-6 inclusive')
            .setRequired(true)
            .setChoices(
                ...GameOptions
            ))
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

    const handler = (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const guest = interaction.user.username;

        const platform = interaction.options.getString('platform', true);
        if (!Platforms.includes(platform.toLowerCase())) {
            interaction.reply({ content: `That doesn't look like a ${Platforms.join(' or ')} to me.`});
            return;
        }

        const game = interaction.options.getString('game', true);

        const format = interaction.options.getString('format', true);
        const patchCards = interaction.options.getBoolean('patchcards', true);
        const region = interaction.options.getString('region', true);

        const options = {
            platform: platform,
            format: format,
            patchCards: patchCards,
            game: `Battle Network ${game}`,
            region: region,
        };

        MrMatch.joinAsGuest(guest, options);
        interaction.reply({ content: `added ${guest} to list`});
    };

    return [handler, metadata.toJSON()] as [(interaction: Interaction) => void, RESTPostAPIChatInputApplicationCommandsJSONBody];
}