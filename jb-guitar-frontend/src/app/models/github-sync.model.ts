export interface GitHubSyncSettings {
    enabled: boolean;
    repo: string;
    token: string;
    branch: string;
    filePath: string;
}

export type SyncStatus = 'unconfigured' | 'synced' | 'syncing' | 'error';
