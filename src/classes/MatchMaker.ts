import { IMatch, RoomOptions, IPlayer, RoomRequirements } from '../types/match';

export class MatchMaker {
    constructor() {};

    private BattleSheet: Record<string, IMatch> = {};
    private PlayerList: IPlayer[] = [];

    private addToList(player: IPlayer) {
        this.PlayerList.push(player);
    }

    public listRooms(options?: Partial<RoomOptions>)  {
        const allRooms = Object.values(this.BattleSheet);
        if (!options) {
            return allRooms;
        }

        const listedRequirements = Object.keys(options);

        const waitingRooms = allRooms
            .filter((room) => {
                for (const requirement of listedRequirements) {
                    const optionRequirement = (options as any)[requirement];
                    const roomSetting = (room as any)[requirement];

                    if (optionRequirement && roomSetting !== optionRequirement) {
                        return false;
                    }
                }
                return true;
            });

        return waitingRooms;
    }

    public listHosts() {
        return this.PlayerList.filter((player) => player.host);
    }

    public listGuests() {
        return this.PlayerList.filter((player) => !player.host);
    }

    public listPlayers() {
        return this.PlayerList;
    }

    public joinAsHost(required: RoomRequirements, options: RoomOptions) {
        const match = {
            ...required,
            ...options
        };
        this.BattleSheet[required.roomCode] = match;
        this.addToList({ name: required.host, platform: options.platform, host: true, waiting: true, options: options });
        return match;
    }

    public joinAsGuest(player: string, options: RoomOptions) {
        this.addToList({ name: player, platform: options.platform, waiting: true, options: options });
    }

    public joinDirect(player: string, roomCode: string) {
        const hostName = this.BattleSheet[roomCode].host; 
        this.BattleSheet[roomCode].guest = player;

        const host = this.PlayerList.find((player) => player.name === hostName);
        if (host) {
            host.waiting = false;
        }
    }

    public leaveList(name: string) {
        const player = this.PlayerList.find((player) => player.name === name);
        if (player) {
            player.waiting = false;
        }
    }

    public findMatch(options: RoomOptions) {
        const filteredOptions = Object.values(this.BattleSheet).filter((room) => {
            const { format, patchCards, game, region} = room;
            const baseCheck = options.format === format 
                && options.patchCards === patchCards
                && options.game === game;

            if (options.region && region) {
                return options.region === region && baseCheck;
            }

            return baseCheck;
        });

        if (filteredOptions.length > 0) {
            return filteredOptions[0];
        }

        return undefined;
    }

    public async matchMakeIteratively() {
        const waitingList = this.PlayerList.filter((player) => player.waiting);
        waitingList.forEach((player) => {
            const match = this.findMatch(player.options);

            if (match) {
                this.joinDirect(player.name, match.roomCode);
            }
        });
    }

    public deleteMatch(roomCode: string) {
        delete this.BattleSheet[roomCode];
    }

    private clearMatches(options?: { all?: boolean}) {
        if (options?.all) {
            this.BattleSheet = {};
            return;
        }

        Object.keys(this.BattleSheet).forEach((room) => {
            const guest = this.BattleSheet[room].guest;
            const host = this.BattleSheet[room].host;

            const hostData = this.PlayerList.find((player) => player.name === host);

            // if the host does not exist in the list or if the match has a guest then remove the room
            if (!hostData || guest) {
                delete this.BattleSheet[room];
            }
        });
    }

    private clearPlayers(options?: { all?: boolean }) {
        if (options?.all) {
            this.PlayerList = [];
            return;
        }

        this.clearInactivePlayers();
    }

    private clearInactivePlayers() {
        const waitingPlayers = this.PlayerList.filter((player) => player.waiting);
        this.PlayerList = waitingPlayers;
    }
    
    public cleanUp(options?: { all?: boolean }) {
        this.clearPlayers(options);
        this.clearMatches(options);
    }
}