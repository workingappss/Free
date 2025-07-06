import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitEntry, HabitStats } from '@/types/habit';

const HABITS_KEY = 'habits';
const HABIT_ENTRIES_KEY = 'habit_entries';

export const habitStorage = {
  // Habits CRUD
  async getHabits(): Promise<Habit[]> {
    try {
      const habitsJson = await AsyncStorage.getItem(HABITS_KEY);
      if (!habitsJson) return [];
      
      const habits = JSON.parse(habitsJson);
      return habits.map((habit: any) => ({
        ...habit,
        createdAt: new Date(habit.createdAt),
        reminderTime: habit.reminderTime ? new Date(habit.reminderTime) : undefined,
      }));
    } catch (error) {
      console.error('Error loading habits:', error);
      return [];
    }
  },

  async saveHabit(habit: Habit): Promise<void> {
    try {
      const habits = await this.getHabits();
      const existingIndex = habits.findIndex(h => h.id === habit.id);
      
      if (existingIndex >= 0) {
        habits[existingIndex] = habit;
      } else {
        habits.push(habit);
      }
      
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    } catch (error) {
      console.error('Error saving habit:', error);
      throw error;
    }
  },

  async deleteHabit(habitId: string): Promise<void> {
    try {
      const habits = await this.getHabits();
      const filteredHabits = habits.filter(h => h.id !== habitId);
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(filteredHabits));
      
      // Also delete all entries for this habit
      const entries = await this.getHabitEntries();
      const filteredEntries = entries.filter(e => e.habitId !== habitId);
      await AsyncStorage.setItem(HABIT_ENTRIES_KEY, JSON.stringify(filteredEntries));
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  },

  // Habit Entries CRUD
  async getHabitEntries(): Promise<HabitEntry[]> {
    try {
      const entriesJson = await AsyncStorage.getItem(HABIT_ENTRIES_KEY);
      if (!entriesJson) return [];
      
      const entries = JSON.parse(entriesJson);
      return entries.map((entry: any) => ({
        ...entry,
        completedAt: entry.completedAt ? new Date(entry.completedAt) : undefined,
      }));
    } catch (error) {
      console.error('Error loading habit entries:', error);
      return [];
    }
  },

  async saveHabitEntry(entry: HabitEntry): Promise<void> {
    try {
      const entries = await this.getHabitEntries();
      const existingIndex = entries.findIndex(
        e => e.habitId === entry.habitId && e.date === entry.date
      );
      
      if (existingIndex >= 0) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
      }
      
      await AsyncStorage.setItem(HABIT_ENTRIES_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving habit entry:', error);
      throw error;
    }
  },

  async getHabitEntriesForDate(date: string): Promise<HabitEntry[]> {
    try {
      const entries = await this.getHabitEntries();
      return entries.filter(entry => entry.date === date);
    } catch (error) {
      console.error('Error loading habit entries for date:', error);
      return [];
    }
  },

  async getHabitEntriesForHabit(habitId: string): Promise<HabitEntry[]> {
    try {
      const entries = await this.getHabitEntries();
      return entries.filter(entry => entry.habitId === habitId);
    } catch (error) {
      console.error('Error loading habit entries for habit:', error);
      return [];
    }
  },

  // Statistics
  async calculateHabitStats(habitId: string): Promise<HabitStats> {
    try {
      const habit = (await this.getHabits()).find(h => h.id === habitId);
      const entries = await this.getHabitEntriesForHabit(habitId);
      const completedEntries = entries.filter(e => e.completed);
      
      // Calculate streaks - enhanced for custom frequency
      const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      let currentStreak = 0;
      let bestStreak = 0;
      
      const today = new Date();
      
      if (habit?.frequency === 'custom' && habit.weeklyTarget) {
        // Calculate streak based on weekly targets
        currentStreak = await this.calculateCustomFrequencyStreak(habit, entries, today);
        bestStreak = await this.calculateBestCustomFrequencyStreak(habit, entries);
      } else {
        // Original daily streak calculation
        const todayStr = this.formatDate(today);
        const yesterdayStr = this.formatDate(new Date(today.getTime() - 24 * 60 * 60 * 1000));
        
        for (let i = 0; i < sortedEntries.length; i++) {
          const entry = sortedEntries[i];
          if (entry.completed) {
            if (i === 0 && (entry.date === todayStr || entry.date === yesterdayStr)) {
              currentStreak++;
            } else if (i > 0) {
              const prevDate = new Date(sortedEntries[i - 1].date);
              const currDate = new Date(entry.date);
              const dayDiff = Math.floor((prevDate.getTime() - currDate.getTime()) / (24 * 60 * 60 * 1000));
              
              if (dayDiff === 1) {
                currentStreak++;
              } else {
                break;
              }
            }
          } else {
            break;
          }
        }
        
        // Calculate best streak for daily habits
        let tempStreak = 0;
        for (const entry of sortedEntries) {
          if (entry.completed) {
            tempStreak++;
            bestStreak = Math.max(bestStreak, tempStreak);
          } else {
            tempStreak = 0;
          }
        }
      }
      
      // Calculate completion rate (last 30 days)
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentEntries = entries.filter(e => new Date(e.date) >= thirtyDaysAgo);
      const completionRate = recentEntries.length > 0 
        ? (recentEntries.filter(e => e.completed).length / recentEntries.length) * 100 
        : 0;
      
      // Calculate averages for measurable habits
      const measurableEntries = completedEntries.filter(e => e.value !== undefined);
      const averageValue = measurableEntries.length > 0
        ? measurableEntries.reduce((sum, e) => sum + (e.value || 0), 0) / measurableEntries.length
        : undefined;
      
      const totalValue = measurableEntries.length > 0
        ? measurableEntries.reduce((sum, e) => sum + (e.value || 0), 0)
        : undefined;
      
      return {
        habitId,
        currentStreak,
        bestStreak,
        totalCompletions: completedEntries.length,
        completionRate: Math.round(completionRate),
        averageValue,
        totalValue,
      };
    } catch (error) {
      console.error('Error calculating habit stats:', error);
      return {
        habitId,
        currentStreak: 0,
        bestStreak: 0,
        totalCompletions: 0,
        completionRate: 0,
      };
    }
  },

  async calculateCustomFrequencyStreak(habit: Habit, entries: HabitEntry[], currentDate: Date): Promise<number> {
    if (!habit.weeklyTarget) return 0;

    let streak = 0;
    let checkDate = new Date(currentDate);
    
    // Go back week by week and check if weekly target was met
    while (true) {
      const weekProgress = await this.getWeeklyProgress(habit, checkDate);
      
      if (weekProgress.completed >= weekProgress.target) {
        streak++;
        // Move to previous week
        checkDate.setDate(checkDate.getDate() - 7);
      } else {
        // Check if current week is still in progress
        const startOfWeek = new Date(checkDate);
        startOfWeek.setDate(checkDate.getDate() - checkDate.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const now = new Date();
        if (startOfWeek <= now && checkDate >= startOfWeek) {
          // Current week in progress, don't break streak yet
          break;
        } else {
          // Past week didn't meet target, break streak
          break;
        }
      }
    }
    
    return streak;
  },

  async calculateBestCustomFrequencyStreak(habit: Habit, entries: HabitEntry[]): Promise<number> {
    if (!habit.weeklyTarget || entries.length === 0) return 0;

    let bestStreak = 0;
    let currentStreak = 0;
    
    // Get all weeks that have entries
    const weeks = new Set<string>();
    entries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const startOfWeek = new Date(entryDate);
      startOfWeek.setDate(entryDate.getDate() - entryDate.getDay());
      weeks.add(this.formatDate(startOfWeek));
    });
    
    const sortedWeeks = Array.from(weeks).sort().reverse();
    
    for (const weekStart of sortedWeeks) {
      const weekDate = new Date(weekStart);
      const weekProgress = await this.getWeeklyProgress(habit, weekDate);
      
      if (weekProgress.completed >= weekProgress.target) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return bestStreak;
  },

  // Utility functions
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  },

  isHabitDueToday(habit: Habit, date: Date = new Date()): boolean {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    switch (habit.frequency) {
      case 'daily':
        return true;
      case 'weekly':
        return dayOfWeek === 1; // Monday
      case 'custom':
        if (!habit.customDays?.includes(dayOfWeek)) {
          return false;
        }
        
        // For custom frequency, check if weekly target is already met
        if (habit.weeklyTarget) {
          return this.shouldShowCustomHabitToday(habit, date);
        }
        
        return true;
      default:
        return false;
    }
  },

  async shouldShowCustomHabitToday(habit: Habit, date: Date = new Date()): Promise<boolean> {
    if (!habit.weeklyTarget || !habit.customDays?.includes(date.getDay())) {
      return false;
    }

    // Get start of current week (Sunday)
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get end of current week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Count completions this week
    const entries = await this.getHabitEntriesForHabit(habit.id);
    const thisWeekCompletions = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entry.completed && 
             entryDate >= startOfWeek && 
             entryDate <= endOfWeek;
    }).length;

    // Show if target not yet reached
    return thisWeekCompletions < habit.weeklyTarget;
  },

  async getWeeklyProgress(habit: Habit, date: Date = new Date()): Promise<{
    completed: number;
    target: number;
    remaining: number;
    percentage: number;
  }> {
    if (habit.frequency !== 'custom' || !habit.weeklyTarget) {
      return { completed: 0, target: 0, remaining: 0, percentage: 0 };
    }

    // Get start of current week (Sunday)
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get end of current week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Count completions this week
    const entries = await this.getHabitEntriesForHabit(habit.id);
    const completed = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entry.completed && 
             entryDate >= startOfWeek && 
             entryDate <= endOfWeek;
    }).length;

    const target = habit.weeklyTarget;
    const remaining = Math.max(0, target - completed);
    const percentage = Math.round((completed / target) * 100);

    return { completed, target, remaining, percentage };
  },
};