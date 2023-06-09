import { IMatch, RoomSearchOptions, IPlayer } from '../types/match';
import { DateTime } from 'luxon';

export class MatchMaker {
    constructor() {};

    private BattleSheet: Record<string, IMatch> = {};
    private PlayerList: IPlayer[] = [];

    private addToList(player: IPlayer) {
        this.PlayerList.push(player);
    }

    public listRooms(options?: Partial<RoomSearchOptions>)  {
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

    public joinAsHost(matchInfo: IMatch) {

        this.BattleSheet[matchInfo.roomCode] = {
            ...matchInfo,
            created: DateTime.now()
        };
        this.addToList({
            name: matchInfo.host,
            platform: matchInfo.platform,
            host: true,
            waiting: true,
            options: matchInfo as RoomSearchOptions
        });
        return matchInfo;
    }

    public extendLifespan(player: string) {
        const match = Object.values(this.BattleSheet).find((room) => room.host === player);

        if (match) {
            match.created = DateTime.now();
        } else {
            console.error(`failed to extend lifespan for ${player}`);
        }
    }

    public joinAsGuest(player: string, options: RoomSearchOptions) {
        const match = this.findMatch(options);
        if (!match) {
            this.addToList({ name: player, platform: options.platform, waiting: true, options: options });
            return;
        }

        this.joinDirect(player, match.roomCode);
        return match.roomCode;
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
        this.removePlayer(name);
        const room = Object.values(this.BattleSheet).find((room) => room.host === name);

        if (room) {
            this.deleteMatch(room?.roomCode);
        }
    }

    public findMatch(options: RoomSearchOptions) {
        const match = Object.values(this.BattleSheet).find((room) => {
            const { format, patchCards, game, region} = room;
            const baseCheck = options.format === format 
                && options.patchCards === patchCards
                && options.game === game;

            if (options.region && region) {
                return options.region === region && baseCheck;
            }

            return baseCheck;
        });

        if (match) {
            return match;
        }

        return undefined;
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
            // difference comes out as negative probably because it does created - current time instead of the otherway around
            const timeDifference = Math.abs(this.BattleSheet[room].created?.diffNow(['minutes']).minutes ?? 5);

            // if the host does not exist in the list or if the match has a guest then remove the room
            if (
                !hostData ||
                guest ||
                timeDifference >= 5
            ) {
                // remove players within the target room from the list
                const host = this.BattleSheet[room].host;
                const guest = this.BattleSheet[room].guest;

                const targetList: string[] = [host];

                if (guest) {
                    targetList.push(guest);
                }

                this.removePlayersIteratively(targetList);

                delete this.BattleSheet[room];
            }
        });
    }

    private removePlayer(target: string) {
        const targetIndex = this.PlayerList.findIndex((player) => player.name === target);
        if (targetIndex > -1) {
            this.PlayerList.splice(targetIndex);
        }
    }

    private removePlayersIteratively(targetList: string[]) {
        targetList.forEach((player) => {
            this.removePlayer(player)
        });
    }
    
    public cleanUp(options?: { all?: boolean }) {
        this.clearMatches(options);
    }
}