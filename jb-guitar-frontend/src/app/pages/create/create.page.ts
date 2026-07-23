import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {Exercise, PracticePlan} from '../../models';
import {ExerciseService, PlanService} from '../../services';

@Component({
  selector: 'jbg-create',
  template: `
    <div class="create-label">Övningar</div>
    <div class="create-exercises-list" [style.margin-bottom]="'var(--space-6)'">
      @for (ex of exercises(); track ex.id) {
        <div class="card mob-btn"
             [style.cursor]="'pointer'"
             [style.flex-direction]="'row'"
             [style.align-items]="'center'"
             [style.justify-content]="'space-between'"
             [style.gap]="'var(--space-3)'"
             (click)="editExercise(ex.id)">
          <div>
            <div class="card-title" [style.font-size]="'14px'">{{ ex.name }}</div>
            <span class="tag tag-outline">{{ sourceLabel(ex.source) }}</span>
          </div>
          <span [style.font-size]="'16px'" [style.color]="'var(--color-accent-700)'">→</span>
        </div>
      }
      <div class="card mob-btn"
           [style.display]="'flex'"
           [style.align-items]="'center'"
           [style.justify-content]="'center'"
           [style.gap]="'var(--space-2)'"
           [style.cursor]="'pointer'"
           [style.color]="'var(--color-neutral-600)'"
           (click)="newExercise()">
        <svg width="15"
             height="15"
             viewBox="0 0 24 24"
             fill="none"
             stroke="currentColor"
             stroke-width="1.5"
             stroke-linecap="round"
             stroke-linejoin="round">
          <path d="M5 12h14"/>
          <path d="M12 5v14"/>
        </svg>
        <span [style.font-size]="'13px'">Ny övning</span>
      </div>
    </div>

    <div class="create-label">Övningsplaner</div>
    <div class="create-plans-list">
      @for (plan of plans(); track plan.id) {
        <div class="card elev-sm">
          <div class="card-title" [style.font-size]="'15px'">{{ plan.name }}</div>
          <div [style.font-size]="'12px'"
               [style.color]="'var(--color-neutral-600)'">{{ plan.exerciseIds.length }} övningar
          </div>
          <button type="button" class="btn btn-ghost btn-block mob-btn" (click)="editPlan(plan.id)">
            Redigera →
          </button>
        </div>
      }
      <div class="card mob-btn"
           [style.display]="'flex'"
           [style.align-items]="'center'"
           [style.justify-content]="'center'"
           [style.gap]="'var(--space-2)'"
           [style.cursor]="'pointer'"
           [style.color]="'var(--color-neutral-600)'"
           (click)="newPlan()">
        <svg width="15"
             height="15"
             viewBox="0 0 24 24"
             fill="none"
             stroke="currentColor"
             stroke-width="1.5"
             stroke-linecap="round"
             stroke-linejoin="round">
          <path d="M5 12h14"/>
          <path d="M12 5v14"/>
        </svg>
        <span [style.font-size]="'13px'">Ny plan</span>
      </div>
    </div>
  `,
  styles: `
    .create-label {
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-accent-700);
      margin-bottom: var(--space-2);
    }

    .create-exercises-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .create-plans-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePage {
  private readonly exerciseService = inject(ExerciseService);
  exercises = signal<Exercise[]>(this.exerciseService.getAll());
  private readonly planService = inject(PlanService);
  plans = signal<PracticePlan[]>(this.planService.getAll());
  private readonly router = inject(Router);

  sourceLabel(source: string): string {
    const map: Record<string, string> = {
      youtube: 'YouTube',
      jtc: 'JTC Guitar',
      soundslice: 'Soundslice',
      other: 'Annan',
    };
    return map[source] ?? source;
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
