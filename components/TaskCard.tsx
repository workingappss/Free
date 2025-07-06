import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Check, Clock, Target, Trash2, GripVertical } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

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

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onToggleSubtask: (subtaskId: string) => void;
  onDelete: () => void;
  drag: () => void;
  isActive: boolean;
}

export default function TaskCard({
  task,
  onToggle,
  onToggleSubtask,
  onDelete,
  drag,
  isActive,
}: TaskCardProps) {
  const { colors, isDark } = useTheme();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const getTaskProgress = () => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return task.completed ? 1 : 0;
    }
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    return completedSubtasks / task.subtasks.length;
  };

  const progress = getTaskProgress();
  const isComplexTask = task.isComplex && task.subtasks && task.subtasks.length > 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.borderLight,
          opacity: isActive ? 0.9 : 1,
          transform: [{ scale: isActive ? 0.98 : 1 }],
          shadowColor: colors.shadow,
        },
      ]}
    >
      {/* Drag Handle */}
      <Pressable
        onLongPress={drag}
        style={[styles.dragHandle, { backgroundColor: colors.surface }]}
      >
        <GripVertical size={18} color={colors.textTertiary} strokeWidth={2} />
      </Pressable>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              {
                backgroundColor: task.completed ? colors.success : colors.surface,
                borderColor: task.completed ? colors.success : colors.border,
              },
            ]}
            onPress={onToggle}
            activeOpacity={0.7}
          >
            {task.completed && (
              <Check size={16} color="#FFFFFF" strokeWidth={3} />
            )}
          </TouchableOpacity>

          <View style={styles.taskInfo}>
            <Text
              style={[
                styles.title,
                {
                  color: task.completed ? colors.textSecondary : colors.text,
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                },
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>

            {task.description && (
              <Text
                style={[
                  styles.description,
                  { color: colors.textSecondary },
                ]}
                numberOfLines={2}
              >
                {task.description}
              </Text>
            )}

            {/* Time and Duration */}
            {(task.startTime || task.duration) && (
              <View style={styles.timeInfo}>
                {task.startTime && (
                  <View style={styles.timeItem}>
                    <Clock size={14} color={colors.textTertiary} strokeWidth={2} />
                    <Text style={[styles.timeText, { color: colors.textTertiary }]}>
                      {formatTime(task.startTime)}
                    </Text>
                  </View>
                )}
                {task.duration && (
                  <View style={styles.timeItem}>
                    <Target size={14} color={colors.textTertiary} strokeWidth={2} />
                    <Text style={[styles.timeText, { color: colors.textTertiary }]}>
                      {formatDuration(task.duration)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: colors.surface }]}
            onPress={onDelete}
            activeOpacity={0.7}
          >
            <Trash2 size={18} color={colors.error} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Subtasks */}
        {isComplexTask && (
          <View style={styles.subtasksContainer}>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.borderLight }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress * 100}%`,
                      backgroundColor: colors.success,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {Math.round(progress * 100)}%
              </Text>
            </View>

            <View style={styles.subtasksList}>
              {task.subtasks!.map((subtask) => (
                <TouchableOpacity
                  key={subtask.id}
                  style={styles.subtaskItem}
                  onPress={() => onToggleSubtask(subtask.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.subtaskCheckbox,
                      {
                        backgroundColor: subtask.completed ? colors.success : colors.surface,
                        borderColor: subtask.completed ? colors.success : colors.border,
                      },
                    ]}
                  >
                    {subtask.completed && (
                      <Check size={12} color="#FFFFFF" strokeWidth={3} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.subtaskTitle,
                      {
                        color: subtask.completed ? colors.textSecondary : colors.text,
                        textDecorationLine: subtask.completed ? 'line-through' : 'none',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {subtask.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  dragHandle: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  taskInfo: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 24,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    lineHeight: 22,
    marginBottom: 10,
    letterSpacing: 0.1,
  },
  timeInfo: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    letterSpacing: 0.2,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  subtasksContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    minWidth: 36,
    letterSpacing: 0.3,
  },
  subtasksList: {
    gap: 12,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtaskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subtaskTitle: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    flex: 1,
    letterSpacing: 0.1,
  },
});