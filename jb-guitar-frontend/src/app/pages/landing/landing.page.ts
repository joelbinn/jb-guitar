import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {Session} from '../../models';
import {ExerciseService, PlanService, SessionService} from '../../services';

@Component({
  selector: 'jbg-landing',
  template: `
    <div class="landing-label">Senaste session</div>

    @if (hasLatestSession()) {
      @if (plan(); as p) {
        <div class="card elev-sm">
          <div class="card-kicker">Övningsplan</div>
          <div class="card-title">{{ p.name }}</div>
          <div class="landing-status">{{ statusLabel() }} · {{ pausedDateTime() }} · {{ estimatedMinutes() }} min</div>
          <div class="landing-progress-bar">
            <div class="landing-progress-fill" [style.width.%]="progressPercent()"></div>
          </div>
          <div class="landing-progress-text">{{ completedCount() }} av {{ totalCount() }} övningar</div>

          @if (currentExercise(); as ex) {
            <div class="landing-current-section">
              <div class="landing-current-label">Aktuell övning</div>
              <div class="landing-current-name">{{ ex.name }}</div>
            </div>
          }

          <div class="landing-btn-group">
            <button type="button" class="btn btn-primary btn-block mob-btn" (click)="continueSession()">
              Fortsätt
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
            <button type="button" class="btn btn-secondary btn-block mob-btn" (click)="startNew()">Starta ny session</button>
          </div>
        </div>
      }
    } @else {
      <div class="card" [style.text-align]="'center'" [style.padding]="'var(--space-8) var(--space-4)'">
        <div [style.font-size]="'13px'" [style.color]="'var(--color-neutral-600)'" [style.font-style]="'italic'" [style.margin-bottom]="'var(--space-3)'">Ingen övningssession påbörjad</div>
        <button type="button" class="btn btn-secondary btn-block mob-btn" (click)="startNew()">+ Starta övningssession</button>
      </div>
    }
  `,
  styles: `
    .landing-label {
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-accent-700);
      margin-bottom: var(--space-3);
    }

    .landing-status {
      font-size: 13px;
      color: var(--color-neutral-700);
    }

    .landing-progress-bar {
      background: var(--color-neutral-200);
      border-radius: var(--radius-sm);
      height: 6px;
      margin: var(--space-2) 0;
    }

    .landing-progress-fill {
      display: block;
      height: 100%;
      background: var(--color-accent);
      border-radius: var(--radius-sm);
    }

    .landing-progress-text {
      font-size: 12px;
      color: var(--color-neutral-600);
    }

    .landing-current-section {
      margin-top: var(--space-3);
    }

    .landing-current-label {
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--color-neutral-600);
    }

    .landing-current-name {
      font-size: 14px;
      color: var(--color-text);
    }

    .landing-btn-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-top: var(--space-4);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {
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
    const date = d.toLocaleDateString('sv-SE', {day: 'numeric', month: 'short'});
    const time = d.toLocaleTimeString('sv-SE', {hour: '2-digit', minute: '2-digit'});
    return `${date} ${time}`;
  });
  private readonly sessionService = inject(SessionService);
  latestSession = signal<Session | undefined>(this.sessionService.getLatest());
  estimatedMinutes = computed(() => {
    const s = this.latestSession();
    if (!s) return 0;
    return s.exerciseState.reduce((sum, state) => sum + state.timerMinutes, 0);
  });
  hasLatestSession = computed(() => !!this.latestSession());
  private readonly planService = inject(PlanService);
  plan = computed(() => {
    const s = this.latestSession();
    return s ? this.planService.getById(s.planId) : undefined;
  });
  private readonly exerciseService = inject(ExerciseService);
  currentExercise = computed(() => {
    const s = this.latestSession();
    if (!s) return undefined;
    return this.exerciseService.getById(s.currentExerciseId);
  });
  private readonly router = inject(Router);

  continueSession(): void {
    const s = this.latestSession();
    if (s) this.router.navigate(['/practice', s.id]);
  }

  startNew(): void {
    this.router.navigate(['/practice']);
  }
}
