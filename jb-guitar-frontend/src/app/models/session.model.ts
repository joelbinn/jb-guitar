export type SessionStatus = 'active' | 'paused' | 'completed';
export type BeatStrength = 'stark' | 'mellan' | 'svag';

export interface MetronomeConfig {
  bpm: number;
  numerator: number;        // 1–16
  denominator: 2 | 4 | 8;
  beatProfile: BeatStrength[];  // length === numerator
}

export interface ExerciseSessionState {
  exerciseId: string;
  completed: boolean;
  timerMinutes: number;
  metronomeConfig?: MetronomeConfig;
  notes: string;
}

export interface Session {
    id: string;
    planId: string;
    status: SessionStatus;
  currentExerciseId: string;
  exerciseState: ExerciseSessionState[];
    startedAt: string;
    updatedAt: string;
}
