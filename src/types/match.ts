import { DateTime } from 'luxon';
export const Platforms = ['switch' , 'playstation' , 'xbox' , 'steam' , 'tango'];
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

export interface IMatch {
    host: string;
    roomCode: string;
    patchCards: boolean;
    format: string;
    game: string;
    region: string;
    platform: string;
    guest?: string;
}

export type RoomOptions = Pick<IMatch, 
    'format' |
    'patchCards' |
    'platform' |
    'game' |
    'region' 
>
export type RoomRequirements = Pick<IMatch, 
    'host' |
    'roomCode' 
>

export interface IPlayer {
    name: string;
    platform: string;
    host?: boolean;
    waiting?: boolean;
    options: RoomOptions;
};

export interface IThreadArchive {
    threadName: string;
    roomCode: string;
    created: DateTime;
}