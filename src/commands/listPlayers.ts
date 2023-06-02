import { Interaction, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder } from "discord.js"
import { MatchMaker } from "../objects/MatchMaker";

export const useListPlayers = (MrMatch: MatchMaker) => {
    const handler = (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const list = MrMatch.listPlayers().map((player) => JSON.stringify(player, null, 2));
        interaction.reply({content: `Players:\n${list}`});
    }

    const metadata = new SlashCommandBuilder()
        .setName('list-players')
        .setDescription('list all players');

    return [handler, metadata.toJSON()] as [(interaction: Interaction) => void, RESTPostAPIChatInputApplicationCommandsJSONBody];
}

export const useListHosts = (MrMatch: MatchMaker) => {
    const handler = (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const list = MrMatch.listHosts().map((player) => JSON.stringify(player, null, 2));
        interaction.reply({content: `Hosts:\n${list}`});
    }

    const metadata = new SlashCommandBuilder()
        .setName('list-hosts')
        .setDescription('list all hosts');

    return [handler, metadata.toJSON()] as [(interaction: Interaction) => void, RESTPostAPIChatInputApplicationCommandsJSONBody];
}

export const useListGuests = (MrMatch: MatchMaker) => {
    const handler = (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const list = MrMatch.listGuests().map((player) => JSON.stringify(player, null, 2));
        interaction.reply({content: `Guests:\n${list}`});
    }

    const metadata = new SlashCommandBuilder()
        .setName('list-guests')
        .setDescription('list all guests');

    return [handler, metadata.toJSON()] as [(interaction: Interaction) => void, RESTPostAPIChatInputApplicationCommandsJSONBody];
}