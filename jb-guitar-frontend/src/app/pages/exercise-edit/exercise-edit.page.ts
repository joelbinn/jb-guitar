import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Exercise, ExerciseSource } from '../../models';
import { ExerciseService } from '../../services';

@Component({
  selector: 'jbg-exercise-edit',
  imports: [FormsModule],
  template: `
    <div class="breadcrumb">← Skapa / <span class="crumb-active">Övning</span></div>
    <div class="page-title">{{ isNew() ? 'Ny övning' : 'Redigera övning' }}</div>

    <div class="field">
      <label class="field-label" for="name">Namn</label>
      <input class="field-input" id="name" [ngModel]="name()" (ngModelChange)="name.set($event)" placeholder="Ange namn..." />
    </div>

    <div class="field">
      <div class="field-label">Källa</div>
      <div class="source-pills">
        @for (s of sources; track s.value) {
          <button class="spill" [class.active]="source() === s.value" (click)="source.set(s.value)">
            {{ s.label }}
          </button>
        }
      </div>
    </div>

    <div class="field">
      <label class="field-label" for="url">URL</label>
      <input class="field-input" id="url" [ngModel]="url()" (ngModelChange)="url.set($event)" placeholder="https://..." />
    </div>

    @if (url()) {
      <div class="field">
        <div class="field-label">Förhandsgranskning</div>
        <div class="preview">
          <div class="preview-name">{{ name() || 'Övning' }} · {{ sourceDomain() }}</div>
        </div>
      </div>
    }

    <button class="btn btn-primary btn-full" style="margin-bottom: 8px;" (click)="save()">
      Spara övning
    </button>
    <div class="btn-row">
      <button class="btn btn-ghost" style="flex: 1;" (click)="cancel()">Avbryt</button>
      @if (!isNew()) {
        <button class="btn btn-danger" style="flex: 1;" (click)="remove()">Ta bort övning</button>
      }
    </div>
  `,
  styles: `
    .breadcrumb { font-size: 10px; color: var(--txt3); margin-bottom: 16px; cursor: pointer; }
    .crumb-active { color: var(--txt2); }
    .page-title { font-size: 18px; font-weight: 700; color: var(--txt); margin-bottom: 20px; }
    .preview {
      background: #0c0c0c; border: 1px solid var(--border); border-radius: 6px;
      height: 90px; display: flex; align-items: center; justify-content: center;
    }
    .preview-name { font-size: 10px; color: var(--txt4); }
  `,
})
export class ExerciseEditPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly exerciseService = inject(ExerciseService);

  isNew = signal(true);
  exerciseId = signal('');
  name = signal('');
  source = signal<ExerciseSource>('youtube');
  url = signal('');

  readonly sources: { value: ExerciseSource; label: string }[] = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'jtc', label: 'JTC Guitar' },
    { value: 'soundslice', label: 'Soundslice' },
    { value: 'other', label: 'Annan' },
  ];

  sourceDomain = computed(() => {
    try {
      return new URL(this.url()).hostname;
    } catch {
      return this.source();
    }
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isNew.set(false);
      this.exerciseId.set(id);
      const ex = this.exerciseService.getById(id);
      if (ex) {
        this.name.set(ex.name);
        this.source.set(ex.source);
        this.url.set(ex.url);
      }
    }
  }

  save(): void {
    const n = this.name().trim();
    const u = this.url().trim();
    if (!n || !u) return;
    if (this.isNew()) {
      this.exerciseService.create(n, this.source(), u);
    } else {
      const ex: Exercise = {
        id: this.exerciseId(),
        name: n,
        source: this.source(),
        url: u,
        createdAt: this.exerciseService.getById(this.exerciseId())?.createdAt ?? new Date().toISOString(),
      };
      this.exerciseService.save(ex);
    }
    this.router.navigate(['/create']);
  }

  cancel(): void {
    this.router.navigate(['/create']);
  }

  remove(): void {
    if (confirm('Ta bort denna övning?')) {
      this.exerciseService.delete(this.exerciseId());
      this.router.navigate(['/create']);
    }
  }
}
