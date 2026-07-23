import {Component, computed, inject, signal, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {CdkDragDrop, DragDropModule, moveItemInArray} from '@angular/cdk/drag-drop';
import {Exercise, PracticePlan} from '../../models';
import {ExerciseService, PlanService} from '../../services';

interface PlanExerciseRow {
  exerciseId: string;
  name: string;
  source: string;
}

@Component({
  selector: 'jbg-plan-edit',
  imports: [FormsModule, DragDropModule],
  template: `
    <div [style.font-size]="'11px'" [style.color]="'var(--color-neutral-500)'" [style.cursor]="'pointer'" [style.margin-bottom]="'var(--space-2)'" (click)="goBack()">← Skapa</div>
    <h2 [style.margin-bottom]="'var(--space-5)'">{{ isNew() ? 'Ny plan' : 'Redigera plan' }}</h2>

    <div class="field">
      <label for="name">Namn</label>
      <input class="input mob-btn" id="name" [ngModel]="name()" (ngModelChange)="name.set($event)" placeholder="Ange namn..." />
    </div>

    <div [style.font-size]="'11px'" [style.letter-spacing]="'0.1em'" [style.text-transform]="'uppercase'" [style.color]="'var(--color-neutral-600)'" [style.margin-bottom]="'var(--space-2)'">Övningar · {{ rows().length }} st</div>
    <div [style.display]="'flex'" [style.flex-direction]="'column'" [style.gap]="'var(--space-2)'" [style.margin-bottom]="'var(--space-2)'" cdkDropList (cdkDropListDropped)="drop($event)">
      @for (row of rows(); track row.exerciseId; let i = $index) {
        <div [style.display]="'flex'" [style.align-items]="'center'" [style.gap]="'var(--space-2)'" [style.border]="'1px solid var(--color-divider)'" [style.padding]="'var(--space-2) var(--space-3)'" cdkDrag>
          <span [style.flex]="'1'" [style.font-size]="'13px'">{{ i + 1 }}. {{ row.name }}</span>
          <button type="button" class="btn btn-ghost btn-icon" [style.width]="'38px'" [style.height]="'38px'" (click)="moveUp(i)" [disabled]="i === 0" aria-label="Upp">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          </button>
          <button type="button" class="btn btn-ghost btn-icon" [style.width]="'38px'" [style.height]="'38px'" (click)="moveDown(i)" [disabled]="i === rows().length - 1" aria-label="Ner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <button type="button" class="btn btn-ghost btn-icon" [style.width]="'38px'" [style.height]="'38px'" (click)="removeExercise(i)" aria-label="Ta bort">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      }
    </div>
    <div [style.border]="'1px dashed var(--color-divider)'" [style.text-align]="'center'" [style.padding]="'var(--space-3)'" [style.font-size]="'12px'" [style.color]="'var(--color-neutral-600)'" [style.cursor]="'pointer'" [style.margin-bottom]="'var(--space-5)'" (click)="showAddPicker.set(true)">+ Lägg till övning</div>

    <div [style.display]="'flex'" [style.flex-direction]="'column'" [style.gap]="'var(--space-2)'">
      <button type="button" class="btn btn-primary btn-block mob-btn" (click)="save()">Spara plan</button>
      <button type="button" class="btn btn-secondary btn-block mob-btn" (click)="cancel()">Avbryt</button>
      @if (!isNew()) {
        <button type="button" class="btn btn-secondary btn-block mob-btn" (click)="remove()">Ta bort plan</button>
      }
    </div>

    @if (showAddPicker()) {
      <div class="dialog-backdrop" (click)="showAddPicker.set(false)">
        <div class="dialog" role="dialog" aria-modal="true" (click)="$event.stopPropagation()" [style.max-width]="'340px'">
          <div class="dialog-title">Lägg till övning</div>
          <div class="dialog-body" [style.max-height]="'60vh'" [style.overflow-y]="'auto'">
            <div [style.display]="'flex'" [style.flex-direction]="'column'" [style.gap]="'var(--space-2)'">
              @for (ex of availableExercises(); track ex.id) {
                <button type="button" class="btn btn-secondary mob-btn" [style.justify-content]="'space-between'" [style.width]="'100%'" (click)="addExercise(ex)">
                  <span>{{ ex.name }}</span>
                  <span [style.color]="'var(--color-neutral-500)'" [style.font-size]="'12px'">{{ ex.source }}</span>
                </button>
              }
              @if (availableExercises().length === 0) {
                <div [style.font-size]="'12px'" [style.color]="'var(--color-neutral-500)'" [style.font-style]="'italic'" [style.text-align]="'center'" [style.padding]="'var(--space-4)'">Alla övningar är redan tillagda, eller inga övningar finns.</div>
              }
            </div>
          </div>
          <div class="dialog-actions">
            <button type="button" class="btn btn-secondary mob-btn" (click)="showAddPicker.set(false)">Klar</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanEditPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly exerciseService = inject(ExerciseService);
  private readonly planService = inject(PlanService);

  isNew = signal(true);
  planId = signal('');
  name = signal('');
  rows = signal<PlanExerciseRow[]>([]);
  showAddPicker = signal(false);

  availableExercises = computed(() => {
    const usedIds = new Set(this.rows().map((r) => r.exerciseId));
    return this.exerciseService.getAll().filter((e) => !usedIds.has(e.id));
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isNew.set(false);
      this.planId.set(id);
      const plan = this.planService.getById(id);
      if (plan) {
        this.name.set(plan.name);
        this.rows.set(
          plan.exerciseIds.map((eid) => {
            const ex = this.exerciseService.getById(eid);
            return {
              exerciseId: eid,
              name: ex?.name ?? 'Borttagen',
              source: ex?.source ?? '',
            };
          }),
        );
      }
    }
  }

  addExercise(ex: Exercise): void {
    this.rows.update((r) => [...r, { exerciseId: ex.id, name: ex.name, source: ex.source }]);
    this.showAddPicker.set(false);
  }

  removeExercise(index: number): void {
    this.rows.update((r) => r.filter((_, i) => i !== index));
  }

  moveUp(index: number): void {
    if (index <= 0) return;
    this.rows.update((r) => {
      const copy = [...r];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  }

  moveDown(index: number): void {
    if (index >= this.rows().length - 1) return;
    this.rows.update((r) => {
      const copy = [...r];
      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
      return copy;
    });
  }

  drop(event: CdkDragDrop<PlanExerciseRow[]>): void {
    this.rows.update((r) => {
      const copy = [...r];
      moveItemInArray(copy, event.previousIndex, event.currentIndex);
      return copy;
    });
  }

  save(): void {
    const n = this.name().trim();
    if (!n) return;
    if (this.isNew()) {
      this.planService.create(n, this.rows().map((r) => r.exerciseId));
    } else {
      const plan: PracticePlan = {
        id: this.planId(),
        name: n,
        exerciseIds: this.rows().map((r) => r.exerciseId),
        createdAt: this.planService.getById(this.planId())?.createdAt ?? new Date().toISOString(),
      };
      this.planService.save(plan);
    }
    this.router.navigate(['/create']);
  }

  cancel(): void {
    this.router.navigate(['/create']);
  }

  remove(): void {
    if (confirm('Ta bort denna övningsplan?')) {
      this.planService.delete(this.planId());
      this.router.navigate(['/create']);
    }
  }

  goBack(): void {
    this.router.navigate(['/create']);
  }
}
