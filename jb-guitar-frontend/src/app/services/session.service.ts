import {inject, Injectable} from '@angular/core';
import {Session} from '../models';
import {StorageService} from './storage.service';

@Injectable({providedIn: 'root'})
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
      // Migrate old sessions that don't have metronomeConfig
      if (!completion.metronomeConfig) {
        completion.metronomeConfig = {
          bpm: 100,
          numerator: 4,
          denominator: 4,
          beatProfile: ['stark', 'svag', 'svag', 'svag']
        };
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
        timerMinutes: 5,
        metronomeConfig: {
          bpm: 100,
          numerator: 4,
          denominator: 4,
          beatProfile: ['stark', 'svag', 'svag', 'svag']
        }
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

    // Create new session reference to trigger signal updates
    const updated = {...session, exerciseState: [...session.exerciseState]};

    // Find current exercise completion and mark as complete
    const currentCompletion = updated.exerciseState.find((c) => c.exerciseId === updated.currentExerciseId);
    if (currentCompletion) {
      currentCompletion.completed = true;
    }

    // Find next uncompleted exercise or go to next in order
    const currentIdx = updated.exerciseState.findIndex((c) => c.exerciseId === updated.currentExerciseId);
    if (currentIdx >= 0 && currentIdx < updated.exerciseState.length - 1) {
      updated.currentExerciseId = updated.exerciseState[currentIdx + 1].exerciseId;
    } else {
      // Mark session as completed if on last exercise
      updated.status = 'completed';
    }

    updated.updatedAt = new Date().toISOString();
    this.storage.saveSession(updated);
    return updated;
  }

  previous(id: string): Session | undefined {
    const session = this.storage.getSessionById(id);
    if (!session) return session;

    const currentIdx = session.exerciseState.findIndex((c) => c.exerciseId === session.currentExerciseId);
    if (currentIdx <= 0) return session;

    // Create new reference to trigger signal updates
    const updated = {...session};
    updated.currentExerciseId = session.exerciseState[currentIdx - 1].exerciseId;
    updated.updatedAt = new Date().toISOString();
    this.storage.saveSession(updated);
    return updated;
  }

  setCurrentExerciseId(sessionId: string, exerciseId: string): Session | undefined {
    const session = this.storage.getSessionById(sessionId);
    if (!session) return undefined;

    // Validate exercise exists in session
    const exerciseExists = session.exerciseState.some((c) => c.exerciseId === exerciseId);
    if (!exerciseExists) {
      return session; // Invalid exercise ID, don't proceed
    }

    // Create new reference to trigger signal updates
    const updated = {...session};
    updated.currentExerciseId = exerciseId;
    updated.updatedAt = new Date().toISOString();
    this.storage.saveSession(updated);
    return updated;
  }

  pause(id: string): Session | undefined {
    const session = this.storage.getSessionById(id);
    if (!session) return undefined;
    const updated = {...session};
    updated.status = 'paused';
    updated.updatedAt = new Date().toISOString();
    this.storage.saveSession(updated);
    return updated;
  }

  resume(id: string): Session | undefined {
    const session = this.storage.getSessionById(id);
    if (!session) return undefined;
    const updated = {...session};
    updated.status = 'active';
    updated.updatedAt = new Date().toISOString();
    this.storage.saveSession(updated);
    return updated;
  }

  restart(id: string): Session | undefined {
    const session = this.storage.getSessionById(id);
    if (!session) return undefined;

    // Create new reference to trigger signal updates
    const updated = {...session, exerciseState: [...session.exerciseState]};

    // Reset all exercises to not completed
    updated.exerciseState.forEach((c) => (c.completed = false));

    // Go back to first exercise
    if (updated.exerciseState.length > 0) {
      updated.currentExerciseId = updated.exerciseState[0].exerciseId;
    }

    // Set status back to active
    updated.status = 'active';
    updated.updatedAt = new Date().toISOString();
    this.storage.saveSession(updated);
    return updated;
  }

  delete(id: string): void {
    this.storage.deleteSession(id);
  }

  save(session: Session): void {
    session.updatedAt = new Date().toISOString();
    this.storage.saveSession(session);
  }
}
