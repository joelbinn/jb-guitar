import { Injectable } from '@angular/core';
import { Exercise, PracticePlan, Session } from '../models';

export interface AppData {
    exercises: Exercise[];
    plans: PracticePlan[];
    sessions: Session[];
}

const STORAGE_KEY = 'jb-guitar-data';

@Injectable({ providedIn: 'root' })
export class StorageService {
    private data: AppData = { exercises: [], plans: [], sessions: [] };

    constructor() {
        this.load();
    }

    private load(): void {
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
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
}
