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
      const session = this.storage.getSessionById(id);
      if (!session) return undefined;
      // Migrate old sessions that don't have timerMinutes on exercises
      let needsSave = false;
      session.exerciseState.forEach((completion: any) => {
        if (completion.timerMinutes === undefined) {
          completion.timerMinutes = 5;
          needsSave = true;
        }
      });
      if (needsSave) {
        this.storage.saveSession(session);
      }
      return session;
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
          exerciseState: exerciseIds.map((id) => ({
            exerciseId: id,
            completed: false,
            timerMinutes: 5
          })),
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
      const currentCompletion = session.exerciseState.find((c) => c.exerciseId === session.currentExerciseId);
      if (currentCompletion) {
        currentCompletion.completed = true;
      }

      // Find next uncompleted exercise or go to next in order
      const currentIdx = session.exerciseState.findIndex((c) => c.exerciseId === session.currentExerciseId);
      if (currentIdx >= 0 && currentIdx < session.exerciseState.length - 1) {
        session.currentExerciseId = session.exerciseState[currentIdx + 1].exerciseId;
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

      const currentIdx = session.exerciseState.findIndex((c) => c.exerciseId === session.currentExerciseId);
      if (currentIdx <= 0) return session;

      session.currentExerciseId = session.exerciseState[currentIdx - 1].exerciseId;
      session.updatedAt = new Date().toISOString();
      this.storage.saveSession(session);
      return session;
    }

  setCurrentExerciseId(sessionId: string, exerciseId: string): Session | undefined {
    const session = this.storage.getSessionById(sessionId);
    if (!session) return undefined;

    // Validate exercise exists in session
    const exerciseExists = session.exerciseState.some((c) => c.exerciseId === exerciseId);
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
    session.exerciseState.forEach((c) => (c.completed = false));

    // Go back to first exercise
    if (session.exerciseState.length > 0) {
      session.currentExerciseId = session.exerciseState[0].exerciseId;
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

  save(session: Session): void {
    session.updatedAt = new Date().toISOString();
    this.storage.saveSession(session);
  }
}
