import { Interaction, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder } from 'discord.js'
import { DataBaseManager } from '../../classes/Database';
import { PlatformOptions } from '../../types/match';

export const useRegister = (DataManager: DataBaseManager) => {
    const metadata = new SlashCommandBuilder()
        .setName('register')
        .setDescription('sign up for a league or tournament')
        .addBooleanOption((option) => option.setName('screenshare').setDescription('can you share your point of view in the match?')
            .setRequired(true))
        .addStringOption((option) => option.setName('platform').setDescription('what platform are you on?')
            .setRequired(true)
            .setChoices(
                ...PlatformOptions
            ))
        .addStringOption((option) => option.setName('folder').setDescription('what is the name of your folder?')
            .setRequired(true))
        .addStringOption((option) => option.setName('beast').setDescription('what version of the game are you entering as?')
            .setRequired(true));

    const handler = (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const player = interaction.user.username;
        const screenshare = interaction.options.getBoolean('screenshare', true);
        const platform = interaction.options.getString('platform', true);
        const folder = interaction.options.getString('folder', true);
        const version = interaction.options.getString('beast', true);

        const rowData = {
            'Name': player,
            'Screen Share': String(screenshare),
            'Platform': platform,
            'Folder Name': folder,
            'Beast Form': version
        };
        const rowString = JSON.stringify(rowData, null, 2);

        DataManager.addRow(rowData).then(() => console.log(`completed task for row ${rowString}`));
        interaction.reply({ content: `added ${rowString} to sheet`});

        console.log(`Registered ${player}`);
    }
    
    return [handler, metadata.toJSON()] as [(interaction: Interaction) => void, RESTPostAPIChatInputApplicationCommandsJSONBody];
}