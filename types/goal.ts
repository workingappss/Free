export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'quantifiable' | 'non-quantifiable';
  // For quantifiable goals
  targetNumber?: number;
  unit?: string;
  currentProgress?: number;
  // For non-quantifiable goals
  contributedHours?: number;
  contributedTasks?: number;
  estimatedProgress?: number; // Percentage estimation (0-100)
  // Common fields
  deadline?: Date;
  timeframe: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  category: string;
  customCategory?: string;
  color: string;
  isCompleted: boolean;
  createdAt: Date;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  taskId: string;
  amount: number;
  unit: string;
  contributedAt: Date;
  taskTitle: string;
}