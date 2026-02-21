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
    <div class="breadcrumb" (click)="goBack()">← Skapa /
      <span class="crumb-active">Övningsplan</span></div>
    <div class="page-title">{{ isNew() ? 'Ny plan' : 'Redigera plan' }}</div>

    <div class="field">
      <label class="field-label" for="name">Namn</label>
      <input class="field-input" id="name" [ngModel]="name()" (ngModelChange)="name.set($event)" placeholder="Ange namn..." />
    </div>

    <div class="sect-label">Övningar i planen <span class="count">{{ rows().length }} st</span></div>

    <div cdkDropList (cdkDropListDropped)="drop($event)">
      @for (row of rows(); track row.exerciseId; let i = $index) {
        <div class="plan-row" cdkDrag>
          <span class="drag-handle" cdkDragHandle>⠿</span>
          <span class="plan-num">{{ i + 1 }}.</span>
          <span class="plan-name">{{ row.name }}</span>
          <span class="tag" style="font-size: 9px;">{{ row.source }}</span>
          <span class="plan-remove" (click)="removeExercise(i)">×</span>
        </div>
      }
    </div>

    <div class="add-exercise" (click)="showAddPicker.set(true)">+ Lägg till övning</div>
    <div class="drag-hint">⠿ Drag & drop för att sortera om</div>

    <button class="btn btn-primary btn-full" style="margin-bottom: 8px;" (click)="save()">
      Spara övningsplan
    </button>
    <div class="btn-row">
      <button class="btn btn-ghost" style="flex: 1;" (click)="cancel()">Avbryt</button>
      @if (!isNew()) {
        <button class="btn btn-danger" style="flex: 1;" (click)="remove()">Ta bort plan</button>
      }
    </div>

    @if (showAddPicker()) {
      <div class="picker-overlay" (click)="showAddPicker.set(false)">
        <div class="picker" (click)="$event.stopPropagation()">
          <div class="picker-title">Lägg till övning</div>
          @for (ex of availableExercises(); track ex.id) {
            <button class="picker-item" (click)="addExercise(ex)">
              {{ ex.name }}
              <span class="picker-source">{{ ex.source }}</span>
            </button>
          }
          @if (availableExercises().length === 0) {
            <div class="picker-empty">Alla övningar är redan tillagda, eller inga övningar finns.</div>
          }
        </div>
      </div>
    }
  `,
  styles: `
    .breadcrumb { font-size: 10px; color: var(--txt3); margin-bottom: 16px; cursor: pointer; }
    .crumb-active { color: var(--txt2); }
    .page-title { font-size: 18px; font-weight: 700; color: var(--txt); margin-bottom: 20px; }
    .count { color: var(--txt4); }
    .plan-row {
      display: flex; align-items: center; gap: 8px;
      background: var(--surf); border: 1px solid var(--border); border-radius: 6px;
      padding: 8px 10px; margin-bottom: 6px; transition: border-color 0.15s, background 0.15s;
    }
    .plan-row:hover { border-color: var(--border2); }
    .drag-handle { color: var(--border2); font-size: 14px; cursor: grab; flex-shrink: 0; }
    .plan-num { font-size: 10px; color: var(--txt3); width: 18px; flex-shrink: 0; }
    .plan-name { flex: 1; font-size: 12px; color: var(--txt); }
    .plan-remove { font-size: 14px; color: var(--txt4); cursor: pointer; flex-shrink: 0; transition: color 0.15s; }
    .plan-remove:hover { color: var(--danger); }
    .add-exercise {
      border: 1px dashed var(--border2); border-radius: 6px; padding: 10px;
      text-align: center; font-size: 11px; color: var(--txt4); cursor: pointer;
      margin: 10px 0; transition: border-color 0.15s, color 0.15s;
    }
    .add-exercise:hover { border-color: var(--accent); color: var(--txt3); }
    .drag-hint { font-size: 9px; color: var(--txt4); margin-bottom: 16px; font-style: italic; }
    .picker-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6);
      display: flex; align-items: center; justify-content: center; z-index: 100;
    }
    .picker {
      background: var(--surf); border: 1px solid var(--border); border-radius: 10px;
      padding: 20px; width: 340px; max-width: 90vw;
    }
    .picker-title { font-weight: 600; font-size: 14px; margin-bottom: 14px; color: var(--txt); }
    .picker-item {
      display: flex; justify-content: space-between; align-items: center;
      width: 100%; background: var(--surf2); border: 1px solid var(--border);
      border-radius: 6px; padding: 10px 12px; color: var(--txt); font-size: 12px;
      cursor: pointer; margin-bottom: 6px; font-family: inherit; transition: border-color 0.15s;
    }
    .picker-item:hover { border-color: var(--accent); }
    .picker-source { font-size: 10px; color: var(--txt3); }
    .picker-empty { font-size: 11px; color: var(--txt4); font-style: italic; text-align: center; padding: 16px; }
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

  addExercise(ex: Exercise): void {
    this.rows.update((r) => [...r, { exerciseId: ex.id, name: ex.name, source: ex.source }]);
    this.showAddPicker.set(false);
  }

  removeExercise(index: number): void {
    this.rows.update((r) => r.filter((_, i) => i !== index));
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
