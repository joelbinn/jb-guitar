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
        <div class="card elev-sm" style="max-width: 640px;">
          <div class="card-kicker">Övningsplan</div>
          <div class="card-title">{{ p.name }}</div>
          <div class="status-line">{{ statusLabel() }} {{ pausedDateTime() }} · ⏱ {{ estimatedMinutes() }} min</div>

          <div class="prog-wrap">
            <div class="prog-fill" [style.width.%]="progressPercent()"></div>
          </div>
          <div class="progress-text">{{ completedCount() }} av {{ totalCount() }} övningar</div>

          @if (currentExercise(); as ex) {
            <div class="current-box">
              <div class="current-kicker">Aktuell övning</div>
              <div class="current-name">{{ ex.name }}</div>
              <div class="current-url">{{ ex.url }}</div>
            </div>
          }

          <div class="btn-row">
            <button type="button" class="btn btn-primary" (click)="continueSession()">
              Fortsätt
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </button>
            <button type="button" class="btn btn-secondary" (click)="startNew()">
              Starta ny session
            </button>
          </div>
        </div>
      }
    } @else {
      <div class="card" style="max-width: 640px; text-align: center; padding: var(--space-8) var(--space-4);">
        <div class="empty-hint">Ingen övningssession påbörjad</div>
        <button type="button" class="btn btn-secondary" style="margin: 0 auto;" (click)="startNew()">
          + Starta övningssession
        </button>
      </div>
    }
  `,
  styles: `
    .status-line {
      font-size: 13px;
      color: var(--color-neutral-700);
    }
    .progress-text {
      font-size: 12px;
      color: var(--color-neutral-600);
    }
    .current-box {
      margin-top: var(--space-3);
    }
    .current-kicker {
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--color-neutral-600);
      margin-bottom: 2px;
    }
    .current-name {
      font-size: 14px;
      color: var(--color-text);
      font-weight: 500;
    }
    .current-url {
      font-size: 11px;
      color: var(--color-neutral-600);
      word-break: break-all;
    }
    .empty-hint {
      font-size: 13px;
      color: var(--color-neutral-600);
      font-style: italic;
      margin-bottom: var(--space-3);
    }
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

  pausedDateTime = computed(() => {
    const s = this.latestSession();
    if (!s) return '';
    const d = new Date(s.updatedAt);
    const date = `${d.getDate()} ${d.toLocaleString('sv', {month: 'short'})}`;
    const time = d.toLocaleTimeString('sv', {hour: '2-digit', minute: '2-digit'});
    return `${date} ${time}`;
  });

  estimatedMinutes = computed(() => {
    const s = this.latestSession();
    if (!s) return 0;
    return s.exerciseState.reduce((sum, state) => sum + state.timerMinutes, 0);
  });

  continueSession(): void {
    const s = this.latestSession();
    if (s) this.router.navigate(['/practice', s.id]);
  }

  startNew(): void {
    this.router.navigate(['/practice']);
  }
}
