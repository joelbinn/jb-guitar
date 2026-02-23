export type SessionStatus = 'active' | 'paused' | 'completed';

export interface ExerciseSessionState {
  exerciseId: string;
  completed: boolean;
  timerMinutes: number;
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
