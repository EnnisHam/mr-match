import { Interaction, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, TextChannel } from 'discord.js'
import { MatchMaker } from '../classes/MatchMaker';
import { BattleThreadManager } from '../classes/ThreadManager';

export const useDirectJoin = (MrMatch: MatchMaker, BattleManager: BattleThreadManager) => {
    const metadata = new SlashCommandBuilder()
        .setName('join')
        .setDescription('immediately assign yourself to a room as a guest')
        .addStringOption(
            (option) => option.setName('roomcode')
                .setDescription('code to the room you are joining')
                .setRequired(true)
        );

    const handler = async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const name = interaction.user.username;
        const roomCode = interaction.options.getString('roomcode', true);

        MrMatch.joinDirect(name, roomCode);

        const channel = interaction.channel as TextChannel;
        const threadName = BattleManager.getThreads().find((thread) => thread.roomCode === roomCode)?.threadName;
        const thread = await channel.threads.cache.find((thread) => thread.name === threadName);

        thread?.members.add(interaction.user.id);

        interaction.reply({ content: `you have joined ${roomCode} you and the host will be removed from the list`});
        console.log(`${name} joining ${roomCode}`)
    };

    return [handler, metadata.toJSON()] as [(interaction: Interaction) => Promise<void>, RESTPostAPIChatInputApplicationCommandsJSONBody];
}