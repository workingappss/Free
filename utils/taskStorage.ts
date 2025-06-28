import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, TaskCompletionData } from '@/types/task';
import { Goal, GoalContribution } from '@/types/goal';

const TASKS_KEY = 'tasks';
const TASK_COMPLETIONS_KEY = 'task_completions';
const GOALS_KEY = 'goals';
const GOAL_CONTRIBUTIONS_KEY = 'goal_contributions';

export const taskStorage = {
  // Tasks CRUD
  async getTasks(): Promise<Task[]> {
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

  async saveTask(task: Task): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const existingIndex = tasks.findIndex(t => t.id === task.id);
      
      if (existingIndex >= 0) {
        tasks[existingIndex] = task;
      } else {
        tasks.push(task);
      }
      
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving task:', error);
      throw error;
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const filteredTasks = tasks.filter(t => t.id !== taskId);
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(filteredTasks));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Goals
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

  // Goal Contributions
  async getGoalContributions(): Promise<GoalContribution[]> {
    try {
      const contributionsJson = await AsyncStorage.getItem(GOAL_CONTRIBUTIONS_KEY);
      if (!contributionsJson) return [];
      
      const contributions = JSON.parse(contributionsJson);
      return contributions.map((contribution: any) => ({
        ...contribution,
        contributedAt: new Date(contribution.contributedAt),
      }));
    } catch (error) {
      console.error('Error loading goal contributions:', error);
      return [];
    }
  },

  async saveGoalContribution(contribution: GoalContribution): Promise<void> {
    try {
      const contributions = await this.getGoalContributions();
      contributions.push(contribution);
      await AsyncStorage.setItem(GOAL_CONTRIBUTIONS_KEY, JSON.stringify(contributions));
    } catch (error) {
      console.error('Error saving goal contribution:', error);
      throw error;
    }
  },

  async getGoalContributionsForGoal(goalId: string): Promise<GoalContribution[]> {
    try {
      const contributions = await this.getGoalContributions();
      return contributions.filter(contribution => contribution.goalId === goalId);
    } catch (error) {
      console.error('Error loading goal contributions for goal:', error);
      return [];
    }
  },

  // Task Completions
  async saveTaskCompletion(completion: TaskCompletionData): Promise<void> {
    try {
      const completions = await this.getTaskCompletions();
      completions.push(completion);
      await AsyncStorage.setItem(TASK_COMPLETIONS_KEY, JSON.stringify(completions));
    } catch (error) {
      console.error('Error saving task completion:', error);
      throw error;
    }
  },

  async getTaskCompletions(): Promise<TaskCompletionData[]> {
    try {
      const completionsJson = await AsyncStorage.getItem(TASK_COMPLETIONS_KEY);
      if (!completionsJson) return [];
      
      const completions = JSON.parse(completionsJson);
      return completions.map((completion: any) => ({
        ...completion,
        completedAt: new Date(completion.completedAt),
      }));
    } catch (error) {
      console.error('Error loading task completions:', error);
      return [];
    }
  },

  async completeTaskWithGoalUpdate(taskId: string): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Mark task as completed
      task.completed = true;

      // Save task completion data
      const completionData: TaskCompletionData = {
        taskId: task.id,
        completedAt: new Date(),
        linkedGoalId: task.linkedGoalId,
        goalContribution: task.goalContribution,
        goalUnit: task.goalUnit,
      };

      await this.saveTaskCompletion(completionData);

      // Update linked goal if exists
      if (task.linkedGoalId && task.goalContribution) {
        await this.updateGoalProgress(task.linkedGoalId, task.goalContribution, task.goalUnit || '', task);
      }

      await this.saveTask(task);
    } catch (error) {
      console.error('Error completing task with goal update:', error);
      throw error;
    }
  },

  async updateGoalProgress(goalId: string, contribution: number, unit: string, task: Task): Promise<void> {
    try {
      const goals = await this.getGoals();
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      // Update goal progress
      if (goal.type === 'quantifiable' && goal.unit === unit) {
        goal.currentProgress = (goal.currentProgress || 0) + contribution;
        
        // Check if goal is completed
        if (goal.targetNumber && goal.currentProgress >= goal.targetNumber) {
          goal.isCompleted = true;
        }
      } else if (goal.type === 'non-quantifiable') {
        // For non-quantifiable goals, increment task count and hours
        goal.contributedTasks = (goal.contributedTasks || 0) + 1;
      }

      await this.saveGoal(goal);

      // Save goal contribution record
      const contributionRecord: GoalContribution = {
        id: Date.now().toString(),
        goalId,
        taskId: task.id,
        amount: contribution,
        unit,
        contributedAt: new Date(),
        taskTitle: task.title,
      };

      await this.saveGoalContribution(contributionRecord);
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  },
};