import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal } from '@/types/goal';

const GOALS_KEY = 'goals';

export const goalStorage = {
  async getGoals(): Promise<Goal[]> {
    try {
      const goalsJson = await AsyncStorage.getItem(GOALS_KEY);
      if (!goalsJson) return [];
      
      const goals = JSON.parse(goalsJson);
      return goals.map((goal: any) => ({
        ...goal,
        createdAt: new Date(goal.createdAt),
        deadline: goal.deadline ? new Date(goal.deadline) : undefined,
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
};