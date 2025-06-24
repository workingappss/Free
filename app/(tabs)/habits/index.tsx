import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  RefreshControl,
} from 'react-native';
import { Plus, Target, TrendingUp, SquareCheck as CheckSquare, Flame } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { Habit, HabitEntry, HabitStats } from '@/types/habit';
import { habitStorage } from '@/utils/habitStorage';
import HabitCard from '@/components/HabitCard';

export default function HabitsScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayEntries, setTodayEntries] = useState<HabitEntry[]>([]);
  const [habitStats, setHabitStats] = useState<Record<string, HabitStats>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date();
  const todayStr = habitStorage.formatDate(today);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [allHabits, entries] = await Promise.all([
        habitStorage.getHabits(),
        habitStorage.getHabitEntriesForDate(todayStr)
      ]);

      const activeHabits = allHabits.filter(h => h.isActive);
      setHabits(activeHabits);
      setTodayEntries(entries);

      // Load stats for each habit
      const stats: Record<string, HabitStats> = {};
      for (const habit of activeHabits) {
        stats[habit.id] = await habitStorage.calculateHabitStats(habit.id);
      }
      setHabitStats(stats);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getTodaysHabits = () => {
    return habits.filter(habit => habitStorage.isHabitDueToday(habit, today));
  };

  const handleHabitToggle = async (habitId: string, completed: boolean, value?: number) => {
    try {
      const existingEntry = todayEntries.find(e => e.habitId === habitId);
      
      const entry: HabitEntry = {
        id: existingEntry?.id || Date.now().toString(),
        habitId,
        date: todayStr,
        completed,
        value,
        completedAt: completed ? new Date() : undefined,
      };

      await habitStorage.saveHabitEntry(entry);
      
      // Update local state
      if (existingEntry) {
        setTodayEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
      } else {
        setTodayEntries(prev => [...prev, entry]);
      }

      // Refresh stats for this habit
      const updatedStats = await habitStorage.calculateHabitStats(habitId);
      setHabitStats(prev => ({ ...prev, [habitId]: updatedStats }));
    } catch (error) {
      console.error('Error updating habit entry:', error);
    }
  };

  const handleHabitPress = (habitId: string) => {
    router.push(`/habits/${habitId}`);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const getProgressSummary = () => {
    const todaysHabits = getTodaysHabits();
    const completedCount = todaysHabits.filter(habit => {
      const entry = todayEntries.find(e => e.habitId === habit.id);
      return entry?.completed;
    }).length;

    return {
      completed: completedCount,
      total: todaysHabits.length,
      percentage: todaysHabits.length > 0 ? Math.round((completedCount / todaysHabits.length) * 100) : 0
    };
  };

  const getTotalActiveStreaks = () => {
    return Object.values(habitStats).reduce((sum, stats) => sum + stats.currentStreak, 0);
  };

  const todaysHabits = getTodaysHabits();
  const progress = getProgressSummary();
  const totalStreaks = getTotalActiveStreaks();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Habits</Text>
              <Text style={styles.headerSubtitle}>{formatDate(today)}</Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => router.push('/habits/create')}
              activeOpacity={0.8}
            >
              <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Progress Summary */}
          {progress.total > 0 && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View style={styles.progressIconContainer}>
                  <CheckSquare size={20} color="#10B981" strokeWidth={2} />
                </View>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressTitle}>Today's Progress</Text>
                  <Text style={styles.progressSubtitle}>
                    {progress.completed} of {progress.total} completed
                  </Text>
                </View>
                <Text style={styles.progressPercentage}>
                  {progress.percentage}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${progress.percentage}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>
          )}

          {/* Quick Stats */}
          {habits.length > 0 && (
            <View style={styles.quickStats}>
              <View style={styles.quickStatItem}>
                <View style={styles.quickStatIcon}>
                  <Target size={16} color="#6366F1" strokeWidth={2} />
                </View>
                <Text style={styles.quickStatValue}>{habits.length}</Text>
                <Text style={styles.quickStatLabel}>Active Habits</Text>
              </View>
              
              <View style={styles.quickStatItem}>
                <View style={styles.quickStatIcon}>
                  <Flame size={16} color="#F59E0B" strokeWidth={2} />
                </View>
                <Text style={styles.quickStatValue}>{totalStreaks}</Text>
                <Text style={styles.quickStatLabel}>Total Streaks</Text>
              </View>
              
              <View style={styles.quickStatItem}>
                <View style={styles.quickStatIcon}>
                  <TrendingUp size={16} color="#10B981" strokeWidth={2} />
                </View>
                <Text style={styles.quickStatValue}>
                  {Object.values(habitStats).reduce((sum, stats) => sum + stats.totalCompletions, 0)}
                </Text>
                <Text style={styles.quickStatLabel}>Completions</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading habits...</Text>
          </View>
        ) : todaysHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <CheckSquare size={32} color="#9CA3AF" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>
              {habits.length === 0 ? 'No habits yet' : 'No habits due today'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {habits.length === 0 
                ? 'Create your first habit to start building better routines'
                : 'All your habits are scheduled for other days'
              }
            </Text>
            <TouchableOpacity 
              style={styles.emptyActionButton}
              onPress={() => router.push('/habits/create')}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.emptyActionButtonText}>Create Habit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.habitsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Habits</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{todaysHabits.length}</Text>
              </View>
            </View>

            {todaysHabits.map((habit) => {
              const entry = todayEntries.find(e => e.habitId === habit.id);
              const stats = habitStats[habit.id];
              
              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  entry={entry}
                  onToggle={(completed, value) => handleHabitToggle(habit.id, completed, value)}
                  onPress={() => handleHabitPress(habit.id)}
                  streak={stats?.currentStreak}
                />
              );
            })}
          </View>
        )}

        {/* All Habits Section */}
        {habits.length > todaysHabits.length && (
          <View style={styles.allHabitsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Habits</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{habits.length}</Text>
              </View>
            </View>

            {habits.filter(h => !habitStorage.isHabitDueToday(h, today)).map((habit) => {
              const stats = habitStats[habit.id];
              
              return (
                <TouchableOpacity
                  key={habit.id}
                  style={styles.inactiveHabitCard}
                  onPress={() => handleHabitPress(habit.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.inactiveHabitHeader}>
                    <View style={styles.inactiveHabitInfo}>
                      <View style={[styles.inactiveHabitIcon, { backgroundColor: habit.color + '20' }]}>
                        <Text style={[styles.inactiveHabitIconText, { color: habit.color }]}>
                          {habit.icon}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.inactiveHabitName}>{habit.name}</Text>
                        <Text style={styles.inactiveHabitFrequency}>
                          {habit.frequency === 'daily' ? 'Daily' : 
                           habit.frequency === 'weekly' ? 'Weekly' : 'Custom'}
                        </Text>
                      </View>
                    </View>
                    {stats && stats.currentStreak > 0 && (
                      <View style={styles.inactiveHabitStreak}>
                        <Flame size={14} color="#F59E0B" strokeWidth={2} />
                        <Text style={styles.inactiveHabitStreakText}>
                          {stats.currentStreak}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  progressTextContainer: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  progressSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  progressPercentage: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
  },
  progressBarContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
  },
  quickStatItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickStatIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickStatValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyActionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  habitsContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  sectionBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  allHabitsContainer: {
    marginBottom: 24,
  },
  inactiveHabitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    opacity: 0.7,
  },
  inactiveHabitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inactiveHabitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inactiveHabitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inactiveHabitIconText: {
    fontSize: 14,
  },
  inactiveHabitName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 2,
  },
  inactiveHabitFrequency: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  inactiveHabitStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inactiveHabitStreakText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
  },
});