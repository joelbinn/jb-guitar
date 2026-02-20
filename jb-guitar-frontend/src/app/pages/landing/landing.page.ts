import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Session, PracticePlan, Exercise } from '../../models';
import { SessionService, PlanService, ExerciseService } from '../../services';

@Component({
    selector: 'jbg-landing',
    template: `
    <div class="sect-label">Senaste session</div>

    @if (latestSession && plan) {
      <div class="card card-accent-top">
        <div class="card-title">{{ plan.name }}</div>
        <div class="card-sub">Övningsplan · {{ statusLabel }} {{ pausedDate }}</div>
        <div class="prog-wrap">
          <div class="prog-fill" [style.width.%]="progressPercent"></div>
        </div>
        <div class="progress-text">{{ completedCount }} av {{ totalCount }} övningar</div>

        @if (currentExercise) {
          <div class="current-label">Aktuell övning</div>
          <div class="current-name">{{ currentExercise.name }}</div>
          <div class="current-url">{{ currentExercise.url }}</div>
        }

        <div class="btn-row">
          <button class="btn btn-primary" (click)="continueSession()">Fortsätt →</button>
          <button class="btn btn-ghost" (click)="startNew()">Starta ny session</button>
        </div>
      </div>
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
export class LandingPage implements OnInit {
    latestSession?: Session;
    plan?: PracticePlan;
    currentExercise?: Exercise;

    constructor(
        private sessionService: SessionService,
        private planService: PlanService,
        private exerciseService: ExerciseService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.latestSession = this.sessionService.getLatest();
        if (this.latestSession) {
            this.plan = this.planService.getById(this.latestSession.planId);
            if (this.plan) {
                const exId = this.plan.exerciseIds[this.latestSession.currentIndex];
                this.currentExercise = this.exerciseService.getById(exId);
            }
        }
    }

    get progressPercent(): number {
        if (!this.latestSession) return 0;
        return (this.completedCount / this.totalCount) * 100;
    }

    get completedCount(): number {
        return this.latestSession?.completed.filter(Boolean).length ?? 0;
    }

    get totalCount(): number {
        return this.latestSession?.completed.length ?? 0;
    }

    get statusLabel(): string {
        if (!this.latestSession) return '';
        return this.latestSession.status === 'paused' ? 'Pausad' : 'Pågående';
    }

    get pausedDate(): string {
        if (!this.latestSession) return '';
        const d = new Date(this.latestSession.updatedAt);
        return `${d.getDate()} ${d.toLocaleString('sv', { month: 'short' })}`;
    }

    continueSession(): void {
        if (this.latestSession) {
            this.router.navigate(['/practice', this.latestSession.id]);
        }
    }

    startNew(): void {
        this.router.navigate(['/practice']);
    }
}
