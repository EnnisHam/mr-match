import { Interaction, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder } from 'discord.js'
import { DataBaseManager } from '../../classes/Database';

export const useGetRegistrants = (DataManager: DataBaseManager) => {
    const metadata = new SlashCommandBuilder()
        .setName('get-registrants')
        .setDescription('get a list of registrants');

    const handler = async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }
        await interaction.deferReply();

        const rows = await DataManager.getRows();

        if (!rows) {
            interaction.reply({ content: 'no registrants' });
            return;
        }

        const rowData = rows.map((row) => {
            return {
                name: row['Name'],
                screenShare: row['Screen Share'],
                platform: row['Platform'],
                folder: row['Folder Name'],
                beast: row['Beast Form']
            };
        });

        const rowStrings = rowData.map((row) => `${JSON.stringify(row, null, 2)}\n`);
        await interaction.editReply({ content: `Participants\n${rowStrings}`});
    }
    
    return [handler, metadata.toJSON()] as [(interaction: Interaction) => Promise<void>, RESTPostAPIChatInputApplicationCommandsJSONBody];
}