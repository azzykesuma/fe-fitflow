export type WorkoutPlan = {
  id: string;
  name: string;
  description?: string;
  scheduled_day?: string;
  exercises?: Exercise[];
  exercise_count?: number;
};

export type CreateWorkoutPlanInput = {
  name: string;
  description?: string;
  scheduled_day: string;
};

export type UpdateWorkoutPlanInput = Partial<CreateWorkoutPlanInput>;

export type Exercise = {
  id: string;
  workout_plan_id: string;
  name: string;
  muscle_group?: string;
  target_sets?: number;
  target_reps?: number;
  target_weight_kg?: number;
  rest_seconds?: number;
  order_index?: number;
};

export type CreateExerciseInput = Omit<Exercise, "id" | "workout_plan_id">;

export type UpdateExerciseInput = Partial<CreateExerciseInput>;

export type WorkoutSession = {
  id: string;
  user_id: string;
  workout_plan_id?: string;
  started_at: string;
  finished_at?: string;
  status: "in_progress" | "finished" | string;
  notes?: string;
};

export type WorkoutSetLog = {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  set_number: number;
  reps: number;
  weight_kg?: number;
  completed: boolean;
};

export type CreateWorkoutSetInput = {
  exercise_id: string;
  set_number: number;
  reps: number;
  weight_kg?: number;
  completed?: boolean;
};

export type FinishWorkoutSessionInput = {
  notes?: string;
};
