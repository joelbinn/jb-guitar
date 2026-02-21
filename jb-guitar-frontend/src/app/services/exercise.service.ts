import {Injectable} from '@angular/core';
import {Exercise, ExerciseSource} from '../models';
import {StorageService} from './storage.service';

@Injectable({ providedIn: 'root' })
export class ExerciseService {
    constructor(private storage: StorageService) { }

    getAll(): Exercise[] {
        return this.storage.getExercises();
    }

    getById(id: string): Exercise | undefined {
        return this.storage.getExerciseById(id);
    }

    save(exercise: Exercise): void {
        this.storage.saveExercise(exercise);
    }

  create(name: string, source: ExerciseSource, url: string, description?: string): Exercise {
        const exercise: Exercise = {
            id: crypto.randomUUID(),
            name,
            source,
            url,
          description,
            createdAt: new Date().toISOString(),
        };
        this.storage.saveExercise(exercise);
        return exercise;
    }

    delete(id: string): void {
        this.storage.deleteExercise(id);
    }
}
