import { DateTime } from 'luxon';
import crypto from 'crypto';
import { IMatch, IThreadArchive } from '../types/match';
import { Interaction, TextChannel } from 'discord.js';

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

    public findThread(roomCode: string) {
        const matchingThread = this.ThreadList.find((thread) => thread.roomCode === roomCode);
        return matchingThread;
    }

    public addThreadForMatch(match: IMatch) {
        const threadId = this.createHash(JSON.stringify(match));
        const threadName = `Battle-Thread: ${threadId}`;
        this.logThread(threadName, match.roomCode);
        return threadName;
    }

    public getThreads() {
        return this.ThreadList;
    }

    public removeFromList(target: string) {
        const list = this.ThreadList.filter((thread) => thread.threadName !== target);
        this.ThreadList = list;
    }

    /**
     * This includes a fall back for cleaning up threads in case the bot
     * crashes
     * @param interaction Discord interaction event object
     */
    public async clearArchivedThreads(interaction: Interaction) {
        const threadList = this.getThreads();

        await threadList.forEach(async (thread_log) => {
            if (thread_log.created.diffNow().minutes >= 10) {
                const channel = interaction.channel as TextChannel;
                const thread = channel.threads.cache.find(
                    (thread) => thread.name === thread_log.threadName
                );
                if (thread) {
                    try {
                        await thread.delete();
                    } catch {
                        console.error(`failed to delete thread ${thread.name}`);
                    }
                    this.removeFromList(thread.name);
                    console.log(`deleted ${thread.name}`);
                }
            }
        });

        await this.clearArchived(interaction);
    }

    private async clearArchived(interaction: Interaction) {
        const channel = interaction.channel as TextChannel;
        await this.clearArchivedRecursive(channel);
    }

    private async clearArchivedRecursive(channel: TextChannel) {
        const archived = await channel.threads.fetchArchived();
        await archived.threads.forEach(async (thread) => {
            if (thread.name.includes('Battle-Thread')) {
                try {
                    await thread.delete();
                } catch {
                    console.error(`failed to delete thread ${thread.name}`);
                }
            }
        });

        if (archived.hasMore) {
            this.clearArchivedRecursive(channel);
        }

        return;
    }

    public async clearAllThreads(interaction: Interaction) {
        const channel = interaction.channel as TextChannel;
        await this.clearAllRecursive(channel);
    }
    
    private async clearAllRecursive(channel: TextChannel) {
        const threads = await channel.threads.fetch();
        const filteredThreads = threads.threads.filter(
            (thread) => thread.name.includes('Battle-Thread')
        ).map((thread) => thread);

        if (filteredThreads.length < 1) {
            return;
        }

        await filteredThreads.forEach(async (thread) => {
            try {
                await thread.delete();
            } catch {
                console.error(`failed to delete thread ${thread.name}`);
            }
        });

        await this.clearAllRecursive(channel);
        await this.clearArchivedRecursive(channel);
    }
}