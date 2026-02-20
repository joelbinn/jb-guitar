import { Injectable } from '@angular/core';
import { Session } from '../models';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class SessionService {
    constructor(private storage: StorageService) { }

    getAll(): Session[] {
        return this.storage.getSessions();
    }

    getById(id: string): Session | undefined {
        return this.storage.getSessionById(id);
    }

    getLatest(): Session | undefined {
        const sessions = this.storage
            .getSessions()
            .filter((s) => s.status !== 'completed')
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        return sessions[0];
    }

    create(planId: string, exerciseCount: number): Session {
        const session: Session = {
            id: crypto.randomUUID(),
            planId,
            status: 'active',
            currentIndex: 0,
            completed: new Array(exerciseCount).fill(false),
            startedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.storage.saveSession(session);
        return session;
    }

    next(id: string): Session | undefined {
        const session = this.storage.getSessionById(id);
        if (!session) return undefined;
        session.completed[session.currentIndex] = true;
        if (session.currentIndex < session.completed.length - 1) {
            session.currentIndex++;
        } else {
            session.status = 'completed';
        }
        session.updatedAt = new Date().toISOString();
        this.storage.saveSession(session);
        return session;
    }

    previous(id: string): Session | undefined {
        const session = this.storage.getSessionById(id);
        if (!session || session.currentIndex <= 0) return session;
        session.currentIndex--;
        session.updatedAt = new Date().toISOString();
        this.storage.saveSession(session);
        return session;
    }

    pause(id: string): Session | undefined {
        const session = this.storage.getSessionById(id);
        if (!session) return undefined;
        session.status = 'paused';
        session.updatedAt = new Date().toISOString();
        this.storage.saveSession(session);
        return session;
    }

    resume(id: string): Session | undefined {
        const session = this.storage.getSessionById(id);
        if (!session) return undefined;
        session.status = 'active';
        session.updatedAt = new Date().toISOString();
        this.storage.saveSession(session);
        return session;
    }

    delete(id: string): void {
        this.storage.deleteSession(id);
    }
}
