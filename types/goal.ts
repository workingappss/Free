export interface Goal {
  id: string;
  title: string;
  description?: string;
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
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4'; // For quarterly goals
  category: string;
  customCategory?: string;
  color: string;
  isCompleted: boolean;
  createdAt: Date;
}