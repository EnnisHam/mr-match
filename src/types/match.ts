import { DateTime } from 'luxon';
export const Platforms = ['switch' , 'playstation', 'steam' , 'tango'];
export const PlatformOptions = Platforms.map((platform) => {
    return {
        name: platform,
        value: platform
    };
});

export const Games = ['1', '2', '3', '4', '5', '6'];
export const GameOptions = Games.map((game) => {
    return {
        name: game,
        value: game
    };
});

export interface BoardInfo {
    readonly channelId: string;
    readonly messageId: string;
}

export interface IMatch {
    host: string;
    roomCode: string;
    patchCards: boolean;
    format: string;
    game: string;
    region: string;
    platform: string;
    guest?: string;
    created?: DateTime;
}

export type RoomSearchOptions = Partial<Pick<IMatch, 
    'format' |
    'patchCards' |
    'platform' |
    'game' |
    'region'|
    'roomCode'
>>

export interface IPlayer {
    name: string;
    platform?: string;
    host?: boolean;
    waiting?: boolean;
    options: RoomSearchOptions;
};

export interface IThreadArchive {
    threadName: string;
    roomCode: string;
    created: DateTime;
}