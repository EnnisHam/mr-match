import { IMatch, RoomOptions, IPlayer } from "src/types/match";

export class MatchMaker {
    constructor() {}

    private BattleSheet: Record<string, IMatch> = {}
    private PlayerList: IPlayer[] = []
    private FastList: string[] = []

    private addToList(player: IPlayer) {
        this.PlayerList.push(player);
        this.FastList.push(player.name);
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

    public joinAsHost(player: string, roomCode: string, options: RoomOptions) {
        const match = {
            host: player,
            roomCode: roomCode,
            ...options
        };
        this.BattleSheet[roomCode] = match;
        this.addToList({ name: player, host: true, waiting: true, options: options });
    }

    public joinAsGuest(player: string, options: RoomOptions) {
        this.addToList({ name: player, waiting: true, options: options });
    }

    public joinDirect(player: string, roomCode: string) {
        const hostName = this.BattleSheet[roomCode].host; 
        this.BattleSheet[roomCode].guest = player;

        const host = this.PlayerList.find((player) => player.name === hostName);
        if (host) {
            host.waiting = false;
        }

        if (this.FastList.includes(player)) {
            this.leaveList(player);
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

    public clearMatches(options?: { all?: boolean}) {
        if (options?.all) this.BattleSheet = {};

        Object.keys(this.BattleSheet).forEach((room) => {
            const guest = this.BattleSheet[room].guest;
            const host = this.BattleSheet[room].host;

            if (!this.FastList.includes(host) || guest) {
                delete this.BattleSheet[room];
            }
        });
    }

    public clearPlayers(options?: { all?: boolean }) {
        if (options?.all) this.PlayerList = [];
        const waitingPlayers = this.PlayerList.filter((player) => player.waiting);
        const fastValues = waitingPlayers.map((player) => player.name);

        this.PlayerList = waitingPlayers;
        this.FastList = fastValues;
    }

    public cleanUp(options?: { all?: boolean }) {
        this.clearPlayers(options);
        this.clearMatches(options);
    }
}