export type SessionStatus = 'active' | 'paused' | 'completed';

export interface ExerciseCompletion {
  exerciseId: string;
  completed: boolean;
}

export interface Session {
    id: string;
    planId: string;
    status: SessionStatus;
  currentExerciseId: string;
  exerciseCompletions: ExerciseCompletion[];
    startedAt: string;
    updatedAt: string;
}
