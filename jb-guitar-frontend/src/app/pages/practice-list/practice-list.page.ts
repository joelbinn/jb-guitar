import {Component, computed, inject, signal} from '@angular/core';
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
  timeLabel: string;
  estimatedMinutes: number;
}

@Component({
  selector: 'jbg-practice-list',
  template: `
    @if (latest(); as lat) {
      <div class="sect-label">Senaste session</div>
      <div class="card elev-sm" style="margin-bottom: var(--space-8);">
        <div class="latest-header">
          <div>
            <div class="card-title">{{ lat.planName }}</div>
            <div class="card-sub">{{ lat.completedCount }} av {{ lat.totalCount }} · {{ statusLabel(lat.session) }} {{ lat.dateLabel }} {{ lat.timeLabel }} · ⏱ {{ lat.estimatedMinutes }} min</div>
          </div>
          <button type="button" class="btn btn-primary" (click)="openSession(lat.session.id)">
            Fortsätt
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </button>
        </div>
        <div class="prog-wrap">
          <div class="prog-fill" [style.width.%]="lat.progressPercent"></div>
        </div>
      </div>
    }

    <div class="sect-label">Pågående sessioner</div>
    <div class="sessions-grid">
      @for (sv of otherSessions(); track sv.session.id) {
        <div class="card elev-sm">
          <div class="card-title" style="font-size: 15px;">{{ sv.planName }}</div>
          <div class="card-sub" [class.completed]="sv.session.status === 'completed'">
            {{ sv.completedCount }} av {{ sv.totalCount }} · ⏱ {{ sv.estimatedMinutes }} min
            @if (sv.session.status === 'completed') { ✓ }
          </div>
          <div class="prog-wrap">
            <div
              class="prog-fill"
              [style.width.%]="sv.progressPercent"
              [style.background]="sv.session.status === 'completed' ? 'var(--color-neutral-500)' : 'var(--color-accent)'"
            ></div>
          </div>
          <div class="card-footer">
            <span class="date-label">{{ sv.dateLabel }} {{ sv.timeLabel }}</span>
            <button type="button" class="btn btn-ghost" (click)="openSession(sv.session.id)">
              {{ sv.session.status === 'completed' ? 'Se igen →' : 'Fortsätt →' }}
            </button>
          </div>
        </div>
      }
      <div class="card-new" style="min-height: 120px;" (click)="startNewSession()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
        <span>Ny session</span>
      </div>
    </div>

    @if (showPlanPicker()) {
      <div class="dialog-backdrop" (click)="showPlanPicker.set(false)">
        <div class="dialog" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
          <div class="dialog-title">Välj övningsplan</div>
          <div class="dialog-body">
            <div class="picker-list">
              @for (plan of plans(); track plan.id) {
                <button type="button" class="btn btn-secondary picker-btn" (click)="createSession(plan)">
                  <span>{{ plan.name }}</span>
                  <span class="picker-count">{{ plan.exerciseIds.length }} övningar</span>
                </button>
              }
              @if (plans().length === 0) {
                <div class="picker-empty">Inga övningsplaner skapade. Gå till Skapa först.</div>
              }
            </div>
          </div>
          <div class="dialog-actions">
            <button type="button" class="btn btn-secondary" (click)="showPlanPicker.set(false)">
              Avbryt
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .latest-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-4);
      flex-wrap: wrap;
    }
    .sessions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: var(--space-4);
    }
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: var(--space-2);
    }
    .date-label {
      font-size: 11px;
      color: var(--color-neutral-500);
    }
    .completed {
      color: var(--success) !important;
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
    .picker-count {
      color: var(--color-neutral-500);
      font-size: 12px;
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
export class PracticeListPage {
  private readonly sessionService = inject(SessionService);
  private readonly planService = inject(PlanService);
  private readonly router = inject(Router);

  showPlanPicker = signal(false);
  plans = signal<PracticePlan[]>(this.planService.getAll());

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
        dateLabel: updatedDate.toLocaleDateString('sv', {day: 'numeric', month: 'short'}),
        timeLabel: updatedDate.toLocaleTimeString('sv', {hour: '2-digit', minute: '2-digit'}),
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
      case 'active': return 'Pågående';
      case 'paused': return 'Pausad ' + new Date(session.updatedAt).toLocaleDateString('sv', { day: 'numeric', month: 'short' });
      case 'completed': return 'Klar';
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
