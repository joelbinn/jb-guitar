import {Component, computed, effect, inject, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {BeatStrength, Exercise, MetronomeConfig, PracticePlan, Session} from '../../models';
import {ExerciseService, PlanService, SessionService, StorageService} from '../../services';

@Component({
  selector: 'jbg-session',
  imports: [FormsModule],
  template: `
    @if (session(); as s) {
      @if (plan(); as p) {
        <div class="breadcrumb" (click)="goBack()">
          ← Öva / <span class="crumb-active">{{ p.name }}</span>
        </div>

        <div class="sess-header-bar">
          <span class="sess-title">{{ p.name }}</span>
          <div class="sess-progress-wrap">
            <div class="sess-bar-track">
              <div class="sess-bar-fill" [style.width.%]="progressPercent()"></div>
            </div>
            <span class="sess-count-label">{{ completedCount() }}/{{ totalCount() }}</span>
          </div>
        </div>

        <!-- Mobile exercise chips scroller -->
        <div class="mobile-exercise-chips">
          @for (ex of exercises(); track ex.id; let i = $index) {
            <button
              type="button"
              class="chip"
              [class.active]="ex.id === s.currentExerciseId"
              [class.done]="isExerciseCompleted(s, ex.id)"
              (click)="goToExercise(ex.id)"
            >
              {{ i + 1 }}. {{ ex.name }}
            </button>
          }
        </div>

        <div class="sess-layout">
          <!-- Desktop sidebar -->
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
                <div class="src">{{ sourceLabel(ex.source) }}{{ isExerciseCompleted(s, ex.id) ? ' ✓' : '' }}</div>
              </div>
            }
          </div>

          <div class="sess-main">
            @if (currentExercise(); as ex) {
              @if (ex.description) {
                <div class="description-block">
                  {{ ex.description }}
                </div>
              }

              @if (embedUrl(); as url) {
                <div class="iframe-container">
                  <iframe [src]="url" class="exercise-iframe" allowfullscreen></iframe>
                </div>
              } @else {
                <div class="card current-ex-card">
                  <div class="current-ex-title">{{ ex.name }}</div>
                  <div class="current-ex-url">{{ ex.url }}</div>
                  <div class="link-actions">
                    <a [href]="ex.url" target="_blank" rel="noreferrer" class="btn btn-primary">
                      Öppna i nytt fönster
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/>
                      </svg>
                    </a>
                    <button
                      type="button"
                      class="btn btn-secondary btn-icon"
                      (click)="copyToClipboard(ex.url)"
                      [title]="copied() ? 'Kopierad!' : 'Kopiera länk'"
                      aria-label="Kopiera länk"
                    >
                      @if (copied()) {
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      } @else {
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      }
                    </button>
                  </div>
                </div>
              }

              <div class="tools-grid">
                <!-- Timer Card -->
                <div class="card">
                  <div class="card-kicker">Timer</div>
                  <div class="timer-display">{{ timerDisplay() }}</div>
                  <div class="timer-input-row">
                    <input
                      class="input"
                      type="number"
                      min="0"
                      max="59"
                      style="width: 64px; text-align: center;"
                      [value]="timerInputMinutes()"
                      (change)="timerInputMinutes.set(+$any($event.target).value)"
                      [disabled]="timerRunning()"
                    />
                    <span class="unit-label">min</span>
                  </div>
                  <div class="btn-group">
                    <button type="button" class="btn btn-secondary" style="flex: 1;" [disabled]="timerRunning()" (click)="startTimer()">Start</button>
                    <button type="button" class="btn btn-secondary" style="flex: 1;" [disabled]="!timerRunning()" (click)="pauseTimer()">Pausa</button>
                    <button type="button" class="btn btn-ghost" style="flex: 1;" (click)="resetTimer()">Återställ</button>
                  </div>
                </div>

                <!-- Metronome Card -->
                <div class="card">
                  <div class="metro-header">
                    <div class="card-kicker">Metronom</div>
                    <button type="button" class="btn btn-secondary" (click)="toggleMetronome()">
                      {{ metronomeRunning() ? 'Stoppa' : 'Starta' }}
                    </button>
                  </div>
                  <div class="metro-inputs">
                    <input
                      class="input"
                      type="number"
                      min="20"
                      max="300"
                      style="width: 60px; text-align: center;"
                      [value]="metroBpm()"
                      (change)="setMetroBpm(+$any($event.target).value)"
                      [disabled]="metronomeRunning()"
                    />
                    <span class="unit-label">BPM</span>
                    <input
                      class="input"
                      type="number"
                      min="1"
                      max="16"
                      style="width: 48px; text-align: center;"
                      [value]="metroNumerator()"
                      (change)="setMetroNumerator(+$any($event.target).value)"
                      [disabled]="metronomeRunning()"
                    />
                    <span class="metro-sep">/4</span>
                  </div>
                  <div class="beat-dots">
                    @for (beat of beatProfile(); track $index; let i = $index) {
                      <div
                        class="beat-dot"
                        [class]="'dot-' + beat + (currentBeat() === i ? ' dot-active' : '')"
                        (click)="cycleBeatStrength(i)"
                      ></div>
                    }
                  </div>
                </div>
              </div>

              <div class="nav-controls">
                <button type="button" class="btn btn-secondary" style="flex: 1;" [disabled]="currentExerciseIndex() === 1" (click)="previous()">
                  ← Föregående
                </button>
                <button type="button" class="btn btn-primary" style="flex: 1;" (click)="next()">
                  {{ currentExerciseIndex() === totalCount() ? 'Slutför ✓' : 'Nästa →' }}
                </button>
              </div>

              <div class="session-actions">
                <button type="button" class="btn btn-secondary" style="flex: 1;" (click)="pauseSession()">Pausa session</button>
                <button type="button" class="btn btn-secondary" style="flex: 1;" (click)="restartSession()">Börja om</button>
                <button type="button" class="btn btn-secondary" style="flex: 1;" (click)="deleteSession()">Ta bort</button>
              </div>
            }
          </div>
        </div>
      }
    }
  `,
  styles: `
    .breadcrumb {
      font-size: 11px;
      color: var(--color-neutral-500);
      cursor: pointer;
      margin-bottom: var(--space-4);
    }
    .crumb-active {
      color: var(--color-text);
    }
    .sess-header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      flex-wrap: wrap;
      margin-bottom: var(--space-4);
      padding: var(--space-3) var(--space-4);
      background: var(--color-neutral-100);
      border: 1px solid var(--color-divider);
      border-radius: var(--radius-sm);
    }
    .sess-title {
      font-family: var(--font-heading);
      font-weight: var(--font-heading-weight);
      font-size: 18px;
      color: var(--color-text);
    }
    .sess-progress-wrap {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .sess-bar-track {
      width: 90px;
      height: 6px;
      background: var(--color-neutral-300);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }
    .sess-bar-fill {
      height: 100%;
      background: var(--color-accent);
      transition: width 0.3s ease;
    }
    .sess-count-label {
      font-size: 12px;
      color: var(--color-neutral-600);
    }

    .mobile-exercise-chips {
      display: none;
      gap: var(--space-2);
      overflow-x: auto;
      margin-bottom: var(--space-4);
      padding-bottom: var(--space-1);
    }
    .chip {
      display: inline-flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 999px;
      border: 1px solid var(--color-divider);
      background: #fffdf7;
      font-size: 12px;
      font-family: var(--font-body);
      color: var(--color-text);
      cursor: pointer;
      flex-shrink: 0;
      white-space: nowrap;
    }
    .chip.active {
      background: var(--color-accent-100);
      border-color: var(--color-accent);
      color: var(--color-accent-700);
      font-weight: 600;
    }
    .chip.done {
      background: var(--color-neutral-100);
      color: var(--color-neutral-500);
      text-decoration: line-through;
    }

    .sess-layout {
      display: flex;
      gap: var(--space-6);
      align-items: flex-start;
      flex-wrap: wrap;
    }
    .sess-sidebar {
      width: 220px;
      flex-shrink: 0;
      border: 1px solid var(--color-divider);
      background: #fffdf7;
      border-radius: var(--radius-sm);
      overflow: hidden;
    }
    .sess-item {
      padding: var(--space-2) var(--space-3);
      border-bottom: 1px solid var(--color-divider);
      cursor: pointer;
      transition: background 0.15s;
    }
    .sess-item:last-child {
      border-bottom: none;
    }
    .sess-item:hover {
      background: var(--color-neutral-100);
    }
    .sess-item .n {
      font-size: 10px;
      color: var(--color-neutral-500);
    }
    .sess-item .nm {
      font-size: 13px;
      color: var(--color-text);
    }
    .sess-item .src {
      font-size: 10px;
      color: var(--color-neutral-500);
    }
    .sess-item.done .nm {
      color: var(--color-neutral-500);
      text-decoration: line-through;
    }
    .sess-item.active {
      background: var(--color-accent-100);
      border-left: 3px solid var(--color-accent);
    }
    .sess-item.active .nm {
      color: var(--color-accent-700);
      font-weight: 600;
    }
    .sess-item.active .src {
      color: var(--color-accent-700);
    }

    .sess-main {
      flex: 1;
      min-width: 280px;
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .iframe-container {
      width: 100%;
      height: 380px;
      border: 1px solid var(--color-divider);
      border-radius: var(--radius);
      overflow: hidden;
      background: #000;
    }
    .exercise-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    .current-ex-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      text-align: center;
    }
    .current-ex-title {
      font-family: var(--font-heading);
      font-weight: var(--font-heading-weight);
      font-size: 18px;
      color: var(--color-text);
    }
    .current-ex-url {
      font-size: 11px;
      color: var(--color-neutral-600);
      word-break: break-all;
      max-width: 80%;
    }
    .link-actions {
      display: inline-flex;
      gap: var(--space-2);
      margin-top: var(--space-2);
      width: fit-content;
    }

    .description-block {
      font-size: 13px;
      color: var(--color-neutral-700);
      white-space: pre-wrap;
      line-height: 1.5;
      border-left: 2px solid var(--color-divider);
      padding-left: var(--space-3);
    }

    .tools-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .timer-display {
      font-family: ui-monospace, monospace;
      font-size: 32px;
      text-align: center;
      color: var(--color-accent-700);
      font-weight: 700;
    }
    .timer-input-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
    }
    .unit-label {
      font-size: 12px;
      color: var(--color-neutral-600);
    }
    .btn-group {
      display: flex;
      gap: var(--space-2);
      margin-top: var(--space-2);
    }

    .metro-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .metro-inputs {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .metro-sep {
      font-size: 13px;
      color: var(--color-neutral-500);
    }
    .metro-select {
      width: 48px;
      padding: 6px;
    }

    .beat-dots {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
      align-items: flex-end;
      min-height: 22px;
      margin-top: var(--space-2);
    }
    .beat-dot {
      border-radius: 50%;
      cursor: pointer;
      transition: transform 0.1s, background 0.1s;
    }
    .dot-stark {
      width: 16px;
      height: 16px;
      background: var(--color-accent);
    }
    .dot-mellan {
      width: 12px;
      height: 12px;
      background: var(--color-accent-700);
      margin-bottom: 2px;
    }
    .dot-svag {
      width: 8px;
      height: 8px;
      background: var(--color-neutral-300);
      margin-bottom: 4px;
    }
    .dot-active {
      outline: 2px solid var(--color-accent-700);
      outline-offset: 2px;
    }

    .nav-controls {
      display: flex;
      gap: var(--space-3);
    }
    .session-actions {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    @media (max-width: 640px) {
      .sess-sidebar {
        display: none;
      }
      .mobile-exercise-chips {
        display: flex;
      }
      .tools-grid {
        grid-template-columns: 1fr;
      }
      .sess-layout {
        gap: var(--space-4);
      }
    }
  `,
})
export class SessionPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly sessionService = inject(SessionService);
  private readonly planService = inject(PlanService);
  private readonly exerciseService = inject(ExerciseService);
  protected readonly storage = inject(StorageService);

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
    return s.exerciseState.filter((c) => c.completed).length;
  });

  totalCount = computed(() => {
    const s = this.session();
    return s?.exerciseState.length ?? 0;
  });

  progressPercent = computed(() => {
    const total = this.totalCount();
    return total > 0 ? (this.completedCount() / total) * 100 : 0;
  });

  currentExerciseIndex = computed(() => {
    const s = this.session();
    if (!s) return 0;
    return s.exerciseState.findIndex((c) => c.exerciseId === s.currentExerciseId) + 1;
  });

  currentExerciseId = computed(() => this.session()?.currentExerciseId ?? '');
  copied = signal(false);

  // Timer signals
  timerInputMinutes = signal(5);
  timerRunning = signal(false);
  timerRemaining = signal(5 * 60);
  timerPausedByUser = signal(false);
  timerDisplay = computed(() => {
    const remaining = this.timerRemaining();
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });
  private timerIntervalId: number | null = null;
  private previousExerciseId: string | undefined = undefined;

  // Metronome signals
  metronomeRunning = signal(false);
  metroBpm = signal(100);
  metroNumerator = signal(4);
  metroDenominator = signal<2 | 4 | 8>(4);
  beatProfile = signal<BeatStrength[]>(['stark', 'svag', 'svag', 'svag']);
  currentBeat = signal(-1);
  private audioCtx: AudioContext | null = null;
  private nextBeatTime = 0;
  private nextBeatIndex = 0;
  private metronomeTimerId: number | null = null;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadSession(id);

    effect(() => {
      const minutes = this.timerInputMinutes();
      if (!this.timerRunning() && !this.timerPausedByUser()) {
        this.timerRemaining.set(minutes * 60);
      }
      const s = this.session();
      if (s && s.currentExerciseId) {
        const completion = s.exerciseState.find((c) => c.exerciseId === s.currentExerciseId);
        if (completion && completion.timerMinutes !== minutes) {
          completion.timerMinutes = minutes;
          this.sessionService.save(s);
        }
      }
    });

    effect(() => {
      const exerciseId = this.currentExerciseId();

      if (exerciseId && exerciseId !== this.previousExerciseId) {
        this.previousExerciseId = exerciseId;

        if (this.currentExercise()) {
          const s = this.session();
          if (s) {
            const completion = s.exerciseState.find((c) => c.exerciseId === exerciseId);
            if (completion) {
              this.timerInputMinutes.set(completion.timerMinutes);
              const mc = completion.metronomeConfig ?? this.defaultMetronomeConfig();
              this.metroBpm.set(mc.bpm);
              this.metroNumerator.set(mc.numerator);
              this.metroDenominator.set(mc.denominator as 2 | 4 | 8);
              this.beatProfile.set([...mc.beatProfile]);
            }
          }
          this.timerRemaining.set(this.timerInputMinutes() * 60);
          this.timerPausedByUser.set(false);
          this.stopMetronome();
          if (this.timerRunning()) {
            if (this.timerIntervalId !== null) {
              clearInterval(this.timerIntervalId);
              this.timerIntervalId = null;
            }
            this.timerRunning.set(false);
          }
          setTimeout(() => this.startTimer(), 50);
        }
      }
    });
  }

  sourceLabel(source: string): string {
    const map: Record<string, string> = {
      youtube: 'YouTube',
      jtc: 'JTC Guitar',
      soundslice: 'Soundslice',
      other: 'Annan',
    };
    return map[source] ?? source;
  }

  goToExercise(exerciseId: string): void {
    const s = this.session();
    if (!s) return;
    const updated = this.sessionService.setCurrentExerciseId(s.id, exerciseId);
    if (updated) {
      this.session.set({...updated});
      const completion = updated.exerciseState.find((c) => c.exerciseId === exerciseId);
      if (completion) {
        this.timerInputMinutes.set(completion.timerMinutes);
        const mc = completion.metronomeConfig ?? this.defaultMetronomeConfig();
        this.metroBpm.set(mc.bpm);
        this.metroNumerator.set(mc.numerator);
        this.metroDenominator.set(mc.denominator as 2 | 4 | 8);
        this.beatProfile.set([...mc.beatProfile]);
      }
      this.timerRemaining.set(this.timerInputMinutes() * 60);
      this.timerPausedByUser.set(false);
      this.stopMetronome();
      if (this.timerRunning()) {
        if (this.timerIntervalId !== null) {
          clearInterval(this.timerIntervalId);
          this.timerIntervalId = null;
        }
        this.timerRunning.set(false);
      }
      setTimeout(() => this.startTimer(), 50);
    }
  }

  toggleMetronome(): void {
    this.metronomeRunning() ? this.stopMetronome() : this.startMetronome();
  }

  isExerciseCompleted(session: Session, exerciseId: string): boolean {
    const completion = session.exerciseState.find((c) => c.exerciseId === exerciseId);
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

  startTimer(): void {
    if (this.timerRunning()) return;
    if (this.timerRemaining() === 0) {
      this.timerRemaining.set(this.timerInputMinutes() * 60);
    }
    this.timerRunning.set(true);
    this.timerPausedByUser.set(false);

    this.timerIntervalId = window.setInterval(() => {
      this.timerRemaining.update((val) => {
        if (val <= 1) {
          this.timerRunning.set(false);
          if (this.timerIntervalId !== null) {
            clearInterval(this.timerIntervalId);
            this.timerIntervalId = null;
          }
          this.playTimerSound();
          return 0;
        }
        return val - 1;
      });
    }, 1000);
  }

  next(): void {
    const s = this.session();
    if (!s) return;
    const updated = this.sessionService.next(s.id);
    if (updated?.status === 'completed') {
      this.router.navigate(['/practice']);
    } else if (updated) {
      this.session.set({...updated});
    }
  }

  previous(): void {
    const s = this.session();
    if (!s) return;
    const updated = this.sessionService.previous(s.id);
    if (updated) {
      this.session.set({...updated});
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
      this.session.set({...updated});
    }
  }

  deleteSession(): void {
    const s = this.session();
    if (!s) return;
    if (!confirm('Vill du ta bort denna session? Detta kan inte ångras.')) {
      return;
    }
    this.sessionService.delete(s.id);
    this.router.navigate(['/practice']);
  }

  pauseTimer(): void {
    this.timerRunning.set(false);
    this.timerPausedByUser.set(true);
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  stopTimer(): void {
    this.timerRunning.set(false);
    this.timerPausedByUser.set(false);
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
    this.timerRemaining.set(0);
  }

  resetTimer(): void {
    this.stopTimer();
    this.timerRemaining.set(this.timerInputMinutes() * 60);
  }

  startMetronome(): void {
    if (!this.audioCtx)
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.nextBeatIndex = 0;
    this.nextBeatTime = this.audioCtx.currentTime + 0.05;
    this.metronomeRunning.set(true);
    this.metronomeTimerId = window.setInterval(() => this.scheduleBulk(), 25);
  }

  stopMetronome(): void {
    this.metronomeRunning.set(false);
    if (this.metronomeTimerId !== null) {
      clearInterval(this.metronomeTimerId);
      this.metronomeTimerId = null;
    }
    this.currentBeat.set(-1);
  }

  setMetroBpm(v: number): void {
    this.metroBpm.set(Math.max(20, Math.min(300, v)));
    this.saveMetronomeConfig();
  }

  setMetroNumerator(v: number): void {
    const n = Math.max(1, Math.min(16, v));
    this.metroNumerator.set(n);
    const profile = [...this.beatProfile()];
    while (profile.length < n) profile.push('svag');
    this.beatProfile.set(profile.slice(0, n));
    this.saveMetronomeConfig();
  }

  setMetroDenominator(v: number): void {
    this.metroDenominator.set(v as 2 | 4 | 8);
    this.saveMetronomeConfig();
  }

  cycleBeatStrength(idx: number): void {
    const order: BeatStrength[] = ['stark', 'mellan', 'svag'];
    const profile = [...this.beatProfile()];
    const curr = order.indexOf(profile[idx]);
    profile[idx] = order[(curr + 1) % 3];
    this.beatProfile.set(profile);
    this.saveMetronomeConfig();
  }

  private defaultMetronomeConfig(): MetronomeConfig {
    return {
      bpm: 100,
      numerator: 4,
      denominator: 4,
      beatProfile: ['stark', 'svag', 'svag', 'svag']
    };
  }

  private saveMetronomeConfig(): void {
    const s = this.session();
    if (!s) return;
    const c = s.exerciseState.find(e => e.exerciseId === s.currentExerciseId);
    if (!c) return;
    c.metronomeConfig = {
      bpm: this.metroBpm(),
      numerator: this.metroNumerator(),
      denominator: this.metroDenominator(),
      beatProfile: [...this.beatProfile()],
    };
    this.sessionService.save(s);
  }

  private scheduleBulk(): void {
    if (!this.audioCtx) return;
    const AHEAD = 0.1;
    while (this.nextBeatTime < this.audioCtx.currentTime + AHEAD) {
      this.scheduleBeat(this.nextBeatIndex, this.nextBeatTime);
      const delayMs = (this.nextBeatTime - this.audioCtx.currentTime) * 1000;
      const capturedBeat = this.nextBeatIndex;
      setTimeout(() => this.currentBeat.set(capturedBeat), Math.max(0, delayMs - 5));
      this.nextBeatTime += 60 / this.metroBpm() * (4 / this.metroDenominator());
      this.nextBeatIndex = (this.nextBeatIndex + 1) % this.metroNumerator();
    }
  }

  private scheduleBeat(beatIdx: number, when: number): void {
    if (!this.audioCtx) return;
    const strength = this.beatProfile()[beatIdx] ?? 'svag';
    const params: Record<BeatStrength, [number, number, number]> = {
      stark: [1050, 0.05, 0.8],
      mellan: [880, 0.04, 0.6],
      svag: [660, 0.04, 0.35],
    };
    const [freq, dur, baseVol] = params[strength];
    const volumeMultiplier = this.storage.metronomeVolume() / 100;
    const vol = baseVol * volumeMultiplier;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.frequency.setValueAtTime(freq, when);
    gain.gain.setValueAtTime(vol, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
    osc.start(when);
    osc.stop(when + dur);
  }

  async copyToClipboard(url: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(url);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch (err) {
      console.error('Kunde inte kopiera länk: ', err);
    }
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

    const currentExerciseCompletion = s?.exerciseState.find((c) => c.exerciseId === s?.currentExerciseId);
    const timerMinutes = currentExerciseCompletion?.timerMinutes ?? 5;
    this.timerInputMinutes.set(timerMinutes);

    setTimeout(() => {
      if (this.currentExercise()) {
        this.timerRemaining.set(this.timerInputMinutes() * 60);
        this.timerPausedByUser.set(false);
        this.startTimer();
      }
    }, 100);
  }

  private playTimerSound(): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;

      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.log('Timer finished');
    }
  }
}
