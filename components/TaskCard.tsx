import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { 
  Check, 
  Clock, 
  Target,
  Trash2
} from 'lucide-react-native';
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
  isActive
}: TaskCardProps) {
  const { colors } = useTheme();

  const completedSubtasks = task.subtasks?.filter(subtask => subtask.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const getTaskProgress = () => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return task.completed ? 100 : 0;
    }
    return Math.round((completedSubtasks / totalSubtasks) * 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const taskProgress = getTaskProgress();

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.borderLight },
        isActive && styles.dragging
      ]}
      onLongPress={drag}
      disabled={isActive}
      activeOpacity={0.8}
    >
      <TouchableOpacity
        style={styles.taskContent}
        onPress={onToggle}
        activeOpacity={0.7}
        disabled={isActive}
      >
        <View style={styles.checkboxContainer}>
          <View style={[
            styles.checkbox,
            { borderColor: colors.borderLight },
            task.completed && { backgroundColor: colors.success, borderColor: colors.success }
          ]}>
            {task.completed && (
              <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
            )}
          </View>
        </View>

        <View style={styles.taskInfo}>
          <Text style={[
            styles.taskTitle,
            { color: colors.text },
            task.completed && { color: colors.textTertiary, textDecorationLine: 'line-through' }
          ]}>
            {task.title}
          </Text>
          
          {task.description && (
            <Text style={[styles.taskDescription, { color: colors.textSecondary }]}>
              {task.description}
            </Text>
          )}

          {/* Task Meta Info */}
          {(task.startTime || task.duration || task.isComplex) && (
            <View style={styles.taskMeta}>
              {task.startTime && (
                <View style={styles.metaItem}>
                  <Clock size={12} color={colors.textTertiary} strokeWidth={2} />
                  <Text style={[styles.metaText, { color: colors.textTertiary }]}>
                    {formatTime(task.startTime)}
                  </Text>
                </View>
              )}
              
              {task.duration && (
                <View style={styles.metaItem}>
                  <Text style={[styles.metaText, { color: colors.textTertiary }]}>
                    {task.duration}min
                  </Text>
                </View>
              )}

              {task.isComplex && (
                <View style={[styles.complexBadge, { backgroundColor: '#8B5CF6' + '20' }]}>
                  <Target size={10} color="#8B5CF6" strokeWidth={2} />
                  <Text style={styles.complexBadgeText}>Complex</Text>
                </View>
              )}
            </View>
          )}

          {/* Subtasks with Progress */}
          {task.subtasks && task.subtasks.length > 0 && (
            <View style={styles.subtasksContainer}>
              <View style={styles.subtasksHeaderContainer}>
                <Text style={[styles.subtasksHeader, { color: colors.textSecondary }]}>
                  Subtasks ({completedSubtasks}/{totalSubtasks})
                </Text>
                <View style={styles.subtaskProgressContainer}>
                  <Text style={[styles.subtaskProgressText, { color: colors.success }]}>
                    {taskProgress}%
                  </Text>
                  <View style={[styles.subtaskProgressBar, { backgroundColor: colors.borderLight }]}>
                    <View 
                      style={[
                        styles.subtaskProgressFill, 
                        { width: `${taskProgress}%`, backgroundColor: colors.success }
                      ]} 
                    />
                  </View>
                </View>
              </View>
              {task.subtasks.map((subtask) => (
                <TouchableOpacity
                  key={subtask.id}
                  style={styles.subtaskItem}
                  onPress={() => onToggleSubtask(subtask.id)}
                  activeOpacity={0.7}
                  disabled={isActive}
                >
                  <View style={[
                    styles.subtaskCheckbox,
                    { borderColor: colors.borderLight },
                    subtask.completed && { backgroundColor: colors.success, borderColor: colors.success }
                  ]}>
                    {subtask.completed && (
                      <Check size={10} color="#FFFFFF" strokeWidth={2.5} />
                    )}
                  </View>
                  <Text style={[
                    styles.subtaskTitle,
                    { color: colors.text },
                    subtask.completed && { color: colors.textTertiary, textDecorationLine: 'line-through' }
                  ]}>
                    {subtask.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={onDelete}
        activeOpacity={0.7}
        disabled={isActive}
      >
        <Trash2 size={16} color="#EF4444" strokeWidth={2} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 8,
  },
  dragging: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1.02 }],
    backgroundColor: '#FEFEFE',
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 2,
  },
  taskDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  complexBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  complexBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#7C3AED',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtasksContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  subtasksHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtasksHeader: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  subtaskProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subtaskProgressText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    minWidth: 28,
  },
  subtaskProgressBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  subtaskProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  subtaskCheckbox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  subtaskTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});