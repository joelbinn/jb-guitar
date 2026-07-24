import {inject, Injectable, signal} from '@angular/core';
import {Exercise, PracticePlan, Session, SyncStatus} from '../models';
import {GitHubSyncService} from './github-sync.service';

export interface AppData {
    exercises: Exercise[];
    plans: PracticePlan[];
    sessions: Session[];
}

const STORAGE_KEY = 'jb-guitar-data';

@Injectable({ providedIn: 'root' })
export class StorageService {
    private readonly gitSync = inject(GitHubSyncService);

    private data: AppData = { exercises: [], plans: [], sessions: [] };

    syncStatus = signal<SyncStatus>('unconfigured');
    metronomeVolume = signal<number>(this.loadMetronomeVolume());
    private currentSha?: string;
    private isPushing = false;
    private pushPending = false;

    constructor() {
        this.load();
        this.initSync();
    }

  setMetronomeVolume(volume: number): void {
    const val = Math.max(0, Math.min(100, Math.round(volume)));
    this.metronomeVolume.set(val);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('jbguitar:metronome-volume', String(val));
    }
    }

    private loadMetronomeVolume(): number {
      if (typeof localStorage === 'undefined') return 50;
        const raw = localStorage.getItem('jbguitar:metronome-volume');
        if (raw !== null) {
            const val = parseInt(raw, 10);
            if (!isNaN(val) && val >= 0 && val <= 100) {
                return val;
            }
        }
        return 50; // default 50%
    }

    private load(): void {
      if (typeof localStorage === 'undefined') return;
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                this.data = JSON.parse(raw);
            } catch {
                this.data = { exercises: [], plans: [], sessions: [] };
            }
        }
    }

    private persist(): void {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      }
        this.pushToGitHubBackground();
    }

    // ── Exercises ──────────────────────────────────

    getExercises(): Exercise[] {
        return [...this.data.exercises];
    }

    getExerciseById(id: string): Exercise | undefined {
        return this.data.exercises.find((e) => e.id === id);
    }

    saveExercise(exercise: Exercise): void {
        const idx = this.data.exercises.findIndex((e) => e.id === exercise.id);
        if (idx >= 0) {
            this.data.exercises[idx] = exercise;
        } else {
            this.data.exercises.push(exercise);
        }
        this.persist();
    }

    deleteExercise(id: string): void {
        this.data.exercises = this.data.exercises.filter((e) => e.id !== id);
        this.persist();
    }

    // ── Plans ──────────────────────────────────────

    getPlans(): PracticePlan[] {
        return [...this.data.plans];
    }

    getPlanById(id: string): PracticePlan | undefined {
        return this.data.plans.find((p) => p.id === id);
    }

    savePlan(plan: PracticePlan): void {
        const idx = this.data.plans.findIndex((p) => p.id === plan.id);
        if (idx >= 0) {
            this.data.plans[idx] = plan;
        } else {
            this.data.plans.push(plan);
        }
        this.persist();
    }

    deletePlan(id: string): void {
        this.data.plans = this.data.plans.filter((p) => p.id !== id);
        this.persist();
    }

    // ── Sessions ───────────────────────────────────

    getSessions(): Session[] {
        return [...this.data.sessions];
    }

    getSessionById(id: string): Session | undefined {
        return this.data.sessions.find((s) => s.id === id);
    }

    saveSession(session: Session): void {
        const idx = this.data.sessions.findIndex((s) => s.id === session.id);
        if (idx >= 0) {
            this.data.sessions[idx] = session;
        } else {
            this.data.sessions.push(session);
        }
        this.persist();
    }

    deleteSession(id: string): void {
        this.data.sessions = this.data.sessions.filter((s) => s.id !== id);
        this.persist();
    }

    // ── Export / Import ────────────────────────────

    exportToFile(): void {
        const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'jb-guitar-backup.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    importFromFile(file: File): Promise<void> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    this.data = JSON.parse(reader.result as string);
                    this.persist();
                    resolve();
                } catch (e) {
                    reject(e);
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }

    // ── GitHub Sync ────────────────────────────────

    private async initSync(): Promise<void> {
        const settings = this.gitSync.settings();
        if (!settings.enabled || !settings.repo || !settings.token) {
            this.syncStatus.set('unconfigured');
            return;
        }
        // Pull latest data from GitHub on startup
        await this.pullFromGitHub();
    }

    private async pushToGitHubBackground(): Promise<void> {
        const settings = this.gitSync.settings();
        if (!settings.enabled || !settings.repo || !settings.token) return;

        // Debounce: if already pushing, flag that a new push is pending
        if (this.isPushing) {
            this.pushPending = true;
            return;
        }

        this.isPushing = true;
        this.syncStatus.set('syncing');
        try {
            this.currentSha = await this.gitSync.updateFile(settings, this.data, this.currentSha);
            this.syncStatus.set('synced');
        } catch (error) {
            console.error('GitHub push failed:', error);
            this.syncStatus.set('error');
        } finally {
            this.isPushing = false;
            if (this.pushPending) {
                this.pushPending = false;
                this.pushToGitHubBackground();
            }
        }
    }

    /** Manually pull data from GitHub (overwrites local data) */
    async pullFromGitHub(): Promise<void> {
        const settings = this.gitSync.settings();
        if (!settings.repo || !settings.token) return;

        this.syncStatus.set('syncing');
        try {
            const result = await this.gitSync.getFile(settings);
            if (result.data) {
                this.data = result.data;
                this.currentSha = result.sha;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            } else {
                // File doesn't exist yet on GitHub — push our current local data
                this.currentSha = await this.gitSync.updateFile(settings, this.data, undefined);
            }
            this.syncStatus.set('synced');
        } catch (error) {
            console.error('GitHub pull failed:', error);
            this.syncStatus.set('error');
        }
    }

    /** Manually push local data to GitHub (overwrites remote) */
    async pushToGitHub(): Promise<void> {
        const settings = this.gitSync.settings();
        if (!settings.repo || !settings.token) return;

        this.syncStatus.set('syncing');
        try {
            // Always fetch latest SHA before pushing to avoid conflicts
            const result = await this.gitSync.getFile(settings);
            const sha = result.sha ?? this.currentSha;
            this.currentSha = await this.gitSync.updateFile(settings, this.data, sha);
            this.syncStatus.set('synced');
        } catch (error) {
            console.error('GitHub push failed:', error);
            this.syncStatus.set('error');
        }
    }
}
