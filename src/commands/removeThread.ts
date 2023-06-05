import { Interaction, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, TextChannel } from "discord.js"
import { BattleThreadManager } from "../classes/ThreadManager";

export const useRemoveThread = (BattleManager: BattleThreadManager) => {
    const metadata = new SlashCommandBuilder()
        .setName('delete-thread')
        .setDescription('debug purposes only')
        .addStringOption(
            (option) => option.setName('threadid')
                .setDescription('copy paste the thread name')
                .setRequired(true)
        );

    const handler = async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }
        const threadId = interaction.options.getString('threadid', true);
        const channel = interaction.channel as TextChannel;
        await interaction.deferReply();
        const thread = await channel.threads.cache.find((thread) => thread.name === threadId);
        if (thread) {
            await thread?.delete();
        }

        if (BattleManager.getThreads().map((thread) => thread.threadName).includes(threadId)) {
            BattleManager.removeFromList(threadId);
        }
        await interaction.editReply('deleting thread')
    }

    return [handler, metadata.toJSON()] as [(interaction: Interaction) => Promise<void>, RESTPostAPIChatInputApplicationCommandsJSONBody];
};