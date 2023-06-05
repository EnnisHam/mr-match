import { DateTime } from 'luxon';
import crypto from 'crypto';
import { IMatch, IThreadArchive } from "../types/match";

export class BattleThreadManager {
    constructor() {};
    private ThreadList: IThreadArchive[] = [];

    private createHash(input: string) {
        const hash = crypto.createHash('sha1').update(input).digest('hex');
        return hash;
    }

    private logThread(threadId: string,roomCode: string) {
        const time = DateTime.now();
        const data = {
            threadName: threadId,
            roomCode: roomCode,
            created: time
        };
        this.ThreadList.push(data);
        console.log(`logging thread ${JSON.stringify(data)}`);
    }

    public addThreadForMatch(match: IMatch) {
        const threadId = this.createHash(JSON.stringify(match));
        this.logThread(threadId, match.roomCode);
        return threadId;
    }

    public getThreads() {
        return this.ThreadList;
    }

    public removeFromList(target: string) {
        const list = this.ThreadList.filter((thread) => thread.threadName !== target);
        this.ThreadList = list;
    }
}