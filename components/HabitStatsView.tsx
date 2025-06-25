import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { 
  Calendar,
  TrendingUp,
  Flame,
  Target,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react-native';
import { Habit, HabitEntry, HabitStats } from '@/types/habit';
import { habitStorage } from '@/utils/habitStorage';

interface HabitStatsViewProps {
  habit: Habit;
}

const { width: screenWidth } = Dimensions.get('window');
const calendarWidth = screenWidth - 40; // Account for padding

export default function HabitStatsView({ habit }: HabitStatsViewProps) {
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [habit.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [habitStats, habitEntries] = await Promise.all([
        habitStorage.calculateHabitStats(habit.id),
        habitStorage.getHabitEntriesForHabit(habit.id)
      ]);
      
      setStats(habitStats);
      setEntries(habitEntries);
    } catch (error) {
      console.error('Error loading habit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const isDateCompleted = (date: Date | null) => {
    if (!date) return false;
    const dateStr = habitStorage.formatDate(date);
    const entry = entries.find(e => e.date === dateStr);
    return entry?.completed || false;
  };

  const getDateValue = (date: Date | null) => {
    if (!date) return undefined;
    const dateStr = habitStorage.formatDate(date);
    const entry = entries.find(e => e.date === dateStr);
    return entry?.value;
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getRecentEntries = () => {
    return entries
      .filter(e => e.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const recentEntries = getRecentEntries();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Overview Stats */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCardCompact, { backgroundColor: habit.color + '10' }]}>
          <View style={[styles.statIcon, { backgroundColor: habit.color + '20' }]}>
            <Flame size={20} color={habit.color} strokeWidth={2} />
          </View>
          <Text style={styles.statValue}>{stats?.currentStreak || 0}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>

        <View style={[styles.statCard, styles.statCardCompact, { backgroundColor: '#F59E0B10' }]}>
          <View style={[styles.statIcon, { backgroundColor: '#F59E0B20' }]}>
            <Award size={20} color="#F59E0B" strokeWidth={2} />
          </View>
          <Text style={styles.statValue}>{stats?.bestStreak || 0}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>

        <View style={[styles.statCard, styles.statCardCompact, { backgroundColor: '#10B98110' }]}>
          <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
            <Target size={20} color="#10B981" strokeWidth={2} />
          </View>
          <Text style={styles.statValue}>{stats?.totalCompletions || 0}</Text>
          <Text style={styles.statLabel}>Total Completions</Text>
        </View>

        <View style={[styles.statCard, styles.statCardCompact, { backgroundColor: '#8B5CF610' }]}>
          <View style={[styles.statIcon, { backgroundColor: '#8B5CF620' }]}>
            <TrendingUp size={20} color="#8B5CF6" strokeWidth={2} />
          </View>
          <Text style={styles.statValue}>{stats?.completionRate || 0}%</Text>
          <Text style={styles.statLabel}>Completion Rate</Text>
        </View>
      </View>

      {/* Measurable Habit Stats */}
      {habit.type === 'measurable' && stats && (stats.averageValue || stats.totalValue) && (
        <View style={styles.measurableStats}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.measurableGrid}>
            {stats.averageValue && (
              <View style={styles.measurableCard}>
                <Text style={styles.measurableValue}>
                  {Math.round(stats.averageValue * 10) / 10}
                </Text>
                <Text style={styles.measurableLabel}>
                  Average {habit.unit} per day
                </Text>
              </View>
            )}
            {stats.totalValue && (
              <View style={styles.measurableCard}>
                <Text style={styles.measurableValue}>
                  {Math.round(stats.totalValue)}
                </Text>
                <Text style={styles.measurableLabel}>
                  Total {habit.unit}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Calendar View */}
      <View style={styles.calendarSection}>
        <Text style={styles.sectionTitle}>Calendar View</Text>
        
        <View style={styles.calendarHeader}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateMonth('prev')}
            activeOpacity={0.7}
          >
            <ChevronLeft size={18} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
          
          <Text style={styles.monthTitle}>{formatMonth(currentMonth)}</Text>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateMonth('next')}
            activeOpacity={0.7}
          >
            <ChevronRight size={18} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Week Days Header */}
        <View style={styles.weekDaysContainer}>
          {weekDays.map((day) => (
            <Text key={day} style={styles.weekDay}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {days.map((date, index) => {
            const isCompleted = isDateCompleted(date);
            const value = getDateValue(date);
            const isTodayDate = isToday(date);
            
            return (
              <View
                key={index}
                style={[
                  styles.dayCell,
                  !date && styles.emptyCell,
                  isCompleted && { backgroundColor: habit.color },
                  isTodayDate && !isCompleted && styles.todayCell,
                ]}
              >
                {date && (
                  <>
                    <Text style={[
                      styles.dayText,
                      isCompleted && styles.completedDayText,
                      isTodayDate && !isCompleted && styles.todayText,
                    ]}>
                      {date.getDate()}
                    </Text>
                    {habit.type === 'measurable' && value && (
                      <Text style={[
                        styles.valueText,
                        isCompleted && styles.completedValueText,
                      ]}>
                        {value}
                      </Text>
                    )}
                  </>
                )}
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: habit.color }]} />
            <Text style={styles.legendText}>Completed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F3F4F6' }]} />
            <Text style={styles.legendText}>Not completed</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      {recentEntries.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentEntries.map((entry) => (
            <View key={entry.id} style={styles.historyItem}>
              <View style={styles.historyDate}>
                <Calendar size={16} color="#6B7280" strokeWidth={2} />
                <Text style={styles.historyDateText}>
                  {formatDate(entry.date)}
                </Text>
              </View>
              <View style={styles.historyDetails}>
                {habit.type === 'measurable' && entry.value && (
                  <Text style={styles.historyValue}>
                    {entry.value} {habit.unit}
                  </Text>
                )}
                {entry.completedAt && (
                  <View style={styles.historyTime}>
                    <Clock size={12} color="#9CA3AF" strokeWidth={2} />
                    <Text style={styles.historyTimeText}>
                      {formatTime(entry.completedAt)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Habit Info */}
      <View style={styles.habitInfo}>
        <Text style={styles.sectionTitle}>Habit Details</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>
              {habit.type === 'boolean' ? 'Yes/No Habit' : 'Measurable Habit'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Frequency</Text>
            <Text style={styles.infoValue}>
              {habit.frequency === 'daily' ? 'Daily' : 
               habit.frequency === 'weekly' ? 'Weekly' : 'Custom'}
            </Text>
          </View>
          {habit.targetValue && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Target</Text>
              <Text style={styles.infoValue}>
                {habit.targetValue} {habit.unit}
              </Text>
            </View>
          )}
          {habit.reminderTime && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Reminder</Text>
              <Text style={styles.infoValue}>
                {formatTime(habit.reminderTime)}
              </Text>
            </View>
          )}
        </View>
        
        {habit.motivationalQuestion && (
          <View style={styles.motivationCard}>
            <Text style={styles.motivationTitle}>Your Motivation</Text>
            <Text style={styles.motivationText}>
              "{habit.motivationalQuestion}"
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 0,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statCardCompact: {
    width: '47%', // Slightly less than 50% to account for gap
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  measurableStats: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  measurableGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  measurableCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  measurableValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  measurableLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  calendarSection: {
    padding: 20,
    paddingTop: 0,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  monthTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    margin: 1,
    backgroundColor: '#F8FAFC',
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  todayCell: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  dayText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  completedDayText: {
    color: '#FFFFFF',
  },
  todayText: {
    color: '#F59E0B',
  },
  valueText: {
    fontSize: 8,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 1,
  },
  completedValueText: {
    color: '#FFFFFF',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  historySection: {
    padding: 20,
    paddingTop: 0,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  historyDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyDateText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  historyDetails: {
    alignItems: 'flex-end',
  },
  historyValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  historyTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyTimeText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  habitInfo: {
    padding: 20,
    paddingTop: 0,
  },
  infoGrid: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  motivationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  motivationTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});