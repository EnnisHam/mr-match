import { Interaction, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder } from 'discord.js';
import { MatchMaker } from '../classes/MatchMaker';
import { playerInformation } from '../utils/Formatter';

export const useListPlayers = (MrMatch: MatchMaker) => {
    const metadata = new SlashCommandBuilder()
        .setName('list-players')
        .setDescription('list all players');

    const handler = (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const list = MrMatch.listPlayers().map((player) => playerInformation(player));
        interaction.reply({content: `Players:\n${list}`});
    }

    return [handler, metadata.toJSON()] as [(interaction: Interaction) => void, RESTPostAPIChatInputApplicationCommandsJSONBody];
}

export const useListHosts = (MrMatch: MatchMaker) => {
    const metadata = new SlashCommandBuilder()
        .setName('list-hosts')
        .setDescription('list all hosts');

    const handler = (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const list = MrMatch.listHosts().map((player) => playerInformation(player));
        interaction.reply({content: `Hosts:\n${list}`});
    }

    return [handler, metadata.toJSON()] as [(interaction: Interaction) => void, RESTPostAPIChatInputApplicationCommandsJSONBody];
}

export const useListGuests = (MrMatch: MatchMaker) => {
    const metadata = new SlashCommandBuilder()
        .setName('list-guests')
        .setDescription('list all guests');

    const handler = (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const list = MrMatch.listGuests().map((player) => playerInformation(player));
        interaction.reply({content: `Guests:\n${list}`});
    }

    return [handler, metadata.toJSON()] as [(interaction: Interaction) => void, RESTPostAPIChatInputApplicationCommandsJSONBody];
}