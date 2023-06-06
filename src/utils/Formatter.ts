import { codeBlock } from 'discord.js';
import { IMatch, IPlayer } from '../types/match';

export function roomInformation(match: IMatch) {
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
    ].sort();

    for (let i = 0; i < textLengths[0]; i++) {
        divider = divider + '=';
    }

    const text
        = `${divider}\n`
        + roomCode
        + format
        + patchCards
        + host;
    
    return codeBlock(text);
}

export function playerInformation(player: IPlayer) {
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
    ].sort()

    for (let i = 0; i < textLengths[0]; i++) {
        divider = divider + '=';
    }

    const text
        = `${divider}\n`
        + format
        + patchCards
        + region
        + host
        + waiting;
    
    return codeBlock(text);
}
