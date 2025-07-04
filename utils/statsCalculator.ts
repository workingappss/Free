import { habitStorage } from './habitStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ProfileStats {
  tasksCompleted: number;
  goalsAchieved: number;
  streakDays: number;
  totalHabits: number;
}

const TASKS_KEY = 'tasks';
const GOALS_KEY = 'goals';

export const statsCalculator = {
  async calculateProfileStats(): Promise<ProfileStats> {
    try {
      const [habits, goals, tasks] = await Promise.all([
        habitStorage.getHabits(),
        this.getGoals(),
        this.getTasks()
      ]);

      // Calculate tasks completed
      const completedTasks = tasks.filter(task => task.completed).length;

      // Calculate goals achieved
      const achievedGoals = goals.filter(goal => goal.isCompleted).length;

      // Calculate total active habits
      const activeHabits = habits.filter(habit => habit.isActive).length;

      // Calculate best streak across all habits
      let bestStreak = 0;
      for (const habit of habits) {
        if (habit.isActive) {
          const stats = await habitStorage.calculateHabitStats(habit.id);
          bestStreak = Math.max(bestStreak, stats.currentStreak);
        }
      }

      return {
        tasksCompleted: completedTasks,
        goalsAchieved: achievedGoals,
        streakDays: bestStreak,
        totalHabits: activeHabits,
      };
    } catch (error) {
      console.error('Error calculating profile stats:', error);
      return {
        tasksCompleted: 0,
        goalsAchieved: 0,
        streakDays: 0,
        totalHabits: 0,
      };
    }
  },

  async getGoals(): Promise<any[]> {
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

  async getTasks(): Promise<any[]> {
    try {
      const tasksJson = await AsyncStorage.getItem(TASKS_KEY);
      if (!tasksJson) return [];
      
      const tasks = JSON.parse(tasksJson);
      return tasks.map((task: any) => ({
        ...task,
        startTime: task.startTime ? new Date(task.startTime) : undefined,
      }));
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  },

  // Helper method to get additional detailed stats
  async getDetailedStats() {
    try {
      const [habits, goals, tasks] = await Promise.all([
        habitStorage.getHabits(),
        this.getGoals(),
        this.getTasks()
      ]);

      // Habit statistics
      const activeHabits = habits.filter(habit => habit.isActive);
      let totalHabitCompletions = 0;
      let totalCurrentStreak = 0;
      let bestOverallStreak = 0;

      for (const habit of activeHabits) {
        const stats = await habitStorage.calculateHabitStats(habit.id);
        totalHabitCompletions += stats.totalCompletions;
        totalCurrentStreak += stats.currentStreak;
        bestOverallStreak = Math.max(bestOverallStreak, stats.bestStreak);
      }

      // Goal statistics
      const completedGoals = goals.filter(goal => goal.isCompleted);
      const goalsByTimeframe = goals.reduce((acc, goal) => {
        acc[goal.timeframe] = (acc[goal.timeframe] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Task statistics
      const completedTasks = tasks.filter(task => task.completed);
      const tasksWithSubtasks = tasks.filter(task => task.subtasks && task.subtasks.length > 0);
      const totalSubtasks = tasksWithSubtasks.reduce((sum, task) => sum + (task.subtasks?.length || 0), 0);
      const completedSubtasks = tasksWithSubtasks.reduce((sum, task) => 
        sum + (task.subtasks?.filter((subtask: any) => subtask.completed).length || 0), 0);

      // Calculate completion rates
      const habitCompletionRate = activeHabits.length > 0 
        ? Math.round((totalHabitCompletions / (activeHabits.length * 30)) * 100) // Assuming 30-day average
        : 0;

      const goalCompletionRate = goals.length > 0 
        ? Math.round((completedGoals.length / goals.length) * 100)
        : 0;

      const taskCompletionRate = tasks.length > 0 
        ? Math.round((completedTasks.length / tasks.length) * 100)
        : 0;

      return {
        habits: {
          total: activeHabits.length,
          totalCompletions: totalHabitCompletions,
          averageStreak: activeHabits.length > 0 ? Math.round(totalCurrentStreak / activeHabits.length) : 0,
          bestStreak: bestOverallStreak,
          completionRate: habitCompletionRate,
        },
        goals: {
          total: goals.length,
          completed: completedGoals.length,
          byTimeframe: goalsByTimeframe,
          completionRate: goalCompletionRate,
        },
        tasks: {
          total: tasks.length,
          completed: completedTasks.length,
          withSubtasks: tasksWithSubtasks.length,
          totalSubtasks,
          completedSubtasks,
          completionRate: taskCompletionRate,
        },
      };
    } catch (error) {
      console.error('Error calculating detailed stats:', error);
      return null;
    }
  },
};