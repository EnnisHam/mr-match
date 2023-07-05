import {
    Client,
    Events,
    GatewayIntentBits,
    GuildMemberRoleManager,
    Message,
    Routes,
    TextChannel
} from 'discord.js';
import { REST } from '@discordjs/rest';
import dotenv from 'dotenv';

import { MatchMaker } from './classes/MatchMaker';

import { useJoinAsHost } from './commands/Shared/joinAsHost';
import { useJoinAsGuest } from './commands/Shared/joinAsGuest';
import { useDirectJoin } from './commands/Shared/directJoin';
import { useLeave } from './commands/MrMatch/leave';
import { useListRooms } from './commands/MrMatch/listRooms';
import { useListGuests, useListHosts, useListPlayers } from './commands/MrMatch/listPlayers';

import { BattleThreadManager } from './classes/ThreadManager';

import { DataBaseManager } from './classes/Database';

import { useRegister } from './commands/Database/useRegister';

// debug commands
import { useGetRegistrants } from './commands/Database/useGetRegistrants';
import { BoardInfo } from './types/match';
import { updateMessageBoard, useCreateBoard } from './commands/MrMatch/UpdateBoard';

dotenv.config();

const CLIENT_ID = process.env.CLIENT;
const GUILD_ID = process.env.GUILD;
const TOKEN = process.env.TOKEN;

const BOARD_INFO: BoardInfo = {
    messageId: process.env.MESSAGE_BOARD_ID!,
    channelId: process.env.CHANNEL_BOARD_ID!
};

main();

async function main() {
    const MrMatch = new MatchMaker();
    const BattleManager = new BattleThreadManager();
    const DataManager = new DataBaseManager(process.env.TARGET_SHEET!);
    await DataManager.authenticateAndLoad({
        serviceEmail: process.env.GOOGLE_SERVICE_ACCOUNT!,
        privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY!
    });
    DataManager.getSheet('Registry');

    if ([TOKEN, CLIENT_ID, GUILD_ID].includes(undefined)) {
        console.error('check .env file');
        return;
    }

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

    const rest = new REST({version: '10'}).setToken(TOKEN!);

    client.once(Events.ClientReady, c => {
        console.log(`Logged in as ${c.user.tag}`);
    });
    client.on('error', (error) => console.error(`Error: ${error}`));
    client.on('rateLimit', () => console.log('rate limit exceeded'));
    client.on('apiRequest', (req) => console.log(`requesting ${req}`));
    client.on('apiResponse', (res) => console.log(`response ${res}`));

    const [joinAsHostHandler, joinAsHostCommand ] = useJoinAsHost(MrMatch, BattleManager);
    const [joinAsGuestHandler, joinAsGuestCommand ] = useJoinAsGuest(MrMatch, BattleManager);
    const [directJoinHandler, directJoinCommand] = useDirectJoin(MrMatch, BattleManager);
    const [listRoomsHandler, listRoomsCommand] = useListRooms(MrMatch);
    const [listGuestsHandler, listGuestsCommand] = useListGuests(MrMatch);
    const [listHostsHandler, listHostsCommand] = useListHosts(MrMatch);
    const [listPlayersHandler, listPlayersCommand] = useListPlayers(MrMatch);
    const [leaveHandler, leaveCommand] = useLeave(MrMatch);
    const [createBoardHandler, createBoardCommand] = useCreateBoard();

    const [registerPlayerHandler, registerPlayerCommand] = useRegister(DataManager);
    const [getRegistrantsHandler, getRegistrantsCommand] = useGetRegistrants(DataManager);
    /**
     * TODO: When a user joins a thread without the commands register them to the 
     * match and clean up?
     */

    const commands = [
        { ...joinAsHostCommand },
        { ...joinAsGuestCommand },
        { ...directJoinCommand },
        { ...leaveCommand },
        { ...listRoomsCommand },
        { ...listHostsCommand },
        { ...listGuestsCommand },
        { ...listPlayersCommand },
        { ...createBoardCommand }

        // { ...registerPlayerCommand },
        // { ...getRegistrantsCommand }
    ];

    try {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID!, GUILD_ID!), {
            body: commands,
        } );
        await client.login(TOKEN);
    } catch (error) {
        console.error(error);
    }

    let boardMessage: Message<true> | undefined = undefined;
    try {
        const boardChannel = await client.channels.fetch(BOARD_INFO.channelId) as TextChannel;
        boardMessage = await boardChannel?.messages.fetch(BOARD_INFO.messageId);
    } catch {
        // do nothing
    } finally {
        if (boardMessage) { // reset board on startup
            updateMessageBoard(MrMatch, boardMessage);
        }
    }

    const cleanUpAndUpdate = () => {
        console.log('cleaning up');
        MrMatch.cleanUp();
        if (boardMessage) {
            updateMessageBoard(MrMatch, boardMessage);
        }
    }

    setInterval(cleanUpAndUpdate, 300000);

    const adminIds: number[] = [193213217927856129, 417041564628680715, 174603401479323649];

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        const commandName = interaction.commandName;

        const userRoles = interaction.member?.roles as GuildMemberRoleManager;

        // lmao
        if (!userRoles.cache.some((role) => role.name === 'Hikari Badge')) {
            interaction.reply('Sorry kid Net Battlers only');
            return;
        }

        console.log(`dispatching ${commandName}`);

        try {
            if (commandName === 'register') registerPlayerHandler(interaction);
            if (commandName === 'get-registrants') getRegistrantsHandler(interaction);

            if (commandName === 'join-as-host') await joinAsHostHandler(interaction);
            if (commandName === 'join-as-guest') joinAsGuestHandler(interaction);
            if (commandName === 'join') await directJoinHandler(interaction);
            if (commandName === 'leave') leaveHandler(interaction);

            if (['join-as-host', 'join-as-guest', 'join', 'leave', 'list-rooms']
                .includes(commandName)) {
                MrMatch.cleanUp();

                if (boardMessage) {
                    updateMessageBoard(MrMatch, boardMessage);
                }
            }

            if (commandName === 'list-rooms') listRoomsHandler(interaction);
            if (commandName === 'list-hosts') listHostsHandler(interaction);
            if (commandName === 'list-guests') listGuestsHandler(interaction);
            if (commandName === 'list-players') listPlayersHandler(interaction);

            const adminAllowed = adminIds.includes(Number(interaction.user.id));
            if (adminAllowed && commandName === 'create-board') {
                createBoardHandler(interaction);
            }
        } catch(error) {
            console.error(`Error: ${error}`);
        } finally {
            console.log('Command Dispatch Complete');
        }
    });

}

