export type ExerciseSource = 'youtube' | 'jtc' | 'soundslice' | 'other';

export interface Exercise {
    id: string;
    name: string;
    source: ExerciseSource;
    url: string;
    createdAt: string;
}
