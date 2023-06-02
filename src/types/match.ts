export type Platforms = 'switch' | 'playstation' | 'xbox' | 'steam' | 'tango';

export enum Format {
    triples = 3,
    single = 1
}

export const stringToEnumValue = (input: string) => input === 'triples' ? 3 : 1;

export interface IMatch {
    host: string;
    roomCode: string;
    patchCards: boolean;
    format: Format;
    game: number;
    guest?: string;
    region?: string;
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
