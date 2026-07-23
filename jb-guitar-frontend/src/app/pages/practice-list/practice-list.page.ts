import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {PracticePlan, Session} from '../../models';
import {PlanService, SessionService} from '../../services';

interface SessionView {
  session: Session;
  planName: string;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  dateLabel: string;
  estimatedMinutes: number;
}

@Component({
  selector: 'jbg-practice-list',
  template: `
    @if (latest(); as lat) {
      <div class="practice-label">Senaste session</div>
      <div class="card elev-sm" [style.margin-bottom]="'var(--space-6)'">
        <div class="card-title">{{ lat.planName }}</div>
        <div class="practice-status">{{ lat.completedCount }} av {{ lat.totalCount }} · {{ statusLabel(lat.session) }} {{ lat.dateLabel }} · {{ lat.estimatedMinutes }} min</div>
        <div class="practice-progress-bar">
          <div class="practice-progress-fill" [style.width.%]="lat.progressPercent"></div>
        </div>
        <button type="button" class="btn btn-primary btn-block mob-btn" (click)="openSession(lat.session.id)">
          Fortsätt
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </div>
    }

    <div class="practice-label">Pågående sessioner</div>
    <div class="practice-sessions-list">
      @for (sv of otherSessions(); track sv.session.id) {
        <div class="card elev-sm">
          <div class="card-title" [style.font-size]="'15px'">{{ sv.planName }}</div>
          <div [style.font-size]="'12px'" [style.color]="'var(--color-neutral-600)'">{{ sv.completedCount }} av {{ sv.totalCount }} · {{ sv.estimatedMinutes }} min@if (sv.session.status === 'completed') { · klar }</div>
          <div class="practice-progress-bar">
            <div class="practice-progress-fill" [style.width.%]="sv.progressPercent" [style.background]="sv.session.status === 'completed' ? 'var(--color-neutral-500)' : 'var(--color-accent)'"></div>
          </div>
          <div [style.display]="'flex'" [style.justify-content]="'space-between'" [style.align-items]="'center'">
            <span [style.font-size]="'10px'" [style.color]="'var(--color-neutral-500)'">{{ sv.dateLabel }}</span>
            <button type="button" class="btn btn-ghost mob-btn" (click)="openSession(sv.session.id)">{{ sv.session.status === 'completed' ? 'Se igen →' : 'Fortsätt →' }}</button>
          </div>
        </div>
      }
      <div class="card mob-btn" [style.display]="'flex'" [style.align-items]="'center'" [style.justify-content]="'center'" [style.gap]="'var(--space-2)'" [style.cursor]="'pointer'" [style.color]="'var(--color-neutral-600)'" (click)="startNewSession()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        <span [style.font-size]="'13px'">Ny session</span>
      </div>
    </div>

    @if (showPlanPicker()) {
      <div class="dialog-backdrop" (click)="showPlanPicker.set(false)">
        <div class="dialog" role="dialog" aria-modal="true" (click)="$event.stopPropagation()" [style.max-width]="'340px'">
          <div class="dialog-title">Välj övningsplan</div>
          <div class="dialog-body" [style.max-height]="'60vh'" [style.overflow-y]="'auto'">
            <div [style.display]="'flex'" [style.flex-direction]="'column'" [style.gap]="'var(--space-2)'">
              @for (plan of plans(); track plan.id) {
                <button type="button" class="btn btn-secondary mob-btn" [style.justify-content]="'space-between'" [style.width]="'100%'" (click)="createSession(plan)">
                  <span>{{ plan.name }}</span>
                  <span [style.color]="'var(--color-neutral-500)'" [style.font-size]="'12px'">{{ plan.exerciseIds.length }} övningar</span>
                </button>
              }
              @if (plans().length === 0) {
                <div [style.font-size]="'12px'" [style.color]="'var(--color-neutral-500)'" [style.font-style]="'italic'" [style.text-align]="'center'" [style.padding]="'var(--space-4)'">Inga övningsplaner skapade. Gå till Skapa först.</div>
              }
            </div>
          </div>
          <div class="dialog-actions">
            <button type="button" class="btn btn-secondary mob-btn" (click)="showPlanPicker.set(false)">Avbryt</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .practice-label {
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-accent-700);
      margin-bottom: var(--space-2);
    }

    .practice-status {
      font-size: 12px;
      color: var(--color-neutral-600);
    }

    .practice-progress-bar {
      background: var(--color-neutral-200);
      border-radius: var(--radius-sm);
      height: 6px;
      margin: var(--space-2) 0;
    }

    .practice-progress-fill {
      display: block;
      height: 100%;
      background: var(--color-accent);
      border-radius: var(--radius-sm);
    }

    .practice-sessions-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticeListPage {
  showPlanPicker = signal(false);
  private readonly sessionService = inject(SessionService);
  private readonly planService = inject(PlanService);
  plans = signal<PracticePlan[]>(this.planService.getAll());
  private readonly router = inject(Router);
  private readonly sessionViews = computed<SessionView[]>(() => {
    const sessions = this.sessionService.getAll()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return sessions.map((s) => {
      const plan = this.planService.getById(s.planId);
      const completedCount = s.exerciseState.filter((c) => c.completed).length;
      const totalCount = s.exerciseState.length;
      const estimatedMinutes = s.exerciseState.reduce((sum, state) => sum + state.timerMinutes, 0);
      const updatedDate = new Date(s.updatedAt);
      return {
        session: s,
        planName: plan?.name ?? 'Okänd plan',
        completedCount,
        totalCount,
        progressPercent: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
        dateLabel: updatedDate.toLocaleDateString('sv-SE', {day: 'numeric', month: 'short'}),
        estimatedMinutes,
      };
    });
  });

  latest = computed(() => this.sessionViews().find((v) => v.session.status !== 'completed'));
  otherSessions = computed(() => {
    const lat = this.latest();
    return lat ? this.sessionViews().filter((v) => v !== lat) : this.sessionViews();
  });

  statusLabel(session: Session): string {
    switch (session.status) {
      case 'active':
        return 'Pågående';
      case 'paused':
        return 'Pausad';
      case 'completed':
        return 'Klar';
    }
  }

  openSession(id: string): void {
    this.router.navigate(['/practice', id]);
  }

  startNewSession(): void {
    this.showPlanPicker.set(true);
  }

  createSession(plan: PracticePlan): void {
    const session = this.sessionService.create(plan.id, plan.exerciseIds);
    this.showPlanPicker.set(false);
    this.router.navigate(['/practice', session.id]);
  }
}
