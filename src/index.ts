import { Client, GatewayIntentBits, Routes } from 'discord.js';
import { REST } from '@discordjs/rest';
import dotenv from 'dotenv';

import { MatchMaker } from './classes/MatchMaker';
import { useJoinAsHost } from './commands/joinAsHost';
import { useJoinAsGuest } from './commands/joinAsGuest';
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

    client.on('ready', () => console.log('bot is online'));

    const [joinAsHostHandler, joinAsHostCommand ] = useJoinAsHost(MrMatch);
    const [joinAsGuestHandler, joinAsGuestCommand ] = useJoinAsGuest(MrMatch);
    const [listRoomsHandler, listRoomsCommand] = useListRooms(MrMatch);
    const [listGuestsHandler, listGuestsCommand] = useListGuests(MrMatch);
    const [listHostsHandler, listHostsCommand] = useListHosts(MrMatch);
    const [listPlayersHandler, listPlayersCommand] = useListPlayers(MrMatch);
    const [leaveHandler, leaveCommand] = useLeave(MrMatch);

    client.on('interactionCreate', (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        const commandName = interaction.commandName;

        if (commandName === 'join-as-host') joinAsHostHandler(interaction);
        if (commandName === 'join-as-guest') joinAsGuestHandler(interaction);
        if (commandName === 'list-rooms') listRoomsHandler(interaction);
        if (commandName === 'list-hosts') listHostsHandler(interaction);
        if (commandName === 'list-guests') listGuestsHandler(interaction);
        if (commandName === 'list-players') listPlayersHandler(interaction);
        if (commandName === 'leave') leaveHandler(interaction);
        
        if (['join-as-host', 'join-as-guest', 'leave'].includes(commandName)) MrMatch.cleanUp();
    });

    const commands = [
        { ...joinAsHostCommand },
        { ...joinAsGuestCommand },
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

