import {
    Interaction,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    SlashCommandBuilder,
    TextChannel
} from 'discord.js'
import { BattleThreadManager } from 'src/classes/ThreadManager';

export const useClearChannel = () => {
    const metadata = new SlashCommandBuilder()
        .setName('clear-channel')
        .setDescription('debug purposes only');

    const recursiveClear = async (interaction: Interaction) => {
        const channel = interaction.channel as TextChannel;
        try {
            const batch = await channel.messages.fetch({ cache: false});
            if (batch.size === 0) {
                return;
            }

            await channel.bulkDelete(batch);
        } catch(error) {
            console.error(`batch clear failed\n\n${error}`);
            return;
        }

        await recursiveClear(interaction);
    }

    const handler = async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        await recursiveClear(interaction);
    }

    return [handler, metadata.toJSON()] as [(interaction: Interaction) => Promise<void>, RESTPostAPIChatInputApplicationCommandsJSONBody];
};

export const useClearThreads = (BattleManager: BattleThreadManager) => {
    const metadata = new SlashCommandBuilder()
        .setName('clear-threads')
        .setDescription('debug purposes only');

    const handler = async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        await interaction.deferReply();
        await BattleManager.clearAllThreads(interaction);
        await interaction.editReply('Cleared Threads')
    }

    return [handler, metadata.toJSON()] as [(interaction: Interaction) => Promise<void>, RESTPostAPIChatInputApplicationCommandsJSONBody];
};
