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
  const { colors } = useTheme();

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
          opacity: isActive ? 0.8 : 1,
          transform: [{ scale: isActive ? 0.98 : 1 }],
        },
      ]}
    >
      {/* Drag Handle */}
      <Pressable
        onLongPress={drag}
        style={[styles.dragHandle, { backgroundColor: colors.surface }]}
      >
        <GripVertical size={16} color={colors.textTertiary} strokeWidth={2} />
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
              <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
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
                    <Clock size={12} color={colors.textTertiary} strokeWidth={2} />
                    <Text style={[styles.timeText, { color: colors.textTertiary }]}>
                      {formatTime(task.startTime)}
                    </Text>
                  </View>
                )}
                {task.duration && (
                  <View style={styles.timeItem}>
                    <Target size={12} color={colors.textTertiary} strokeWidth={2} />
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
            <Trash2 size={16} color={colors.error} strokeWidth={2} />
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
                      <Check size={10} color="#FFFFFF" strokeWidth={2.5} />
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
  },
  dragHandle: {
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  taskInfo: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  timeInfo: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  subtasksContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    minWidth: 32,
  },
  subtasksList: {
    gap: 8,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtaskCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  subtaskTitle: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
  },
});