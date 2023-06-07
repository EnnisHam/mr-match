import { Interaction, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder } from 'discord.js'
import { DataBaseManager } from '../classes/Database';

export const useRegister = (DataManager: DataBaseManager) => {
    const metadata = new SlashCommandBuilder()
        .setName('register')
        .setDescription('sign up for a league or tournament')
        .addBooleanOption((option) => option.setName('screenshare').setDescription('your room code')
            .setRequired(true))
        .addStringOption((option) => option.setName('region').setDescription('where are you playing from?')
            .setRequired(true));

    const handler = (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const player = interaction.user.username;
        const screenshare = interaction.options.getBoolean('screenshare', true);
        const region = interaction.options.getString('region', true);

        const rowData = {
            'Name': player,
            'Can Screen Share': String(screenshare),
            'Region': region
        };
        const rowString = JSON.stringify(rowData, null, 2);

        DataManager.addRow(rowData).then(() => console.log(`completed task for row ${rowString}`));
        interaction.reply({ content: `added ${rowString} to sheet`});

        console.log(`Registered ${player}`);
    }
    
    return [handler, metadata.toJSON()] as [(interaction: Interaction) => Promise<void>, RESTPostAPIChatInputApplicationCommandsJSONBody];
}