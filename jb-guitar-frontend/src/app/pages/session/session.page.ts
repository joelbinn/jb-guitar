import {Component, computed, effect, inject, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {BeatStrength, Exercise, MetronomeConfig, PracticePlan, Session} from '../../models';
import {ExerciseService, PlanService, SessionService} from '../../services';

@Component({
  selector: 'jbg-session',
  imports: [FormsModule],
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
                    <a [href]="ex.url"
                       class="btn btn-primary"
                       target="selected-exercise"
                       style="margin-top: 12px;">
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
                <div class="timer-section">
                  <div class="timer-display">{{ timerDisplay() }}</div>
                  <div class="timer-input-row">
                    <input class="timer-input"
                           type="number"
                           min="0"
                           max="59"
                           [value]="timerInputMinutes()"
                           (change)="timerInputMinutes.set(+$event.target!.value)"
                           [disabled]="timerRunning()"/>
                    <span class="timer-label">min</span>
                  </div>
                  <div class="timer-btns">
                    <button class="btn btn-sm" [disabled]="timerRunning()" (click)="startTimer()">
                      Start
                    </button>
                    <button class="btn btn-sm" [disabled]="!timerRunning()" (click)="pauseTimer()">
                      Pausa
                    </button>
                    <button class="btn btn-sm" (click)="resetTimer()">Återställ</button>
                  </div>
                </div>
                <div class="metro-section">
                  <div class="metro-top-row">
                    <span class="metro-label">Metronom</span>
                    <button class="btn btn-sm" (click)="toggleMetronome()">
                      {{ metronomeRunning() ? '⏹ Stoppa' : '▶ Starta' }}
                    </button>
                  </div>
                  <div class="metro-controls-row">
                    <input class="metro-input" type="number" min="20" max="300"
                           [value]="metroBpm()" (change)="setMetroBpm(+$any($event.target).value)"
                           [disabled]="metronomeRunning()"/>
                    <span class="metro-unit">BPM</span>
                    <input class="metro-input metro-sig"
                           type="number"
                           min="1"
                           max="16"
                           [value]="metroNumerator()"
                           (change)="setMetroNumerator(+$any($event.target).value)"
                           [disabled]="metronomeRunning()"/>
                    <span class="metro-sep">/</span>
                    <select class="metro-select" [value]="metroDenominator()"
                            (change)="setMetroDenominator(+$any($event.target).value)"
                            [disabled]="metronomeRunning()">
                      <option value="2">2</option>
                      <option value="4">4</option>
                      <option value="8">8</option>
                    </select>
                  </div>
                  <div class="metro-dots">
                    @for (beat of beatProfile(); track $index; let i = $index) {
                      <div class="metro-dot"
                           [class]="'metro-dot dot-' + beat + (currentBeat() === i ? ' dot-active' : '')"
                           (click)="cycleBeatStrength(i)">
                      </div>
                    }
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
                  <button class="btn btn-danger" (click)="deleteSession()">🗑 Ta bort</button>
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

    .timer-section {
      margin-bottom: 12px;
      padding: 8px;
      background: var(--surf2);
      border-radius: 4px;
      border: 1px solid var(--border);
    }

    .timer-display {
      font-size: 28px;
      font-weight: 700;
      color: var(--accent);
      text-align: center;
      margin-bottom: 8px;
      font-family: monospace;
    }

    .timer-input-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      margin-bottom: 8px;
    }

    .timer-input {
      width: 50px;
      padding: 4px;
      font-size: 11px;
      background: var(--surf);
      border: 1px solid var(--border);
      border-radius: 3px;
      color: var(--txt);
      text-align: center;
    }

    .timer-label {
      font-size: 10px;
      color: var(--txt3);
    }

    .timer-btns {
      display: flex;
      gap: 4px;
    }

    .timer-btns .btn {
      flex: 1;
      font-size: 10px;
      padding: 4px 8px;
    }

    .metro-section {
      margin-bottom: 12px;
      padding: 8px;
      background: var(--surf2);
      border-radius: 4px;
      border: 1px solid var(--border);
    }

    .metro-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .metro-label {
      font-size: 10px;
      color: var(--txt3);
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .metro-controls-row {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 8px;
    }

    .metro-input {
      width: 48px;
      padding: 3px;
      font-size: 11px;
      background: var(--surf);
      border: 1px solid var(--border);
      border-radius: 3px;
      color: var(--txt);
      text-align: center;
    }

    .metro-sig {
      width: 36px;
    }

    .metro-unit {
      font-size: 10px;
      color: var(--txt3);
      margin-right: 4px;
    }

    .metro-sep {
      font-size: 14px;
      color: var(--txt3);
    }

    .metro-select {
      padding: 3px;
      font-size: 11px;
      background: var(--surf);
      border: 1px solid var(--border);
      border-radius: 3px;
      color: var(--txt);
    }

    .metro-dots {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .metro-dot {
      border-radius: 50%;
      cursor: pointer;
      transition: background 0.05s, transform 0.05s;
    }

    .dot-stark {
      width: 18px;
      height: 18px;
      background: var(--accent);
      opacity: 0.6;
    }

    .dot-mellan {
      width: 14px;
      height: 14px;
      background: var(--txt2);
      opacity: 0.5;
      margin-top: 2px;
    }

    .dot-svag {
      width: 10px;
      height: 10px;
      background: var(--txt4);
      opacity: 0.5;
      margin-top: 4px;
    }

    .dot-active {
      opacity: 1 !important;
      transform: scale(1.3);
    }

    .btn-sm {
      font-size: 10px;
      padding: 4px 8px;
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
  currentBeat = signal(-1);   // -1 = inget aktivt slag
  private audioCtx: AudioContext | null = null;
  private nextBeatTime = 0;
  private nextBeatIndex = 0;
  private metronomeTimerId: number | null = null;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadSession(id);

    // Reset timer when input minutes change (but not if paused by user)
    effect(() => {
      const minutes = this.timerInputMinutes();
      if (!this.timerRunning() && !this.timerPausedByUser()) {
        this.timerRemaining.set(minutes * 60);
      }
      // Save timer minutes to current exercise in session
      const s = this.session();
      if (s && s.currentExerciseId) {
        const completion = s.exerciseState.find((c) => c.exerciseId === s.currentExerciseId);
        if (completion && completion.timerMinutes !== minutes) {
          completion.timerMinutes = minutes;
          this.sessionService.save(s);
        }
      }
    });

    // Load timer and start automatically when exercise changes
    effect(() => {
      const exerciseId = this.currentExerciseId();

      // Only run if exercise ID changed and is not empty
      if (exerciseId && exerciseId !== this.previousExerciseId) {
        this.previousExerciseId = exerciseId;

        // Verify exercise exists
        if (this.currentExercise()) {
          // Load timer minutes and metronome config for this exercise
          const s = this.session();
          if (s) {
            const completion = s.exerciseState.find((c) => c.exerciseId === exerciseId);
            if (completion) {
              this.timerInputMinutes.set(completion.timerMinutes);
              // Load metronome config
              const mc = completion.metronomeConfig ?? this.defaultMetronomeConfig();
              this.metroBpm.set(mc.bpm);
              this.metroNumerator.set(mc.numerator);
              this.metroDenominator.set(mc.denominator as 2 | 4 | 8);
              this.beatProfile.set([...mc.beatProfile]);
            }
          }
          // Reset timer to loaded value and clear paused flag
          this.timerRemaining.set(this.timerInputMinutes() * 60);
          this.timerPausedByUser.set(false);
          // Stop metronome when exercise changes
          this.stopMetronome();
          if (this.timerRunning()) {
            // Stop current timer if running
            if (this.timerIntervalId !== null) {
              clearInterval(this.timerIntervalId);
              this.timerIntervalId = null;
            }
            this.timerRunning.set(false);
          }
          // Start new timer for this exercise with a small delay to ensure proper cleanup
          setTimeout(() => this.startTimer(), 50);
        }
      }
    });
  }

  goToExercise(exerciseId: string): void {
    const s = this.session();
    if (!s) return;
    const updated = this.sessionService.setCurrentExerciseId(s.id, exerciseId);
    if (updated) {
      // Create new object to trigger signal update
      this.session.set({...updated});
      // Load the timer value and metronome config for this exercise
      const completion = updated.exerciseState.find((c) => c.exerciseId === exerciseId);
      if (completion) {
        this.timerInputMinutes.set(completion.timerMinutes);
        // Load metronome config
        const mc = completion.metronomeConfig ?? this.defaultMetronomeConfig();
        this.metroBpm.set(mc.bpm);
        this.metroNumerator.set(mc.numerator);
        this.metroDenominator.set(mc.denominator as 2 | 4 | 8);
        this.beatProfile.set([...mc.beatProfile]);
      }
      // Reset and auto-start timer when exercise changes
      this.timerRemaining.set(this.timerInputMinutes() * 60);
      this.timerPausedByUser.set(false);
      // Stop metronome when exercise changes
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
      // Create new object to trigger signal update and re-evaluate computeds
      this.session.set({...updated});
    }
  }

  previous(): void {
    const s = this.session();
    if (!s) return;
    const updated = this.sessionService.previous(s.id);
    if (updated) {
      // Create new object to trigger signal update and re-evaluate computeds
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
      // Create new object to trigger signal update and re-evaluate computeds
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
    // Anpassa beatProfile
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
    const AHEAD = 0.1; // sekunder att schemalägga framåt
    while (this.nextBeatTime < this.audioCtx.currentTime + AHEAD) {
      this.scheduleBeat(this.nextBeatIndex, this.nextBeatTime);
      // Visuell uppdatering vid exakt slagstidpunkt
      const delayMs = (this.nextBeatTime - this.audioCtx.currentTime) * 1000;
      const capturedBeat = this.nextBeatIndex;
      setTimeout(() => this.currentBeat.set(capturedBeat), Math.max(0, delayMs - 5));
      // Räkna ut nästa slags tidpunkt: beatInterval = 60/bpm * (4/denominator)
      this.nextBeatTime += 60 / this.metroBpm() * (4 / this.metroDenominator());
      this.nextBeatIndex = (this.nextBeatIndex + 1) % this.metroNumerator();
    }
  }

  private scheduleBeat(beatIdx: number, when: number): void {
    if (!this.audioCtx) return;
    const strength = this.beatProfile()[beatIdx] ?? 'svag';
    const params: Record<BeatStrength, [number, number, number]> = {
      stark: [1050, 0.05, 0.5],
      mellan: [880, 0.04, 0.35],
      svag: [660, 0.04, 0.2],
    };
    const [freq, dur, vol] = params[strength];
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

    // Set timer minutes from current exercise and start timer for initial exercise
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

      // Create oscillator for bell sound
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.connect(gain);
      gain.connect(audioContext.destination);

      // Bell-like sound with two frequencies
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      // Fallback: silent if Web Audio API not available
      console.log('Timer finished');
    }
  }
}
