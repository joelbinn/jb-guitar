import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Exercise, PracticePlan } from '../../models';
import { ExerciseService, PlanService } from '../../services';

@Component({
    selector: 'jbg-create',
    template: `
    <div class="sect-label">Övningar</div>
    <div class="grid-3" style="margin-bottom: 20px;">
      @for (ex of exercises; track ex.id) {
        <div class="card" style="padding: 10px; cursor: pointer;" (click)="editExercise(ex.id)">
          <div class="ex-name">{{ ex.name }}</div>
          <div class="tag">{{ sourceLabel(ex.source) }}</div>
          <div class="card-bottom">
            <div class="edit-link">Redigera →</div>
          </div>
        </div>
      }
      <div class="card-new" style="font-size: 11px;" (click)="newExercise()">+ Ny övning</div>
    </div>

    <div class="sect-label">Övningsplaner</div>
    <div class="grid-2">
      @for (plan of plans; track plan.id) {
        <div class="card">
          <div class="card-title" style="font-size: 12px;">{{ plan.name }}</div>
          <div class="card-sub">{{ plan.exerciseIds.length }} övningar</div>
          <div class="plan-preview">
            @for (exId of plan.exerciseIds.slice(0, 3); track exId; let i = $index) {
              {{ i + 1 }}. {{ getExerciseName(exId) }}<br>
            }
            @if (plan.exerciseIds.length > 3) { ··· }
          </div>
          <button class="btn btn-ghost btn-sm" (click)="editPlan(plan.id)">Redigera →</button>
        </div>
      }
      <div class="card-new" (click)="newPlan()">+ Ny plan</div>
    </div>
  `,
    styles: `
    .ex-name { font-size: 11px; font-weight: 600; margin-bottom: 4px; }
    .card-bottom { margin-top: auto; padding-top: 8px; }
    .edit-link { font-size: 10px; color: var(--txt3); }
    .plan-preview {
      margin: 8px 0; font-size: 10px; color: var(--txt3); line-height: 1.8;
    }
    .btn-sm { font-size: 10px; padding: 4px 10px; }
    .grid-3 > .card, .grid-2 > .card {
      display: flex; flex-direction: column;
    }
  `,
})
export class CreatePage implements OnInit {
    exercises: Exercise[] = [];
    plans: PracticePlan[] = [];

    constructor(
        private exerciseService: ExerciseService,
        private planService: PlanService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.exercises = this.exerciseService.getAll();
        this.plans = this.planService.getAll();
    }

    sourceLabel(source: string): string {
        const map: Record<string, string> = {
            youtube: 'YouTube',
            jtc: 'JTC Guitar',
            soundslice: 'Soundslice',
            other: 'Annan',
        };
        return map[source] ?? source;
    }

    getExerciseName(id: string): string {
        return this.exerciseService.getById(id)?.name ?? 'Borttagen';
    }

    editExercise(id: string): void {
        this.router.navigate(['/create/exercise', id]);
    }

    newExercise(): void {
        this.router.navigate(['/create/exercise/new']);
    }

    editPlan(id: string): void {
        this.router.navigate(['/create/plan', id]);
    }

    newPlan(): void {
        this.router.navigate(['/create/plan/new']);
    }
}
