export type StreakType = 'quit_bad_habit' | 'maintain_good_habit';

export interface StreakHistory {
    date: string;
    reason?: string;
}

export interface Streak {
    id: string;
    user_id: string;
    title: string;
    type: StreakType;
    start_date: string;
    last_relapse_date: string;
    longest_streak_seconds: number;
    reset_history: StreakHistory[]; // JSONB do banco vem como array
    active: boolean;
    created_at: string;
}
