export type SessionStatus = 'active' | 'paused' | 'completed';

export interface Session {
    id: string;
    planId: string;
    status: SessionStatus;
    currentIndex: number;
    completed: boolean[];
    startedAt: string;
    updatedAt: string;
}
