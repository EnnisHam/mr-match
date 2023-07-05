import {
    TextChannel,
    Message,
    Interaction,
    SlashCommandBuilder,
    RESTPostAPIChatInputApplicationCommandsJSONBody
} from 'discord.js'
import { FileHandle, open, readFile } from 'fs/promises';
import { MatchMaker } from 'src/classes/MatchMaker'
import { roomInformation } from '../../utils/Formatter';

export const findBoard = async (targetChannel: TextChannel, messageId: string) => {
    const targetMessage = await targetChannel.messages.fetch(messageId);
    return targetMessage;
}

export const updateMessageBoard = async (MrMatch: MatchMaker, targetMessage: Message) => {
    let board = 'Current Users';
    const waitingRooms = MrMatch.listRooms();

    waitingRooms.forEach((room) => {
        board = board.concat(`${roomInformation(room)}`);
    });

    targetMessage.edit(board);
}

export const useCreateBoard = () => {
    const metadata = new SlashCommandBuilder()
        .setName('create-board')
        .setDescription('creates a board to display')
        .addStringOption( (option) =>
            option
                .setName('label')
                .setDescription('label the board for json storage')
        );

    const handler = async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        if (interaction.commandName === 'create-board') {
            await interaction.deferReply();
            await interaction.editReply('creating board message');

            let fileHandler: FileHandle | undefined = undefined;
            const filePath = './boardInfo.json';
            let jsonData: { [key: string]: any } = {};
            try {
                fileHandler = await open(filePath, 'r');
                jsonData = JSON.parse((await fileHandler.readFile({ encoding: 'utf-8'})).toString());
            } catch {
                // do nothing
            } finally {
                fileHandler?.close();
                fileHandler = undefined;
            }

            const messageId = (await interaction.fetchReply()).id;
            const channelId = await interaction.channelId;
            const boardInfo = {
                messageId: messageId,
                channelId: channelId
            };
            await interaction.editReply(`message board info ${JSON.stringify(boardInfo, null, 2)}`);

            const label = interaction.options.getString('label');
            if (!label) return;

            try {
                fileHandler = await open(filePath, 'w');
                jsonData[label] = boardInfo;
                fileHandler.write(JSON.stringify(jsonData, null, 2));
            } finally {
                fileHandler?.close();
            }
        }
    }

    return [handler, metadata.toJSON()] as [(interaction: Interaction) => void, RESTPostAPIChatInputApplicationCommandsJSONBody];
}