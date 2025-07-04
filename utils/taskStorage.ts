import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = 'tasks';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
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
}

export const taskStorage = {
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

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  },

  async getTasksForDate(dateKey: string): Promise<Task[]> {
    try {
      const tasks = await this.getTasks();
      return tasks.filter(task => task.dateKey === dateKey);
    } catch (error) {
      console.error('Error loading tasks for date:', error);
      return [];
    }
  },

  async getCompletedTasks(): Promise<Task[]> {
    try {
      const tasks = await this.getTasks();
      return tasks.filter(task => task.completed);
    } catch (error) {
      console.error('Error loading completed tasks:', error);
      return [];
    }
  },
};