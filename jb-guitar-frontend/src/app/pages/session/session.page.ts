import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Session, PracticePlan, Exercise } from '../../models';
import { SessionService, PlanService, ExerciseService } from '../../services';

@Component({
  selector: 'jbg-session',
  template: `
    @if (session && plan) {
      <div class="sess-header">
        <span class="sh-title">{{ plan.name }}</span>
        <div class="mini-prog">
          <div class="mini-bar">
            <div class="mini-fill" [style.width.%]="progressPercent"></div>
          </div>
          <span class="mini-text">{{ completedCount }}/{{ totalCount }}</span>
        </div>
      </div>
      <div class="sess-layout">
        <div class="sess-sidebar">
          @for (ex of exercises; track ex.id; let i = $index) {
            <div
              class="sess-item"
              [class.active]="i === session.currentIndex"
              [class.done]="session.completed[i]"
              (click)="goToExercise(i)"
            >
              <div class="n">{{ i + 1 }}</div>
              <div class="nm">{{ ex.name }}</div>
              <div class="src">{{ ex.source }}{{ session.completed[i] ? ' ✓' : '' }}</div>
            </div>
          }
        </div>
        <div class="sess-main">
          @if (currentExercise) {
            <div class="iframe-area">
              @if (embedUrl) {
                <iframe [src]="embedUrl" class="exercise-iframe" allowfullscreen></iframe>
              } @else {
                <div class="iframe-placeholder">
                  <div class="iframe-label">{{ currentExercise.name }}</div>
                  <div class="iframe-url">{{ currentExercise.url }}</div>
                  <a [href]="currentExercise.url" class="btn btn-primary" style="margin-top: 12px;">
                    Öppna i nytt fönster ↗
                  </a>
                </div>
              }
            </div>
            <div class="sess-footer">
              <div class="exercise-info">
                <div class="exercise-name">{{ currentExercise.name }}</div>
                <div class="exercise-pos">Övning {{ session.currentIndex + 1 }} av {{ totalCount }}</div>
              </div>
              <div class="nav-btns">
                <button class="btn btn-ghost" [disabled]="session.currentIndex === 0" (click)="previous()">
                  ← Föregående
                </button>
                <button class="btn btn-primary" (click)="next()">
                  {{ session.currentIndex === totalCount - 1 ? 'Slutför ✓' : 'Nästa →' }}
                </button>
              </div>
              <button class="btn btn-ghost btn-pause" (click)="pauseSession()">⏸ Pausa session</button>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; margin: -20px -16px; }
    .sess-header {
      background: #141414; border-bottom: 1px solid var(--border);
      padding: 7px 16px; display: flex; align-items: center; justify-content: space-between;
    }
    .sh-title { font-size: 12px; font-weight: 600; color: var(--txt); }
    .mini-prog { display: flex; align-items: center; gap: 6px; }
    .mini-bar { width: 70px; height: 5px; background: var(--border); border-radius: 3px; }
    .mini-fill { height: 5px; border-radius: 3px; background: var(--accent); opacity: 0.7; transition: width 0.3s ease; }
    .mini-text { font-size: 10px; color: var(--txt3); }
    .sess-layout { display: flex; flex: 1; min-height: 500px; }
    .sess-sidebar {
      width: 150px; border-right: 1px solid var(--border); overflow-y: auto; flex-shrink: 0;
    }
    .sess-item {
      padding: 9px 10px; border-bottom: 1px solid var(--border); cursor: pointer;
      transition: background 0.15s;
    }
    .sess-item:hover { background: var(--surf); }
    .sess-item .n { font-size: 9px; color: var(--txt3); margin-bottom: 2px; }
    .sess-item .nm { font-size: 11px; color: var(--txt3); }
    .sess-item .src { font-size: 9px; color: var(--txt4); }
    .sess-item.done .nm { color: var(--txt4); text-decoration: line-through; }
    .sess-item.active { background: var(--accent-dim); border-left: 3px solid var(--accent); }
    .sess-item.active .nm { color: var(--txt); font-weight: 600; }
    .sess-item.active .src { color: var(--accent); }
    .sess-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .iframe-area { flex: 1; display: flex; background: #0a0a0a; border-bottom: 1px solid var(--border); }
    .exercise-iframe { width: 100%; height: 100%; border: none; }
    .iframe-placeholder {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 6px;
    }
    .iframe-label { font-size: 12px; color: var(--txt3); }
    .iframe-url { font-size: 9px; color: var(--txt4); }
    .sess-footer { padding: 12px; border-top: 1px solid var(--border); }
    .exercise-info { margin-bottom: 8px; }
    .exercise-name { font-size: 11px; font-weight: 600; color: var(--txt); margin-bottom: 2px; }
    .exercise-pos { font-size: 10px; color: var(--txt3); }
    .nav-btns { display: flex; gap: 8px; margin-bottom: 8px; }
    .nav-btns .btn { flex: 1; }
    .btn-pause { width: 100%; font-size: 10px; }
    .btn:disabled { opacity: 0.3; cursor: not-allowed; }
  `,
})
export class SessionPage implements OnInit {
  session?: Session;
  plan?: PracticePlan;
  exercises: Exercise[] = [];
  currentExercise?: Exercise;
  embedUrl?: SafeResourceUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private sessionService: SessionService,
    private planService: PlanService,
    private exerciseService: ExerciseService,
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadSession(id);
  }

  private loadSession(id: string): void {
    this.session = this.sessionService.getById(id);
    if (!this.session) return;

    if (this.session.status === 'paused') {
      this.sessionService.resume(id);
      this.session = this.sessionService.getById(id);
    }

    this.plan = this.planService.getById(this.session!.planId);
    if (this.plan) {
      this.exercises = this.plan.exerciseIds
        .map((eid) => this.exerciseService.getById(eid))
        .filter((e): e is Exercise => !!e);
    }
    this.updateCurrentExercise();
  }

  private updateCurrentExercise(): void {
    if (!this.session) return;
    this.currentExercise = this.exercises[this.session.currentIndex];
    this.embedUrl = this.currentExercise ? this.getEmbedUrl(this.currentExercise) : undefined;
  }

  private getEmbedUrl(exercise: Exercise): SafeResourceUrl | undefined {
    if (exercise.source === 'youtube') {
      const match = exercise.url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (match) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube.com/embed/${match[1]}`,
        );
      }
    }
    if (exercise.source === 'soundslice') {
      return this.sanitizer.bypassSecurityTrustResourceUrl(exercise.url);
    }
    return undefined;
  }

  get progressPercent(): number {
    if (!this.session) return 0;
    return (this.completedCount / this.totalCount) * 100;
  }

  get completedCount(): number {
    return this.session?.completed.filter(Boolean).length ?? 0;
  }

  get totalCount(): number {
    return this.session?.completed.length ?? 0;
  }

  goToExercise(index: number): void {
    if (!this.session) return;
    this.session.currentIndex = index;
    this.session.updatedAt = new Date().toISOString();
    this.sessionService.getById(this.session.id); // refresh
    // Directly update and persist
    const s = this.session;
    s.currentIndex = index;
    s.updatedAt = new Date().toISOString();
    this.updateCurrentExercise();
  }

  next(): void {
    if (!this.session) return;
    this.session = this.sessionService.next(this.session.id);
    if (this.session?.status === 'completed') {
      this.router.navigate(['/practice']);
    } else {
      this.updateCurrentExercise();
    }
  }

  previous(): void {
    if (!this.session) return;
    this.session = this.sessionService.previous(this.session.id);
    this.updateCurrentExercise();
  }

  pauseSession(): void {
    if (!this.session) return;
    this.sessionService.pause(this.session.id);
    this.router.navigate(['/practice']);
  }
}
