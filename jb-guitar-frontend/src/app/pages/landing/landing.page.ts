import {Component, computed, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {Session} from '../../models';
import {ExerciseService, PlanService, SessionService} from '../../services';

@Component({
  selector: 'jbg-landing',
  template: `
    <div class="sect-label">Senaste session</div>

    @if (latestSession()) {
      @if (plan(); as p) {
        <div class="card card-accent-top">
          <div class="card-title">{{ p.name }}</div>
          <div class="card-sub">Övningsplan · {{ statusLabel() }} {{ pausedDate() }}</div>
          <div class="prog-wrap">
            <div class="prog-fill" [style.width.%]="progressPercent()"></div>
          </div>
          <div class="progress-text">{{ completedCount() }} av {{ totalCount() }} övningar</div>

          @if (currentExercise(); as ex) {
            <div class="current-label">Aktuell övning</div>
            <div class="current-name">{{ ex.name }}</div>
            <div class="current-url">{{ ex.url }}</div>
          }

          <div class="btn-row">
            <button class="btn btn-primary" (click)="continueSession()">Fortsätt →</button>
            <button class="btn btn-ghost" (click)="startNew()">Starta ny session</button>
          </div>
        </div>
      }
    } @else {
      <div class="empty-state">
        <div class="empty-hint">Ingen övningssession påbörjad</div>
        <button class="btn btn-ghost empty-btn" (click)="startNew()">+ Starta övningssession</button>
      </div>
    }
  `,
  styles: `
    .progress-text { font-size: 10px; color: var(--txt3); margin-bottom: 8px; }
    .current-label {
      font-size: 9px; color: var(--txt3); letter-spacing: 1px;
      text-transform: uppercase; margin-bottom: 4px;
    }
    .current-name { font-size: 12px; color: var(--txt); margin-bottom: 2px; }
    .current-url { font-size: 10px; color: var(--txt3); margin-bottom: 10px; }
    .empty-state {
      border: 1px dashed var(--border); border-radius: 8px;
      padding: 40px 24px; text-align: center;
    }
    .empty-hint {
      font-size: 11px; color: var(--txt4); margin-bottom: 12px; font-style: italic;
    }
    .empty-btn { font-size: 12px; padding: 8px 20px; }
  `,
})
export class LandingPage {
  private readonly sessionService = inject(SessionService);
  private readonly planService = inject(PlanService);
  private readonly exerciseService = inject(ExerciseService);
  private readonly router = inject(Router);

  latestSession = signal<Session | undefined>(this.sessionService.getLatest());

  plan = computed(() => {
    const s = this.latestSession();
    return s ? this.planService.getById(s.planId) : undefined;
  });

  currentExercise = computed(() => {
    const s = this.latestSession();
    if (!s) return undefined;
    return this.exerciseService.getById(s.currentExerciseId);
  });

  completedCount = computed(() => {
    const s = this.latestSession();
    if (!s) return 0;
    return s.exerciseState.filter((c) => c.completed).length;
  });

  totalCount = computed(() => this.latestSession()?.exerciseState.length ?? 0);
  progressPercent = computed(() => {
    const total = this.totalCount();
    return total > 0 ? (this.completedCount() / total) * 100 : 0;
  });

  statusLabel = computed(() => {
    const s = this.latestSession();
    if (!s) return '';
    return s.status === 'paused' ? 'Pausad' : 'Pågående';
  });

  pausedDate = computed(() => {
    const s = this.latestSession();
    if (!s) return '';
    const d = new Date(s.updatedAt);
    return `${d.getDate()} ${d.toLocaleString('sv', { month: 'short' })}`;
  });

  continueSession(): void {
    const s = this.latestSession();
    if (s) this.router.navigate(['/practice', s.id]);
  }

  startNew(): void {
    this.router.navigate(['/practice']);
  }
}
