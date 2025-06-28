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


export interface TaskCompletionData {
  taskId: string;
  completedAt: Date;
  linkedGoalId?: string;
  goalContribution?: number;
  goalUnit?: string;
}