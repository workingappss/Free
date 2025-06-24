export interface Habit {
  id: string;
  name: string;
  description?: string;
  type: 'boolean' | 'measurable';
  frequency: 'daily' | 'weekly' | 'custom';
  customDays?: number[]; // 0-6 for Sunday-Saturday
  reminderTime?: Date;
  motivationalQuestion?: string;
  color: string;
  icon: string;
  targetValue?: number; // For measurable habits
  unit?: string; // For measurable habits (e.g., "minutes", "steps")
  isActive: boolean;
  createdAt: Date;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  value?: number; // For measurable habits
  completedAt?: Date;
}

export interface HabitStats {
  habitId: string;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  completionRate: number; // Percentage
  averageValue?: number; // For measurable habits
  totalValue?: number; // For measurable habits
}