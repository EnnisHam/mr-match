import { DateTime } from 'luxon';
export type Platforms = 'switch' | 'playstation' | 'xbox' | 'steam' | 'tango';

export interface IMatch {
    host: string;
    roomCode: string;
    patchCards: boolean;
    format: string;
    game: number;
    region: string;
    guest?: string;
}

export type RoomOptions = Pick<IMatch, 
    'format' |
    'patchCards' |
    'game' |
    'region' 
>

export interface IPlayer {
    name: string;
    host?: boolean;
    waiting?: boolean;
    options: RoomOptions;
};

export interface IThreadArchive {
    threadName: string;
    roomCode: string;
    created: DateTime;
}