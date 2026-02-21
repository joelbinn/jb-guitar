import {Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {Exercise, PracticePlan, Session} from '../../models';
import {ExerciseService, PlanService, SessionService} from '../../services';

@Component({
  selector: 'jbg-session',
  template: `
    @if (session(); as s) {
      @if (plan(); as p) {
        <div class="breadcrumb" (click)="goBack()">← Öva /
          <span class="crumb-active">{{ p.name }}</span></div>
        <div class="sess-header">
          <span class="sh-title">{{ p.name }}</span>
          <div class="mini-prog">
            <div class="mini-bar">
              <div class="mini-fill" [style.width.%]="progressPercent()"></div>
            </div>
            <span class="mini-text">{{ completedCount() }}/{{ totalCount() }}</span>
          </div>
        </div>
        <div class="sess-layout">
          <div class="sess-sidebar">
            @for (ex of exercises(); track ex.id; let i = $index) {
              <div
                class="sess-item"
                [class.active]="ex.id === s.currentExerciseId"
                [class.done]="isExerciseCompleted(s, ex.id)"
                (click)="goToExercise(ex.id)"
              >
                <div class="n">{{ i + 1 }}</div>
                <div class="nm">{{ ex.name }}</div>
                <div class="src">{{ ex.source }}{{
                    isExerciseCompleted(s, ex.id) ? ' ✓' : ''
                  }}
                </div>
              </div>
            }
          </div>
          <div class="sess-main">
            @if (currentExercise(); as ex) {
              <div class="iframe-area">
                @if (embedUrl(); as url) {
                  <iframe [src]="url" class="exercise-iframe" allowfullscreen></iframe>
                } @else {
                  <div class="iframe-placeholder">
                    <div class="iframe-label">{{ ex.name }}</div>
                    <div class="iframe-url">{{ ex.url }}</div>
                  <a [href]="ex.url" class="btn btn-primary" [target]="ex.name" style="margin-top: 12px;">
                      Öppna i nytt fönster ↗
                    </a>
                  </div>
                }
              </div>
              @if (ex.description) {
                <div class="description-area">
                  <div class="description-text">{{ ex.description }}</div>
                </div>
              }
              <div class="sess-footer">
                <div class="exercise-info">
                  <div class="exercise-name">{{ ex.name }}</div>
                  <div class="exercise-pos">Övning {{ currentExerciseIndex() }}
                    av {{ totalCount() }}
                  </div>
                </div>
                <div class="nav-btns">
                  <button class="btn btn-ghost"
                          [disabled]="currentExerciseIndex() === 1"
                          (click)="previous()">
                    ← Föregående
                  </button>
                  <button class="btn btn-primary" (click)="next()">
                    {{ currentExerciseIndex() === totalCount() ? 'Slutför ✓' : 'Nästa →' }}
                  </button>
                </div>
                <div class="btn-row">
                  <button class="btn btn-ghost" (click)="pauseSession()">⏸ Pausa session</button>
                  <button class="btn btn-ghost" (click)="restartSession()">↻ Börja om</button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; position: fixed; top: 48px; left: 0; right: 0; bottom: 0; }

    .breadcrumb {
      font-size: 10px;
      color: var(--txt3);
      padding: 8px 16px;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
    }

    .crumb-active {
      color: var(--txt2);
    }
    .sess-header {
      background: #141414; border-bottom: 1px solid var(--border);
      padding: 7px 16px; display: flex; align-items: center; justify-content: space-between;
    }
    .sh-title { font-size: 12px; font-weight: 600; color: var(--txt); }
    .mini-prog { display: flex; align-items: center; gap: 6px; }
    .mini-bar { width: 70px; height: 5px; background: var(--border); border-radius: 3px; }
    .mini-fill { height: 5px; border-radius: 3px; background: var(--accent); opacity: 0.7; transition: width 0.3s ease; }
    .mini-text { font-size: 10px; color: var(--txt3); }
    .sess-layout { display: flex; flex: 1; min-height: 0; overflow: hidden; }
    .sess-sidebar {
      width: 150px; border-right: 1px solid var(--border); overflow-y: auto; flex-shrink: 0; min-height: 0;
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
    .sess-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
    .iframe-area { flex: 1; display: flex; background: #0a0a0a; border-bottom: 1px solid var(--border); }
    .exercise-iframe { width: 100%; height: 100%; border: none; }

    .description-area {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      background: var(--surf);
      max-height: 120px;
      overflow-y: auto;
    }

    .description-text {
      font-size: 11px;
      color: var(--txt3);
      white-space: pre-wrap;
      line-height: 1.4;
    }
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

    .btn-row {
      display: flex;
      gap: 8px;
    }

    .btn-row .btn {
      flex: 1;
    }
    .btn:disabled { opacity: 0.3; cursor: not-allowed; }
  `,
})
export class SessionPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly sessionService = inject(SessionService);
  private readonly planService = inject(PlanService);
  private readonly exerciseService = inject(ExerciseService);

  session = signal<Session | undefined>(undefined);
  plan = signal<PracticePlan | undefined>(undefined);
  exercises = signal<Exercise[]>([]);

  currentExercise = computed(() => {
    const s = this.session();
    const exs = this.exercises();
    if (!s) return undefined;
    return exs.find((ex) => ex.id === s.currentExerciseId);
  });

  embedUrl = computed<SafeResourceUrl | undefined>(() => {
    const ex = this.currentExercise();
    if (!ex) return undefined;
    return this.getEmbedUrl(ex);
  });

  completedCount = computed(() => {
    const s = this.session();
    if (!s) return 0;
    return s.exerciseCompletions.filter((c) => c.completed).length;
  });

  totalCount = computed(() => {
    const s = this.session();
    return s?.exerciseCompletions.length ?? 0;
  });

  progressPercent = computed(() => {
    const total = this.totalCount();
    return total > 0 ? (this.completedCount() / total) * 100 : 0;
  });

  currentExerciseIndex = computed(() => {
    const s = this.session();
    if (!s) return 0;
    return s.exerciseCompletions.findIndex((c) => c.exerciseId === s.currentExerciseId) + 1;
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadSession(id);
  }

  private loadSession(id: string): void {
    let s = this.sessionService.getById(id);
    if (!s) return;

    if (s.status === 'paused') {
      this.sessionService.resume(id);
      s = this.sessionService.getById(id);
    }

    this.session.set(s);
    const p = s ? this.planService.getById(s.planId) : undefined;
    this.plan.set(p);

    if (p) {
      this.exercises.set(
        p.exerciseIds
          .map((eid) => this.exerciseService.getById(eid))
          .filter((e): e is Exercise => !!e),
      );
    }
  }

  isExerciseCompleted(session: Session, exerciseId: string): boolean {
    const completion = session.exerciseCompletions.find((c) => c.exerciseId === exerciseId);
    return completion?.completed ?? false;
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
    return undefined;
  }

  goToExercise(exerciseId: string): void {
    const s = this.session();
    if (!s) return;
    const updated = this.sessionService.setCurrentExerciseId(s.id, exerciseId);
    if (updated) {
      this.session.set(updated);
    }
  }

  next(): void {
    const s = this.session();
    if (!s) return;
    const updated = this.sessionService.next(s.id);
    if (updated?.status === 'completed') {
      this.router.navigate(['/practice']);
    } else if (updated) {
      this.session.set(updated);
    }
  }

  previous(): void {
    const s = this.session();
    if (!s) return;
    const updated = this.sessionService.previous(s.id);
    if (updated) {
      this.session.set(updated);
    }
  }

  pauseSession(): void {
    const s = this.session();
    if (!s) return;
    this.sessionService.pause(s.id);
    this.router.navigate(['/practice']);
  }

  goBack(): void {
    this.router.navigate(['/practice']);
  }

  restartSession(): void {
    const s = this.session();
    if (!s) return;
    if (!confirm('Vill du börja om denna session? All progress försvinner.')) {
      return;
    }
    const updated = this.sessionService.restart(s.id);
    if (updated) {
      this.session.set(updated);
    }
  }
}
