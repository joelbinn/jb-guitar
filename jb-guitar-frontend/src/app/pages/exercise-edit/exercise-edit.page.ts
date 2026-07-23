import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Exercise, ExerciseSource} from '../../models';
import {ExerciseService} from '../../services';

@Component({
  selector: 'jbg-exercise-edit',
  imports: [FormsModule],
  template: `
    <div [style.font-size]="'11px'"
         [style.color]="'var(--color-neutral-500)'"
         [style.cursor]="'pointer'"
         [style.margin-bottom]="'var(--space-2)'"
         (click)="goBack()">← Skapa
    </div>
    <h2 [style.margin-bottom]="'var(--space-5)'">{{
        isNew() ? 'Ny övning' : 'Redigera övning'
      }}</h2>

    <div class="field">
      <label for="name">Namn</label>
      <input class="input mob-btn"
             id="name"
             [ngModel]="name()"
             (ngModelChange)="name.set($event)"
             placeholder="Ange namn..."/>
    </div>

    <div class="field">
      <label>Källa</label>
      <div [style.display]="'flex'" [style.gap]="'var(--space-2)'" [style.flex-wrap]="'wrap'">
        @for (s of sources; track s.value) {
          <span class="tag"
                [style.cursor]="'pointer'"
                [style.padding]="'8px 12px'"
                [style.border]="source() === s.value ? '1px solid ' + 'var(--color-accent)' : '1px solid var(--color-divider)'"
                [style.color]="source() === s.value ? 'var(--color-accent)' : 'var(--color-neutral-600)'"
                [style.background]="source() === s.value ? 'var(--color-accent-100)' : 'transparent'"
                (click)="source.set(s.value)">
            {{ s.label }}
          </span>
        }
      </div>
    </div>

    <div class="field">
      <label for="url">URL</label>
      <input class="input mob-btn"
             id="url"
             [ngModel]="url()"
             (ngModelChange)="url.set($event)"
             placeholder="https://..."/>
    </div>

    <div class="field">
      <label for="description">Beskrivning (valfritt)</label>
      <textarea class="input"
                id="description"
                [ngModel]="description()"
                (ngModelChange)="description.set($event)"
                placeholder="Ange beskrivning..."
                rows="4"></textarea>
    </div>

    <div [style.display]="'flex'"
         [style.flex-direction]="'column'"
         [style.gap]="'var(--space-2)'"
         [style.margin-top]="'var(--space-3)'">
      <button type="button" class="btn btn-primary btn-block mob-btn" (click)="save()">Spara
        övning
      </button>
      <button type="button" class="btn btn-secondary btn-block mob-btn" (click)="cancel()">Avbryt
      </button>
      @if (!isNew()) {
        <button type="button" class="btn btn-secondary btn-block mob-btn" (click)="remove()">Ta bort
          övning
        </button>
      }
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseEditPage {
  isNew = signal(true);
  exerciseId = signal('');
  name = signal('');
  source = signal<ExerciseSource>('youtube');
  url = signal('');
  description = signal('');
  readonly sources: { value: ExerciseSource; label: string }[] = [
    {value: 'youtube', label: 'YouTube'},
    {value: 'jtc', label: 'JTC Guitar'},
    {value: 'soundslice', label: 'Soundslice'},
    {value: 'other', label: 'Annan'},
  ];
  sourceDomain = computed(() => {
    try {
      return new URL(this.url()).hostname;
    } catch {
      return this.source();
    }
  });
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly exerciseService = inject(ExerciseService);

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
