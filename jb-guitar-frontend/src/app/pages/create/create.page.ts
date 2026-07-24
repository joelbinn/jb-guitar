import {Component, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {Exercise, PracticePlan} from '../../models';
import {ExerciseService, PlanService} from '../../services';

@Component({
  selector: 'jbg-create',
  template: `
    <div class="sect-label">Övningar</div>
    <div class="exercises-grid">
      @for (ex of exercises(); track ex.id) {
        <div class="card" style="cursor: pointer; display: flex; flex-direction: column;" (click)="editExercise(ex.id)">
          <div class="card-title" style="font-size: 15px;">{{ ex.name }}</div>
          <span class="tag tag-outline" style="align-self: flex-start;">{{ sourceLabel(ex.source) }}</span>
          <div class="edit-link">Redigera →</div>
        </div>
      }
      <div class="card-new" style="min-height: 110px;" (click)="newExercise()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
        <span>Ny övning</span>
      </div>
    </div>

    <div class="sect-label">Övningsplaner</div>
    <div class="plans-grid">
      @for (plan of plans(); track plan.id) {
        <div class="card elev-sm" style="display: flex; flex-direction: column;">
          <div class="card-title" style="font-size: 15px;">{{ plan.name }}</div>
          <div class="plan-count">{{ plan.exerciseIds.length }} övningar</div>
          <div class="plan-preview">
            @for (exId of plan.exerciseIds.slice(0, 3); track exId; let i = $index) {
              <div>{{ i + 1 }}. {{ getExerciseName(exId) }}</div>
            }
            @if (plan.exerciseIds.length > 3) {
              <div>···</div>
            }
          </div>
          <button type="button" class="btn btn-ghost" style="align-self: flex-start; margin-top: auto;" (click)="editPlan(plan.id)">
            Redigera →
          </button>
        </div>
      }
      <div class="card-new" style="min-height: 120px;" (click)="newPlan()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
        <span>Ny plan</span>
      </div>
    </div>
  `,
  styles: `
    .exercises-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-8);
    }
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: var(--space-4);
    }
    .edit-link {
      margin-top: auto;
      font-size: 12px;
      color: var(--color-accent-700);
      font-weight: 500;
      padding-top: var(--space-2);
    }
    .plan-count {
      font-size: 12px;
      color: var(--color-neutral-600);
    }
    .plan-preview {
      font-size: 12px;
      color: var(--color-neutral-600);
      line-height: 1.7;
      margin: var(--space-2) 0;
    }
  `,
})
export class CreatePage {
  private readonly exerciseService = inject(ExerciseService);
  private readonly planService = inject(PlanService);
  private readonly router = inject(Router);

  exercises = signal<Exercise[]>(this.exerciseService.getAll());
  plans = signal<PracticePlan[]>(this.planService.getAll());

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
