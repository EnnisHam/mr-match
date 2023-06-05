import { Client, Events, GatewayIntentBits, Routes, GuildTextThreadManager } from 'discord.js';
import { REST } from '@discordjs/rest';
import dotenv from 'dotenv';

import { MatchMaker } from './classes/MatchMaker';
import { useJoinAsHost } from './commands/joinAsHost';
import { useJoinAsGuest } from './commands/joinAsGuest';
import { useDirectJoin } from './commands/directJoin';
import { useLeave } from './commands/leave';
import { useListRooms } from './commands/listRooms';
import { useListGuests, useListHosts, useListPlayers } from './commands/listPlayers';

dotenv.config();

const CLIENT_ID = process.env.CLIENT;
const GUILD_ID = process.env.GUILD;
const TOKEN = process.env.TOKEN;

const MrMatch = new MatchMaker();
main();

async function main() {
    if ([TOKEN, CLIENT_ID, GUILD_ID].includes(undefined)) {
        console.error('check .env file');
        return;
    }

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ]
    })

    const rest = new REST({version: '10'}).setToken(TOKEN!);

    client.once(Events.ClientReady, c => {
        console.log(`Logged in as ${c.user.tag}`);
    });
    client.on('error', (error) => console.error(`Error: ${error}`));
    client.on('rateLimit', () => console.log('rate limit exceeded'));
    client.on('apiRequest', (req) => console.log(`requesting ${req}`));
    client.on('apiResponse', (res) => console.log(`response ${res}`));

    const [joinAsHostHandler, joinAsHostCommand ] = useJoinAsHost(MrMatch);
    const [joinAsGuestHandler, joinAsGuestCommand ] = useJoinAsGuest(MrMatch);
    const [directJoinHandler, directJoinCommand] = useDirectJoin(MrMatch);
    const [listRoomsHandler, listRoomsCommand] = useListRooms(MrMatch);
    const [listGuestsHandler, listGuestsCommand] = useListGuests(MrMatch);
    const [listHostsHandler, listHostsCommand] = useListHosts(MrMatch);
    const [listPlayersHandler, listPlayersCommand] = useListPlayers(MrMatch);
    const [leaveHandler, leaveCommand] = useLeave(MrMatch);

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        const commandName = interaction.commandName;

        console.log(`dispatching ${commandName}`);

        if (commandName === 'join-as-host') await joinAsHostHandler(interaction);
        if (commandName === 'join-as-guest') joinAsGuestHandler(interaction);
        if (commandName === 'join') directJoinHandler(interaction);
        if (commandName === 'leave') leaveHandler(interaction);

        if (['join-as-host', 'join-as-guest', 'join', 'leave'].includes(commandName)) {
            MrMatch.cleanUp();
        }

        if (commandName === 'list-rooms') listRoomsHandler(interaction);
        if (commandName === 'list-hosts') listHostsHandler(interaction);
        if (commandName === 'list-guests') listGuestsHandler(interaction);
        if (commandName === 'list-players') listPlayersHandler(interaction);
    });

    const commands = [
        { ...joinAsHostCommand },
        { ...joinAsGuestCommand },
        { ...directJoinCommand },
        { ...leaveCommand },
        { ...listRoomsCommand },
        { ...listHostsCommand },
        { ...listGuestsCommand },
        { ...listPlayersCommand },
    ];

    try {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID!, GUILD_ID!), {
            body: commands,
        } );
        client.login(TOKEN)
    } catch (error) {
        console.error(error);
    }
}

