import { Interaction, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, TextChannel } from 'discord.js'
import { MatchMaker } from '../classes/MatchMaker';
import { BattleThreadManager } from '../classes/ThreadManager';
import { roomInformation } from '../utils/Formatter';

export const useJoinAsHost = (MrMatch: MatchMaker, BattleManager: BattleThreadManager) => {
    const metadata = new SlashCommandBuilder()
        .setName('join-as-host')
        .setDescription('host a game')
        .addStringOption((option) => option.setName('roomcode').setDescription('your room code')
            .setRequired(true))
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

    const handler = async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const host = interaction.user.username;
        const roomCode = interaction.options.getString('roomcode', true);
        const format = interaction.options.getString('format', true);
        const patchCards = interaction.options.getBoolean('patchcards', true);
        const region = interaction.options.getString('region', true);

        const options = {
            format: format,
            patchCards: patchCards,
            game: 6,
            region: region
        };

        const match = MrMatch.joinAsHost(host, roomCode, options);
        interaction.reply({ content: `added ${host} to queue`});

        const threadName = BattleManager.addThreadForMatch(match);
        const channel = interaction.channel as TextChannel;
        const thread = await channel.threads.create({
            name: `${threadName}`,
            autoArchiveDuration: 60, // 1hr; this is the minimum for some reason
            reason: `battle channel for ${roomCode}`
        });

        if (thread.joinable) {
            await thread.join();
        }

        const hostId = interaction.user.id;
        await thread.members.add(hostId);

        thread.send(`Welcome Net Battler The room settings are\n${roomInformation(match)}`);

        console.log(`Match Appended ${host} ${roomCode} Thread: ${threadName}`);
    }
    
    return [handler, metadata.toJSON()] as [(interaction: Interaction) => Promise<void>, RESTPostAPIChatInputApplicationCommandsJSONBody];
}