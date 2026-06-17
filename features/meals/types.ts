export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type MealLog = {
  id: string;
  user_id?: string;
  meal_date: string;
  meal_type: MealType;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

export type MealLogInput = {
  meal_date: string;
  meal_type: MealType;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  notes?: string;
};

export type MealCaloriesSummary = {
  date: string;
  total_calories: number;
  by_meal_type: Partial<Record<MealType, number>>;
};
