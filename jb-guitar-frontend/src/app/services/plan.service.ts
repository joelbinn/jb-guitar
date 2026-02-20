import { Injectable } from '@angular/core';
import { PracticePlan } from '../models';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class PlanService {
    constructor(private storage: StorageService) { }

    getAll(): PracticePlan[] {
        return this.storage.getPlans();
    }

    getById(id: string): PracticePlan | undefined {
        return this.storage.getPlanById(id);
    }

    save(plan: PracticePlan): void {
        this.storage.savePlan(plan);
    }

    create(name: string, exerciseIds: string[] = []): PracticePlan {
        const plan: PracticePlan = {
            id: crypto.randomUUID(),
            name,
            exerciseIds,
            createdAt: new Date().toISOString(),
        };
        this.storage.savePlan(plan);
        return plan;
    }

    delete(id: string): void {
        this.storage.deletePlan(id);
    }
}
