import {
    Interaction,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    SlashCommandBuilder,
    TextChannel
} from 'discord.js'

export const useClearChannel = () => {
    const metadata = new SlashCommandBuilder()
        .setName('clear')
        .setDescription('debug purposes only');

    const recursiveClear = async (interaction: Interaction) => {
        const channel = interaction.channel as TextChannel;
        try {
            const batch = await channel.messages.fetch({ cache: false});
            if (!batch) {
                return;
            }

            await channel.bulkDelete(batch);
        } catch {
            return;
        }

        await recursiveClear(interaction);
    }

    const handler = async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        await interaction.deferReply();
        await recursiveClear(interaction);
        await interaction.editReply('Cleared Channel')
    }

    return [handler, metadata.toJSON()] as [(interaction: Interaction) => Promise<void>, RESTPostAPIChatInputApplicationCommandsJSONBody];
};