import AsyncStorage from '@react-native-async-storage/async-storage';

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'quantifiable' | 'non-quantifiable';
  targetNumber?: number;
  unit?: string;
  currentProgress?: number;
  contributedHours?: number;
  contributedTasks?: number;
  estimatedProgress?: number;
  deadline?: Date;
  timeframe: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  category: string;
  customCategory?: string;
  color: string;
  isCompleted: boolean;
  createdAt: Date;
}

const GOALS_KEY = 'goals';

export const goalStorage = {
  async getGoals(): Promise<Goal[]> {
    try {
      const goalsJson = await AsyncStorage.getItem(GOALS_KEY);
      if (!goalsJson) return [];
      
      const goals = JSON.parse(goalsJson);
      return goals.map((goal: any) => ({
        ...goal,
        deadline: goal.deadline ? new Date(goal.deadline) : undefined,
        createdAt: new Date(goal.createdAt),
      }));
    } catch (error) {
      console.error('Error loading goals:', error);
      return [];
    }
  },

  async saveGoal(goal: Goal): Promise<void> {
    try {
      const goals = await this.getGoals();
      const existingIndex = goals.findIndex(g => g.id === goal.id);
      
      if (existingIndex >= 0) {
        goals[existingIndex] = goal;
      } else {
        goals.push(goal);
      }
      
      await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error('Error saving goal:', error);
      throw error;
    }
  },

  async deleteGoal(goalId: string): Promise<void> {
    try {
      const goals = await this.getGoals();
      const filteredGoals = goals.filter(g => g.id !== goalId);
      await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(filteredGoals));
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  async getCompletedGoalsCount(): Promise<number> {
    try {
      const goals = await this.getGoals();
      return goals.filter(goal => goal.isCompleted).length;
    } catch (error) {
      console.error('Error counting completed goals:', error);
      return 0;
    }
  },
};