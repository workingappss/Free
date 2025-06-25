import AsyncStorage from '@react-native-async-storage/async-storage';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dateKey: string;
  subtasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  startTime?: Date;
  duration?: number;
  isComplex?: boolean;
  order: number;
}

const TASKS_KEY = 'tasks';

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

  async getTasksForDate(dateKey: string): Promise<Task[]> {
    try {
      const tasks = await this.getTasks();
      return tasks.filter(task => task.dateKey === dateKey);
    } catch (error) {
      console.error('Error loading tasks for date:', error);
      return [];
    }
  },

  async getCompletedTasksCount(): Promise<number> {
    try {
      const tasks = await this.getTasks();
      return tasks.filter(task => task.completed).length;
    } catch (error) {
      console.error('Error counting completed tasks:', error);
      return 0;
    }
  },

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  },
};