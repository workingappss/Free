export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dateKey: string;
  subtasks?: Subtask[];
  startTime?: Date;
  duration?: number;
  isComplex?: boolean;
  order: number;
  
  // Timer functionality
  timerSessions: TimerSession[];
  totalTimeSpent: number; // Total accumulated time in seconds
  isTimerRunning: boolean;
  currentSessionStartTime?: Date;
  
  // Goal linking
  linkedGoalId?: string;
  goalContribution?: number; // Amount to contribute to goal when completed
  goalUnit?: string; // Unit of measurement for goal contribution
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TimerSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // Duration in seconds
  taskId: string;
}

export interface TaskCompletionData {
  taskId: string;
  completedAt: Date;
  totalTimeSpent: number;
  linkedGoalId?: string;
  goalContribution?: number;
  goalUnit?: string;
}