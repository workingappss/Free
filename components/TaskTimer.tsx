import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Play, Pause, Square, Clock } from 'lucide-react-native';
import { Task } from '@/types/task';
import { taskStorage } from '@/utils/taskStorage';
import { useTheme } from '@/contexts/ThemeContext';

interface TaskTimerProps {
  task: Task;
  onTaskUpdate: (updatedTask: Task) => void;
  compact?: boolean;
}

export default function TaskTimer({ task, onTaskUpdate, compact = false }: TaskTimerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(task.isTimerRunning || false);
  const { colors } = useTheme();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && task.currentSessionStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const sessionTime = Math.floor((now.getTime() - task.currentSessionStartTime!.getTime()) / 1000);
        setCurrentTime((task.totalTimeSpent || 0) + sessionTime);
      }, 1000);
    } else {
      setCurrentTime(task.totalTimeSpent || 0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, task.currentSessionStartTime, task.totalTimeSpent]);

  const handleStartTimer = async () => {
    try {
      await taskStorage.startTimer(task.id);
      const updatedTasks = await taskStorage.getTasks();
      const updatedTask = updatedTasks.find(t => t.id === task.id);
      if (updatedTask) {
        onTaskUpdate(updatedTask);
        setIsRunning(true);
      }
    } catch (error) {
      console.error('Error starting timer:', error);
      Alert.alert('Error', 'Failed to start timer');
    }
  };

  const handleStopTimer = async () => {
    try {
      const sessionDuration = await taskStorage.stopTimer(task.id);
      const updatedTasks = await taskStorage.getTasks();
      const updatedTask = updatedTasks.find(t => t.id === task.id);
      if (updatedTask) {
        onTaskUpdate(updatedTask);
        setIsRunning(false);
      }
    } catch (error) {
      console.error('Error stopping timer:', error);
      Alert.alert('Error', 'Failed to stop timer');
    }
  };

  const handleResetTimer = () => {
    Alert.alert(
      'Reset Timer',
      'Are you sure you want to reset the timer? This will clear all recorded time for this task.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isRunning) {
                await taskStorage.stopTimer(task.id);
              }
              
              const updatedTask = {
                ...task,
                totalTimeSpent: 0,
                timerSessions: [],
                isTimerRunning: false,
                currentSessionStartTime: undefined,
              };
              
              await taskStorage.saveTask(updatedTask);
              onTaskUpdate(updatedTask);
              setIsRunning(false);
              setCurrentTime(0);
            } catch (error) {
              console.error('Error resetting timer:', error);
              Alert.alert('Error', 'Failed to reset timer');
            }
          },
        },
      ]
    );
  };

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <View style={styles.compactTimeDisplay}>
          <Clock size={12} color={colors.textSecondary} strokeWidth={2} />
          <Text style={[styles.compactTimeText, { color: colors.textSecondary }]}>
            {taskStorage.formatTime(currentTime)}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.compactTimerButton,
            { backgroundColor: isRunning ? colors.warning : colors.primary }
          ]}
          onPress={isRunning ? handleStopTimer : handleStartTimer}
          activeOpacity={0.8}
        >
          {isRunning ? (
            <Pause size={12} color="#FFFFFF" strokeWidth={2} />
          ) : (
            <Play size={12} color="#FFFFFF" strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
      <View style={styles.header}>
        <View style={styles.timeDisplay}>
          <Clock size={16} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.timeText, { color: colors.text }]}>
            {taskStorage.formatTime(currentTime)}
          </Text>
          {isRunning && (
            <View style={[styles.recordingIndicator, { backgroundColor: colors.error }]} />
          )}
        </View>
        
        {task.totalTimeSpent > 0 && (
          <Text style={[styles.totalTimeText, { color: colors.textSecondary }]}>
            Total: {taskStorage.formatTimeShort(task.totalTimeSpent)}
          </Text>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: isRunning ? colors.warning : colors.primary }
          ]}
          onPress={isRunning ? handleStopTimer : handleStartTimer}
          activeOpacity={0.8}
        >
          {isRunning ? (
            <>
              <Pause size={16} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.primaryButtonText}>Pause</Text>
            </>
          ) : (
            <>
              <Play size={16} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.primaryButtonText}>Start</Text>
            </>
          )}
        </TouchableOpacity>

        {(task.totalTimeSpent > 0 || isRunning) && (
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.borderLight }]}
            onPress={handleResetTimer}
            activeOpacity={0.7}
          >
            <Square size={14} color={colors.textSecondary} strokeWidth={2} />
            <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {task.timerSessions && task.timerSessions.length > 0 && (
        <View style={styles.sessionsInfo}>
          <Text style={[styles.sessionsText, { color: colors.textTertiary }]}>
            {task.timerSessions.length} session{task.timerSessions.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  totalTimeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  primaryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  sessionsInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  sessionsText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
  },
  compactTimeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactTimeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  compactTimerButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});