import {Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Exercise, ExerciseSource} from '../../models';
import {ExerciseService} from '../../services';

@Component({
  selector: 'jbg-exercise-edit',
  imports: [FormsModule],
  template: `
    <div class="breadcrumb" (click)="goBack()">
      ← Skapa / <span class="crumb-active">Övning</span>
    </div>
    <h2 class="page-title">{{ isNew() ? 'Ny övning' : 'Redigera övning' }}</h2>

    <div class="field" style="max-width: 480px;">
      <label for="name">Namn</label>
      <input class="input" id="name" [ngModel]="name()" (ngModelChange)="name.set($event)" placeholder="Ange namn..." />
    </div>

    <div class="field" style="max-width: 480px;">
      <label>Källa</label>
      <div class="source-pills">
        @for (s of sources; track s.value) {
          <button type="button" class="spill" [class.active]="source() === s.value" (click)="source.set(s.value)">
            {{ s.label }}
          </button>
        }
      </div>
    </div>

    <div class="field" style="max-width: 480px;">
      <label for="url">URL</label>
      <input class="input" id="url" [ngModel]="url()" (ngModelChange)="url.set($event)" placeholder="https://..." />
    </div>

    @if (url()) {
      <div class="field" style="max-width: 480px;">
        <label>Förhandsgranskning</label>
        <div class="card preview-card">
          <div class="preview-text">{{ name() || 'Övning' }} · {{ sourceDomain() }}</div>
        </div>
      </div>
    }

    <div class="field" style="max-width: 480px;">
      <label for="description">Beskrivning (valfritt)</label>
      <textarea
        class="input"
        id="description"
        [ngModel]="description()"
        (ngModelChange)="description.set($event)"
        placeholder="Ange beskrivning..."
        rows="4"
      ></textarea>
    </div>

    <div style="max-width: 480px; display: flex; flex-direction: column; gap: var(--space-2);">
      <button type="button" class="btn btn-primary btn-block" (click)="save()">
        Spara övning
      </button>
      <div style="display: flex; gap: var(--space-2);">
        <button type="button" class="btn btn-secondary" style="flex: 1;" (click)="cancel()">Avbryt</button>
        @if (!isNew()) {
          <button type="button" class="btn btn-secondary" style="flex: 1;" (click)="remove()">Ta bort övning</button>
        }
      </div>
    </div>
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
    .preview-card {
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .preview-text {
      font-size: 11px;
      color: var(--color-neutral-600);
    }
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
  description = signal('');

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
        this.description.set(ex.description ?? '');
      }
    }
  }

  save(): void {
    const n = this.name().trim();
    const u = this.url().trim();
    if (!n || !u) return;
    const d = this.description().trim();
    if (this.isNew()) {
      this.exerciseService.create(n, this.source(), u, d || undefined);
    } else {
      const ex: Exercise = {
        id: this.exerciseId(),
        name: n,
        source: this.source(),
        url: u,
        description: d || undefined,
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

  goBack(): void {
    this.router.navigate(['/create']);
  }
}
