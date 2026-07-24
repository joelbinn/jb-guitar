import {Component, computed, inject, signal} from '@angular/core';
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
    <div class="breadcrumb" (click)="goBack()">
      ← Skapa / <span class="crumb-active">Övningsplan</span>
    </div>
    <h2 class="page-title">{{ isNew() ? 'Ny plan' : 'Redigera plan' }}</h2>

    <div class="field" style="max-width: 480px;">
      <label for="plan-name">Namn</label>
      <input class="input" id="plan-name" [ngModel]="name()" (ngModelChange)="name.set($event)" placeholder="Ange namn..." />
    </div>

    <div class="plan-eyebrow">Övningar i planen · {{ rows().length }} st</div>

    <div cdkDropList (cdkDropListDropped)="drop($event)" class="rows-container">
      @for (row of rows(); track row.exerciseId; let i = $index) {
        <div class="plan-row" cdkDrag>
          <span class="drag-handle" cdkDragHandle title="Dra för att sortera">⠿</span>
          <span class="row-num">{{ i + 1 }}.</span>
          <span class="row-name">{{ row.name }}</span>
          <span class="tag tag-neutral">{{ sourceLabel(row.source) }}</span>

          <button type="button" class="btn btn-ghost btn-icon row-btn" (click)="moveUp(i)" [disabled]="i === 0" aria-label="Flytta upp">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m18 15-6-6-6 6"/>
            </svg>
          </button>
          <button type="button" class="btn btn-ghost btn-icon row-btn" (click)="moveDown(i)" [disabled]="i === rows().length - 1" aria-label="Flytta ner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          <button type="button" class="btn btn-ghost btn-icon row-btn" (click)="removeExercise(i)" aria-label="Ta bort">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
      }
    </div>

    <div class="add-exercise-btn" (click)="showAddPicker.set(true)">
      + Lägg till övning
    </div>

    <div style="max-width: 480px; display: flex; flex-direction: column; gap: var(--space-2);">
      <button type="button" class="btn btn-primary btn-block" (click)="save()">
        Spara övningsplan
      </button>
      <div style="display: flex; gap: var(--space-2);">
        <button type="button" class="btn btn-secondary" style="flex: 1;" (click)="cancel()">Avbryt</button>
        @if (!isNew()) {
          <button type="button" class="btn btn-secondary" style="flex: 1;" (click)="remove()">Ta bort plan</button>
        }
      </div>
    </div>

    @if (showAddPicker()) {
      <div class="dialog-backdrop" (click)="showAddPicker.set(false)">
        <div class="dialog" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
          <div class="dialog-title">Lägg till övning</div>
          <div class="dialog-body">
            <div class="picker-list">
              @for (ex of availableExercises(); track ex.id) {
                <button type="button" class="btn btn-secondary picker-btn" (click)="addExercise(ex)">
                  <span>{{ ex.name }}</span>
                  <span class="picker-source">{{ sourceLabel(ex.source) }}</span>
                </button>
              }
              @if (availableExercises().length === 0) {
                <div class="picker-empty">Alla övningar är redan tillagda, eller inga övningar finns.</div>
              }
            </div>
          </div>
          <div class="dialog-actions">
            <button type="button" class="btn btn-secondary" (click)="showAddPicker.set(false)">
              Avbryt
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .breadcrumb {
      font-size: 11px;
      color: var(--color-neutral-500);
      cursor: pointer;
      margin-bottom: var(--space-2);
    }
    .crumb-active {
      color: var(--color-text);
    }
    .page-title {
      margin-bottom: var(--space-6);
      font-size: 24px;
    }
    .plan-eyebrow {
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--color-neutral-600);
      margin-bottom: var(--space-2);
    }
    .rows-container {
      max-width: 560px;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-2);
    }
    .plan-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      border: 1px solid var(--color-divider);
      padding: var(--space-2) var(--space-3);
      background: #fffdf7;
      border-radius: var(--radius-sm);
    }
    .drag-handle {
      font-size: 14px;
      color: var(--color-neutral-400);
      cursor: grab;
      user-select: none;
    }
    .row-num {
      font-size: 11px;
      color: var(--color-neutral-500);
      width: 18px;
    }
    .row-name {
      flex: 1;
      font-size: 13px;
      color: var(--color-text);
    }
    .row-btn {
      width: 28px;
      height: 28px;
      padding: 0;
    }
    .add-exercise-btn {
      max-width: 560px;
      border: 1px dashed var(--color-divider);
      text-align: center;
      padding: var(--space-3);
      font-size: 12px;
      color: var(--color-neutral-600);
      cursor: pointer;
      margin-bottom: var(--space-6);
      background: #fffdf7;
      border-radius: var(--radius-sm);
      transition: border-color 0.15s, color 0.15s;
    }
    .add-exercise-btn:hover {
      border-color: var(--color-accent);
      color: var(--color-accent-700);
    }
    .picker-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .picker-btn {
      width: 100%;
      justify-content: space-between;
    }
    .picker-source {
      font-size: 11px;
      color: var(--color-neutral-500);
      font-weight: normal;
    }
    .picker-empty {
      font-size: 12px;
      color: var(--color-neutral-600);
      font-style: italic;
      text-align: center;
      padding: var(--space-4);
    }
  `,
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

  sourceLabel(source: string): string {
    const map: Record<string, string> = {
      youtube: 'YouTube',
      jtc: 'JTC Guitar',
      soundslice: 'Soundslice',
      other: 'Annan',
    };
    return map[source] ?? source;
  }

  addExercise(ex: Exercise): void {
    this.rows.update((r) => [...r, { exerciseId: ex.id, name: ex.name, source: ex.source }]);
    this.showAddPicker.set(false);
  }

  removeExercise(index: number): void {
    this.rows.update((r) => r.filter((_, i) => i !== index));
  }

  moveUp(index: number): void {
    if (index > 0) {
      this.rows.update((r) => {
        const copy = [...r];
        const temp = copy[index - 1];
        copy[index - 1] = copy[index];
        copy[index] = temp;
        return copy;
      });
    }
  }

  moveDown(index: number): void {
    if (index < this.rows().length - 1) {
      this.rows.update((r) => {
        const copy = [...r];
        const temp = copy[index + 1];
        copy[index + 1] = copy[index];
        copy[index] = temp;
        return copy;
      });
    }
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
