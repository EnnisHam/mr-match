import { codeBlock } from 'discord.js';
import { IMatch, IPlayer } from '../types/match';

export function roomInformation(match: IMatch, options?: { divider?: boolean }) {
    const patchCardAvailability = match.patchCards ? 'Enabled' : 'Disabled';
    const roomCode = `Room Code: ${match.roomCode}\n`;
    const format = `Battle Format: ${match.format}\n`;
    const patchCards = `Patch Cards: ${patchCardAvailability}\n`;
    const host = `Host Region: ${match.region}\n`;
    let divider = '';

    const textLengths = [
        roomCode.length,
        format.length,
        patchCards.length,
        host.length
    ];

    if (options?.divider) {
        for (let i = 0; i < Math.max(...textLengths); i++) {
            divider = divider + '=';
        }
        divider = `${divider}\n`;
    }

    const text
        = divider
        + roomCode
        + format
        + patchCards
        + host;
    
    return codeBlock(text);
}

export function playerInformation(player: IPlayer, options?: { divider?: boolean }) {
    const format = `Battle Format: ${player.options.format}\n`;
    const patchCards = `Patch Cards: ${player.options.patchCards ? 'Enabled' : 'Disabled'}\n`;
    const region = `Player Region: ${player.options.region}\n`;
    const host = `Is Hosting: ${player.host ? 'Y' : 'N'}\n`;
    const waiting = `Is Waiting: ${player.waiting ? 'Y' : 'N'}\n`;
    let divider = '';

    const textLengths = [
        format.length,
        patchCards.length,
        region.length,
        host.length,
        waiting.length
    ];

    if (options?.divider) {
        for (let i = 0; i < Math.max(...textLengths); i++) {
            divider = divider + '=';
        }
        divider = `${divider}\n`;
    }

    const text
        = divider
        + format
        + patchCards
        + region
        + host
        + waiting;
    
    return codeBlock(text);
}
