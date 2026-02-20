import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Session, PracticePlan } from '../../models';
import { SessionService, PlanService } from '../../services';

interface SessionView {
    session: Session;
    planName: string;
    completedCount: number;
    totalCount: number;
    progressPercent: number;
    dateLabel: string;
}

@Component({
    selector: 'jbg-practice-list',
    template: `
    @if (latest) {
      <div class="sect-label">Senaste session</div>
      <div class="card card-accent" style="margin-bottom: 20px;">
        <div class="latest-row">
          <div>
            <div class="card-title">{{ latest.planName }}</div>
            <div class="card-sub">{{ latest.completedCount }} av {{ latest.totalCount }} · {{ statusLabel(latest.session) }}</div>
          </div>
          <button class="btn btn-primary" (click)="openSession(latest.session.id)">Fortsätt →</button>
        </div>
        <div class="prog-wrap">
          <div class="prog-fill" [style.width.%]="latest.progressPercent"></div>
        </div>
      </div>
    }

    <div class="sect-label">Pågående sessioner</div>
    <div class="grid-2">
      @for (sv of otherSessions; track sv.session.id) {
        <div class="card">
          <div class="card-title" style="font-size: 12px;">{{ sv.planName }}</div>
          <div class="card-sub" [class.completed]="sv.session.status === 'completed'">
            {{ sv.completedCount }} av {{ sv.totalCount }} · {{ statusLabel(sv.session) }}
            @if (sv.session.status === 'completed') { ✓ }
          </div>
          <div class="prog-wrap">
            <div class="prog-fill"
              [style.width.%]="sv.progressPercent"
              [style.background]="sv.session.status === 'completed' ? 'var(--accent)' : 'var(--txt3)'"
            ></div>
          </div>
          <div class="card-bottom">
            <div class="date-label">{{ sv.dateLabel }}</div>
            <button class="btn btn-ghost btn-sm" (click)="openSession(sv.session.id)">
              {{ sv.session.status === 'completed' ? 'Se igen →' : 'Fortsätt →' }}
            </button>
          </div>
        </div>
      }
      <div class="card-new" style="min-height: 104px;" (click)="startNewSession()">
        <span class="plus">+</span>
        <span>Ny session</span>
      </div>
    </div>

    @if (showPlanPicker) {
      <div class="picker-overlay" (click)="showPlanPicker = false">
        <div class="picker" (click)="$event.stopPropagation()">
          <div class="picker-title">Välj övningsplan</div>
          @for (plan of plans; track plan.id) {
            <button class="picker-item" (click)="createSession(plan)">
              {{ plan.name }}
              <span class="picker-count">{{ plan.exerciseIds.length }} övningar</span>
            </button>
          }
          @if (plans.length === 0) {
            <div class="picker-empty">Inga övningsplaner skapade. Gå till Skapa först.</div>
          }
        </div>
      </div>
    }
  `,
    styles: `
    .latest-row {
      display: flex; justify-content: space-between; align-items: flex-start;
    }
    .card-bottom { margin-top: auto; }
    .date-label { font-size: 9px; color: var(--txt4); margin-bottom: 8px; }
    .btn-sm { font-size: 10px; padding: 4px 10px; }
    .plus { font-size: 20px; color: var(--border2); }
    .completed { color: var(--success) !important; }
    .picker-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6);
      display: flex; align-items: center; justify-content: center; z-index: 100;
    }
    .picker {
      background: var(--surf); border: 1px solid var(--border); border-radius: 10px;
      padding: 20px; width: 340px; max-width: 90vw;
    }
    .picker-title {
      font-weight: 600; font-size: 14px; margin-bottom: 14px; color: var(--txt);
    }
    .picker-item {
      display: flex; justify-content: space-between; align-items: center;
      width: 100%; background: var(--surf2); border: 1px solid var(--border);
      border-radius: 6px; padding: 10px 12px; color: var(--txt); font-size: 12px;
      cursor: pointer; margin-bottom: 6px; font-family: inherit;
      transition: border-color 0.15s;
    }
    .picker-item:hover { border-color: var(--accent); }
    .picker-count { font-size: 10px; color: var(--txt3); }
    .picker-empty { font-size: 11px; color: var(--txt4); font-style: italic; text-align: center; padding: 16px; }
  `,
})
export class PracticeListPage implements OnInit {
    latest?: SessionView;
    otherSessions: SessionView[] = [];
    plans: PracticePlan[] = [];
    showPlanPicker = false;

    constructor(
        private sessionService: SessionService,
        private planService: PlanService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.loadSessions();
        this.plans = this.planService.getAll();
    }

    private loadSessions(): void {
        const sessions = this.sessionService.getAll()
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        const views: SessionView[] = sessions.map((s) => {
            const plan = this.planService.getById(s.planId);
            const completedCount = s.completed.filter(Boolean).length;
            const totalCount = s.completed.length;
            return {
                session: s,
                planName: plan?.name ?? 'Okänd plan',
                completedCount,
                totalCount,
                progressPercent: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
                dateLabel: new Date(s.updatedAt).toLocaleDateString('sv', { day: 'numeric', month: 'short' }),
            };
        });

        const latestActive = views.find((v) => v.session.status !== 'completed');
        if (latestActive) {
            this.latest = latestActive;
            this.otherSessions = views.filter((v) => v !== latestActive);
        } else {
            this.otherSessions = views;
        }
    }

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
        this.showPlanPicker = true;
    }

    createSession(plan: PracticePlan): void {
        const session = this.sessionService.create(plan.id, plan.exerciseIds.length);
        this.showPlanPicker = false;
        this.router.navigate(['/practice', session.id]);
    }
}
