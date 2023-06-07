import { codeBlock } from 'discord.js';
import { IMatch, IPlayer } from '../types/match';

export function roomInformation(match: IMatch) {
    const name = `Host: ${match.host}\n`;
    const patchCardAvailability = match.patchCards ? 'Enabled' : 'Disabled';
    const roomCode = `Room Code: ${match.roomCode}\n`;
    const platform = `Platform: ${match.platform}\n`;
    const format = `Battle Format: ${match.format}\n`;
    const patchCards = `Patch Cards: ${patchCardAvailability}\n`;
    const host = `Host Region: ${match.region}\n`;

    const text
        = name
        + platform
        + roomCode
        + format
        + patchCards
        + host;
    
    return codeBlock(text);
}

export function playerInformation(player: IPlayer) {
    const name = `Player: ${player.name}\n`;
    const platform = `Platform: ${player.options.platform}\n`;
    const format = `Battle Format: ${player.options.format}\n`;
    const patchCards = `Patch Cards: ${player.options.patchCards ? 'Enabled' : 'Disabled'}\n`;
    const region = `Player Region: ${player.options.region}\n`;
    const host = `Is Hosting: ${player.host ? 'Y' : 'N'}\n`;
    const waiting = `Is Waiting: ${player.waiting ? 'Y' : 'N'}\n`;

    const text
        = name
        + platform
        + format
        + patchCards
        + region
        + host
        + waiting;
    
    return codeBlock(text);
}
