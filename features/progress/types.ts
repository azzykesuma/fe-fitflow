export type DashboardSummary = {
  date: string;
  workouts: {
    completed_this_week: number;
    current_streak: number;
    scheduled_today?: {
      id: string;
      name: string;
    };
  };
  body?: {
    latest_weight_kg?: number;
    weight_change_30_days?: number;
  };
};

export type ProgressPoint = {
  date: string;
  value: number;
  label?: string;
};

export type BodyWeightLog = {
  id: string;
  user_id: string;
  weight_kg: number;
  log_date: string;
  created_at?: string;
};

export type CreateBodyWeightInput = {
  weight_kg: number;
  log_date: string;
};

export type BodyMeasurement = {
  id: string;
  user_id?: string;
  date?: string;
  log_date?: string;
  weight_kg: number;
  neck_cm: number;
  shoulder_cm: number;
  chest_cm: number;
  waist_cm: number;
  belly_cm: number;
  hips_cm: number;
  left_bicep_cm: number;
  right_bicep_cm: number;
  left_forearm_cm: number;
  right_forearm_cm: number;
  left_thigh_cm: number;
  right_thigh_cm: number;
  left_calf_cm: number;
  right_calf_cm: number;
  notes: string;
  image_url?: string;
  bmi?: number;
  body_fat_percent?: number;
  body_fat_percentage?: number;
  created_at?: string;
};

export type CreateBodyMeasurementInput = {
  weight_kg: number;
  neck_cm: number;
  shoulder_cm: number;
  chest_cm: number;
  waist_cm: number;
  belly_cm: number;
  hips_cm: number;
  left_bicep_cm: number;
  right_bicep_cm: number;
  left_forearm_cm: number;
  right_forearm_cm: number;
  left_thigh_cm: number;
  right_thigh_cm: number;
  left_calf_cm: number;
  right_calf_cm: number;
  notes: string;
  log_date: string;
  image_url?: string;
};

export type DateRangeQuery = {
  from: string;
  to: string;
};

export type ProgressPhotoPoint = {
  date: string;
  image_url: string;
  weight_kg?: number;
  body_fat_percentage?: number;
};
