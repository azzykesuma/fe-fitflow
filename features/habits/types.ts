export type Habit = {
  id: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly";
  current_streak?: number;
  completed_today?: boolean;
};

export type CreateHabitInput = {
  name: string;
  description?: string;
  frequency: "daily" | "weekly";
};

export type UpdateHabitInput = Partial<CreateHabitInput> & {
  target_count?: number;
  is_active?: boolean;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string;
  completed_count: number;
  is_completed: boolean;
  created_at?: string;
};

export type HabitLogsQuery = {
  from: string;
  to: string;
};
