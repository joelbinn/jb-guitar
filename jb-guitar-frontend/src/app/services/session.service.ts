import {inject, Injectable} from '@angular/core';
import {Session} from '../models';
import {StorageService} from './storage.service';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly storage = inject(StorageService);

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

  create(planId: string, exerciseIds: string[]): Session {
        const session: Session = {
            id: crypto.randomUUID(),
            planId,
            status: 'active',
          currentExerciseId: exerciseIds[0] ?? '',
          exerciseCompletions: exerciseIds.map((id) => ({exerciseId: id, completed: false})),
            startedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.storage.saveSession(session);
        return session;
    }

    next(id: string): Session | undefined {
        const session = this.storage.getSessionById(id);
        if (!session) return undefined;

      // Find current exercise completion and mark as complete
      const currentCompletion = session.exerciseCompletions.find((c) => c.exerciseId === session.currentExerciseId);
      if (currentCompletion) {
        currentCompletion.completed = true;
      }

      // Find next uncompleted exercise or go to next in order
      const currentIdx = session.exerciseCompletions.findIndex((c) => c.exerciseId === session.currentExerciseId);
      if (currentIdx >= 0 && currentIdx < session.exerciseCompletions.length - 1) {
        session.currentExerciseId = session.exerciseCompletions[currentIdx + 1].exerciseId;
        } else {
        // Mark session as completed if on last exercise
            session.status = 'completed';
        }

        session.updatedAt = new Date().toISOString();
        this.storage.saveSession(session);
        return session;
    }

    previous(id: string): Session | undefined {
        const session = this.storage.getSessionById(id);
      if (!session) return session;

      const currentIdx = session.exerciseCompletions.findIndex((c) => c.exerciseId === session.currentExerciseId);
      if (currentIdx <= 0) return session;

      session.currentExerciseId = session.exerciseCompletions[currentIdx - 1].exerciseId;
      session.updatedAt = new Date().toISOString();
      this.storage.saveSession(session);
      return session;
    }

  setCurrentExerciseId(sessionId: string, exerciseId: string): Session | undefined {
    const session = this.storage.getSessionById(sessionId);
    if (!session) return undefined;

    // Validate exercise exists in session
    const exerciseExists = session.exerciseCompletions.some((c) => c.exerciseId === exerciseId);
    if (!exerciseExists) {
      return session; // Invalid exercise ID, don't proceed
    }

    session.currentExerciseId = exerciseId;
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

  restart(id: string): Session | undefined {
    const session = this.storage.getSessionById(id);
    if (!session) return undefined;

    // Reset all exercises to not completed
    session.exerciseCompletions.forEach((c) => (c.completed = false));

    // Go back to first exercise
    if (session.exerciseCompletions.length > 0) {
      session.currentExerciseId = session.exerciseCompletions[0].exerciseId;
    }

    // Set status back to active
    session.status = 'active';
    session.updatedAt = new Date().toISOString();
    this.storage.saveSession(session);
    return session;
  }

    delete(id: string): void {
        this.storage.deleteSession(id);
    }
}
