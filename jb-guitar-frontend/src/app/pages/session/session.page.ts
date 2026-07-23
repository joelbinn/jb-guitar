import { Component, computed, effect, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BeatStrength, Exercise, PracticePlan, Session } from '../../models';
import { ExerciseService, PlanService, SessionService } from '../../services';

@Component({
  selector: 'jbg-session',
  imports: [FormsModule],
  template: `
    @if (session(); as s) {
      @if (plan(); as p) {
        <div class="session-header-back" (click)="goBack()">← Öva</div>
        <div class="session-plan-header">
          <span class="session-plan-name">{{ p.name }}</span>
          <span class="session-progress-text">{{ completedCount() }}/{{ totalCount() }}</span>
        </div>
        <div class="session-progress-bar">
          <div class="session-progress-fill" [style.width.%]="progressPercent()"></div>
        </div>

        <!-- Exercise Chips -->
        <div class="session-chips-scroll">
          @for (ex of exercises(); track ex.id; let i = $index) {
            <div
              class="session-chip"
              [class.active]="ex.id === s.currentExerciseId"
              [class.completed]="isExerciseCompleted(s, ex.id)"
              (click)="goToExercise(ex.id)"
            >
              {{ i + 1 }}. {{ ex.name }}
            </div>
          }
        </div>

        <!-- Current Exercise Card -->
        @if (currentExercise(); as ex) {
          <div class="card" [style.display]="'flex'" [style.flex-direction]="'column'" [style.align-items]="'center'" [style.gap]="'var(--space-2)'" [style.text-align]="'center'" [style.margin-bottom]="'var(--space-4)'">
            <div class="card-title">{{ ex.name }}</div>
            <div [style.font-size]="'11px'" [style.color]="'var(--color-neutral-600)'" [style.word-break]="'break-all'">{{ ex.url }}</div>
            <div [style.display]="'flex'" [style.flex-direction]="'column'" [style.gap]="'var(--space-2)'" [style.width]="'100%'" [style.margin-top]="'var(--space-2)'">
              <a [href]="ex.url" target="_blank" rel="noreferrer" class="btn btn-primary btn-block mob-btn">
                Öppna i nytt fönster
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>
              </a>
              <button type="button" class="btn btn-secondary btn-block mob-btn" (click)="copyLink()">
                @if (copied()) {
                  Kopierad ✓
                } @else {
                  Kopiera länk
                }
              </button>
            </div>
          </div>

          @if (ex.description) {
            <div [style.font-size]="'13px'" [style.color]="'var(--color-neutral-700)'" [style.white-space]="'pre-wrap'" [style.line-height]="'1.5'" [style.border-left]="'2px solid var(--color-divider)'" [style.padding-left]="'var(--space-3)'" [style.margin-bottom]="'var(--space-4)'">{{ ex.description }}</div>
          }

          <!-- Timer -->
          <div class="card" [style.margin-bottom]="'var(--space-4)'">
            <div class="card-kicker">Timer</div>
            <div [style.font-family]="'ui-monospace, monospace'" [style.font-size]="'40px'" [style.text-align]="'center'" [style.color]="'var(--color-accent-700)'">{{ timerDisplay() }}</div>
            <div [style.display]="'flex'" [style.align-items]="'center'" [style.justify-content]="'center'" [style.gap]="'var(--space-2)'" [style.margin-bottom]="'var(--space-2)'">
              <input class="input mob-btn" type="number" min="0" max="59" [style.width]="'72px'" [style.text-align]="'center'" [value]="timerInputMinutes()" (change)="setTimerMinutes($event)" [disabled]="timerRunning()" />
              <span [style.font-size]="'12px'" [style.color]="'var(--color-neutral-600)'">min</span>
            </div>
            <div [style.display]="'flex'" [style.gap]="'var(--space-2)'">
              <button type="button" class="btn btn-secondary mob-btn" [style.flex]="'1'" (click)="startTimer()" [disabled]="timerRunning()">Start</button>
              <button type="button" class="btn btn-secondary mob-btn" [style.flex]="'1'" (click)="pauseTimer()" [disabled]="!timerRunning()">Pausa</button>
              <button type="button" class="btn btn-ghost mob-btn" [style.flex]="'1'" (click)="resetTimer()">Återst.</button>
            </div>
          </div>

          <!-- Metronome -->
          <div class="card" [style.margin-bottom]="'var(--space-4)'">
            <div [style.display]="'flex'" [style.justify-content]="'space-between'" [style.align-items]="'center'" [style.margin-bottom]="'var(--space-2)'">
              <div class="card-kicker">Metronom</div>
              <button type="button" class="btn btn-secondary mob-btn" (click)="toggleMetronome()">{{ metronomeRunning() ? 'Stoppa' : 'Starta' }}</button>
            </div>
            <div [style.display]="'flex'" [style.align-items]="'center'" [style.gap]="'var(--space-2)'" [style.margin-bottom]="'var(--space-3)'">
              <input class="input mob-btn" type="number" min="20" max="300" [style.width]="'64px'" [style.text-align]="'center'" [value]="metroBpm()" (change)="setMetroBpm($event)" [disabled]="metronomeRunning()" />
              <span [style.font-size]="'11px'" [style.color]="'var(--color-neutral-600)'">BPM</span>
              <input class="input mob-btn" type="number" min="1" max="16" [style.width]="'52px'" [style.text-align]="'center'" [value]="metroNumerator()" (change)="setMetroNumerator($event)" [disabled]="metronomeRunning()" />
              <span [style.font-size]="'13px'" [style.color]="'var(--color-neutral-500)'">/4</span>
            </div>
            <div [style.display]="'flex'" [style.gap]="'var(--space-2)'" [style.flex-wrap]="'wrap'" [style.align-items]="'flex-end'" [style.min-height]="'22px'">
              @for (beat of beatProfile(); track $index; let i = $index) {
                <div class="session-beat-dot" [style.width]="getBeatDotSize(beat) + 'px'" [style.height]="getBeatDotSize(beat) + 'px'" [style.border-radius]="'50%'" [style.background]="getBeatDotColor(beat)" [style.cursor]="'pointer'" [style.transform]="currentBeat() === i ? 'scale(1.3)' : 'scale(1)'" [style.transition]="'transform 0.05s'" (click)="cycleBeatStrength(i)"></div>
              }
            </div>
          </div>

          <!-- Navigation -->
          <div [style.display]="'flex'" [style.gap]="'var(--space-2)'" [style.margin-bottom]="'var(--space-2)'">
            <button type="button" class="btn btn-secondary mob-btn" [style.flex]="'1'" (click)="previous()" [disabled]="isFirstExercise()">← Föreg.</button>
            <button type="button" class="btn btn-primary mob-btn" [style.flex]="'1'" (click)="next()">{{ isLastExercise() ? 'Slutför' : 'Nästa →' }}</button>
          </div>

          <!-- Session Controls -->
          <div [style.display]="'flex'" [style.flex-direction]="'column'" [style.gap]="'var(--space-2)'">
            <button type="button" class="btn btn-secondary btn-block mob-btn" (click)="pauseSession()">Pausa session</button>
            <button type="button" class="btn btn-secondary btn-block mob-btn" (click)="restartSession()">Börja om</button>
            <button type="button" class="btn btn-secondary btn-block mob-btn" (click)="deleteSession()">Ta bort</button>
          </div>
        }
      }
    }
  `,
  styles: `
    .session-header-back {
      font-size: 11px;
      color: var(--color-neutral-500);
      cursor: pointer;
      margin-bottom: var(--space-3);
    }

    .session-plan-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
      padding: var(--space-3);
      background: var(--color-neutral-100);
      border: 1px solid var(--color-divider);
    }

    .session-plan-name {
      font-family: var(--font-heading);
      font-weight: var(--font-heading-weight);
      font-size: 16px;
    }

    .session-progress-text {
      font-size: 12px;
      color: var(--color-neutral-600);
      flex-shrink: 0;
    }

    .session-progress-bar {
      background: var(--color-neutral-300);
      border-radius: var(--radius-sm);
      height: 6px;
      margin-bottom: var(--space-4);
    }

    .session-progress-fill {
      display: block;
      height: 100%;
      background: var(--color-accent);
      border-radius: var(--radius-sm);
    }

    .session-chips-scroll {
      display: flex;
      gap: var(--space-2);
      overflow-x: auto;
      margin-bottom: var(--space-4);
      padding-bottom: var(--space-1);
      -webkit-overflow-scrolling: touch;
    }

    .session-chip {
      flex-shrink: 0;
      font-size: 12px;
      padding: 8px 12px;
      border: 1px solid var(--color-divider);
      border-radius: var(--radius-sm);
      color: var(--color-text);
      background: transparent;
      cursor: pointer;
      white-space: nowrap;
      text-decoration: none;
    }

    .session-chip.active {
      border-color: var(--color-accent);
      background: var(--color-accent-100);
      color: var(--color-accent);
    }

    .session-chip.completed {
      text-decoration: line-through;
      color: var(--color-neutral-500);
    }

    .session-beat-dot {
      background: var(--color-neutral-500);
    }

    .card-kicker {
      font-family: var(--font-body);
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-accent-700);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionPage {
  private readonly sessionService = inject(SessionService);
  private readonly planService = inject(PlanService);
  private readonly exerciseService = inject(ExerciseService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  sessionId = signal<string | null>(null);
  session = computed(() => {
    const id = this.sessionId();
    return id ? this.sessionService.getById(id) : undefined;
  });

  plan = computed(() => {
    const s = this.session();
    return s ? this.planService.getById(s.planId) : undefined;
  });

  exercises = computed(() => {
    const p = this.plan();
    if (!p) return [];
    return p.exerciseIds.map(id => this.exerciseService.getById(id)).filter(Boolean) as Exercise[];
  });

  currentExercise = computed(() => {
    const s = this.session();
    if (!s) return undefined;
    return this.exerciseService.getById(s.currentExerciseId);
  });

  completedCount = computed(() => {
    const s = this.session();
    if (!s) return 0;
    return s.exerciseState.filter(c => c.completed).length;
  });

  totalCount = computed(() => this.session()?.exerciseState.length ?? 0);

  progressPercent = computed(() => {
    const total = this.totalCount();
    return total > 0 ? (this.completedCount() / total) * 100 : 0;
  });

  currentExerciseIndex = computed(() => {
    const s = this.session();
    if (!s) return 0;
    const exs = this.exercises();
    return exs.findIndex(e => e.id === s.currentExerciseId) + 1;
  });

  isFirstExercise = computed(() => this.currentExerciseIndex() <= 1);
  isLastExercise = computed(() => this.currentExerciseIndex() >= this.totalCount());

  // Timer
  timerInputMinutes = signal(5);
  timerRemaining = signal(300);
  timerRunning = signal(false);
  private timerInterval: any = null;

  timerDisplay = computed(() => {
    const rem = this.timerRemaining();
    return `${String(Math.floor(rem / 60)).padStart(2, '0')}:${String(rem % 60).padStart(2, '0')}`;
  });

  // Metronome
  metroBpm = signal(100);
  metroNumerator = signal(4);
  beatProfile = signal<BeatStrength[]>(['stark', 'svag', 'svag', 'svag']);
  currentBeat = signal(-1);
  metronomeRunning = signal(false);
  private metroInterval: any = null;
  private audioCtx: AudioContext | null = null;

  copied = signal(false);

  constructor() {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) this.sessionId.set(id);
    });
  }

  isExerciseCompleted(session: Session, exerciseId: string): boolean {
    return session.exerciseState.some(e => e.exerciseId === exerciseId && e.completed);
  }

  goBack(): void {
    this.router.navigate(['/practice']);
  }

  goToExercise(exerciseId: string): void {
    const s = this.session();
    if (!s) return;
    this.stopTimerInterval();
    this.stopMetroInterval();
    this.sessionService.setCurrentExerciseId(s.id, exerciseId);
  }

  next(): void {
    const s = this.session();
    if (!s) return;
    this.stopTimerInterval();
    this.stopMetroInterval();
    const updated = this.sessionService.next(s.id);
    if (!updated || updated.status === 'completed') {
      this.router.navigate(['/practice']);
    }
  }

  previous(): void {
    const s = this.session();
    if (!s || this.isFirstExercise()) return;
    this.stopTimerInterval();
    this.stopMetroInterval();
    this.sessionService.previous(s.id);
  }

  pauseSession(): void {
    const s = this.session();
    if (!s) return;
    this.stopTimerInterval();
    this.stopMetroInterval();
    this.sessionService.pause(s.id);
    this.router.navigate(['/practice']);
  }

  restartSession(): void {
    const s = this.session();
    if (!s) return;
    if (!confirm('Vill du börja om denna session? All progress försvinner.')) return;
    this.stopTimerInterval();
    this.stopMetroInterval();
    this.sessionService.restart(s.id);
  }

  deleteSession(): void {
    const s = this.session();
    if (!s) return;
    if (!confirm('Vill du ta bort denna session? Detta kan inte ångras.')) return;
    this.stopTimerInterval();
    this.stopMetroInterval();
    this.sessionService.delete(s.id);
    this.router.navigate(['/practice']);
  }

  copyLink(): void {
    const ex = this.currentExercise();
    if (ex) {
      navigator.clipboard.writeText(ex.url);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    }
  }

  setTimerMinutes(event: Event): void {
    const value = Math.max(0, Math.min(59, +(event.target as HTMLInputElement).value || 0));
    this.timerInputMinutes.set(value);
    this.timerRemaining.set(value * 60);
  }

  startTimer(): void {
    if (this.timerRunning()) return;
    if (this.timerRemaining() === 0) {
      this.timerRemaining.set(this.timerInputMinutes() * 60);
    }
    this.timerRunning.set(true);
    this.timerInterval = setInterval(() => {
      this.timerRemaining.update(rem => {
        if (rem <= 1) {
          this.stopTimerInterval();
          this.timerRunning.set(false);
          return 0;
        }
        return rem - 1;
      });
    }, 1000);
  }

  pauseTimer(): void {
    this.stopTimerInterval();
    this.timerRunning.set(false);
  }

  resetTimer(): void {
    this.stopTimerInterval();
    this.timerRunning.set(false);
    this.timerRemaining.set(this.timerInputMinutes() * 60);
  }

  private stopTimerInterval(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  setMetroBpm(event: Event): void {
    const value = Math.max(20, Math.min(300, +(event.target as HTMLInputElement).value || 100));
    this.metroBpm.set(value);
  }

  setMetroNumerator(event: Event): void {
    const n = Math.max(1, Math.min(16, +(event.target as HTMLInputElement).value || 4));
    this.metroNumerator.set(n);
    this.beatProfile.update(profile => {
      while (profile.length < n) profile.push('svag');
      return profile.slice(0, n);
    });
  }

  cycleBeatStrength(index: number): void {
    const order: BeatStrength[] = ['stark', 'mellan', 'svag'];
    this.beatProfile.update(profile => {
      const newProfile = [...profile];
      const current = newProfile[index];
      newProfile[index] = order[(order.indexOf(current) + 1) % 3];
      return newProfile;
    });
  }

  getBeatDotSize(beat: BeatStrength): number {
    switch (beat) {
      case 'stark': return 20;
      case 'mellan': return 16;
      case 'svag': return 12;
    }
  }

  getBeatDotColor(beat: BeatStrength): string {
    switch (beat) {
      case 'stark': return 'var(--color-accent)';
      case 'mellan': return 'var(--color-neutral-600)';
      case 'svag': return 'var(--color-neutral-400)';
    }
  }

  toggleMetronome(): void {
    if (this.metronomeRunning()) {
      this.stopMetroInterval();
      this.metronomeRunning.set(false);
      this.currentBeat.set(-1);
      return;
    }

    if (!this.audioCtx) {
      try {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error('Web Audio API not supported');
        return;
      }
    }

    let beat = -1;
    this.metronomeRunning.set(true);

    const tick = () => {
      beat = (beat + 1) % this.metroNumerator();
      this.currentBeat.set(beat);

      if (this.audioCtx) {
        const strength = this.beatProfile()[beat] || 'svag';
        const freq = strength === 'stark' ? 1050 : strength === 'mellan' ? 880 : 660;
        const vol = strength === 'stark' ? 0.5 : strength === 'mellan' ? 0.35 : 0.2;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.05);
      }
    };

    tick();
    this.metroInterval = setInterval(tick, (60000 / this.metroBpm()));
  }

  private stopMetroInterval(): void {
    if (this.metroInterval) {
      clearInterval(this.metroInterval);
      this.metroInterval = null;
    }
  }
}
