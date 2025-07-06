import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { Plus, ChevronLeft, ChevronRight, Calendar, CircleCheck as CheckCircle2, Clock, Target, ArrowLeft, X } from 'lucide-react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import TaskCreationModal from '@/components/TaskCreationModal';
import CalendarView from '@/components/CalendarView';
import TaskCard from '@/components/TaskCard';
import { useTheme } from '@/contexts/ThemeContext';
import { taskStorage } from '@/utils/taskStorage';

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

export default function TodayScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showTaskCreation, setShowTaskCreation] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [currentDate]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const allTasks = await taskStorage.getTasks();
      setTasks(allTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async (updatedTasks: Task[]) => {
    try {
      await taskStorage.saveTasks(updatedTasks);
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getCurrentDateTasks = () => {
    const dateKey = getDateKey(currentDate);
    return tasks
      .filter(task => task.dateKey === dateKey)
      .sort((a, b) => a.order - b.order);
  };

  const calculateProgress = () => {
    const currentTasks = getCurrentDateTasks();
    if (currentTasks.length === 0) return { completed: 0, total: 0, percentage: 0 };

    let totalProgress = 0;
    let completedProgress = 0;

    currentTasks.forEach(task => {
      if (task.subtasks && task.subtasks.length > 0) {
        const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
        const taskProgress = completedSubtasks / task.subtasks.length;
        
        totalProgress += 1;
        completedProgress += taskProgress;
      } else {
        totalProgress += 1;
        completedProgress += task.completed ? 1 : 0;
      }
    });

    const percentage = totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0;
    
    return {
      completed: Math.round(completedProgress * 10) / 10,
      total: totalProgress,
      percentage: Math.round(percentage)
    };
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };

  const getNextOrder = () => {
    const currentTasks = getCurrentDateTasks();
    return currentTasks.length > 0 ? Math.max(...currentTasks.map(t => t.order)) + 1 : 0;
  };

  const handleTaskCreated = (taskData: {
    title: string;
    taskType?: 'simple' | 'complex';
    description?: string;
    subtasks?: Subtask[];
    startTime?: Date;
    duration?: number;
    isComplex?: boolean;
  }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description,
      completed: false,
      dateKey: getDateKey(currentDate),
      subtasks: taskData.subtasks,
      startTime: taskData.startTime,
      duration: taskData.duration,
      isComplex: taskData.isComplex || false,
      order: getNextOrder(),
    };

    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);
    setShowTaskCreation(false);
  };

  const handleDateSelect = (selectedDate: Date) => {
    setCurrentDate(selectedDate);
    setShowCalendar(false);
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const newCompleted = !task.completed;
        
        if (task.subtasks && task.subtasks.length > 0) {
          return {
            ...task,
            completed: newCompleted,
            subtasks: task.subtasks.map(subtask => ({
              ...subtask,
              completed: newCompleted
            }))
          };
        }
        
        return { ...task, completed: newCompleted };
      }
      return task;
    });
    
    saveTasks(updatedTasks);
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId && task.subtasks) {
        const updatedSubtasks = task.subtasks.map(subtask =>
          subtask.id === subtaskId
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        );
        
        const allSubtasksCompleted = updatedSubtasks.every(subtask => subtask.completed);
        
        return {
          ...task,
          subtasks: updatedSubtasks,
          completed: allSubtasksCompleted
        };
      }
      return task;
    });
    
    saveTasks(updatedTasks);
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
  };

  const handleDragEnd = ({ data }: { data: Task[] }) => {
    const updatedTasks = data.map((task, index) => ({
      ...task,
      order: index
    }));

    const otherDateTasks = tasks.filter(task => task.dateKey !== getDateKey(currentDate));
    const allUpdatedTasks = [...otherDateTasks, ...updatedTasks];
    saveTasks(allUpdatedTasks);
  };

  const currentDateTasks = getCurrentDateTasks();
  const progress = calculateProgress();

  const renderTaskItem = ({ item, drag, isActive }: RenderItemParams<Task>) => (
    <TaskCard
      task={item}
      onToggle={() => toggleTask(item.id)}
      onToggleSubtask={(subtaskId) => toggleSubtask(item.id, subtaskId)}
      onDelete={() => deleteTask(item.id)}
      drag={drag}
      isActive={isActive}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <View style={styles.dateNavigation}>
            <TouchableOpacity 
              style={[styles.navButton, { backgroundColor: colors.card }]}
              onPress={() => navigateDate('prev')}
              activeOpacity={0.7}
            >
              <ChevronLeft size={18} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dateContainer}
              onPress={() => setShowCalendar(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dateText, { color: colors.text }]}>{formatDate(currentDate)}</Text>
              <Text style={[styles.dateSubtext, { color: colors.textSecondary }]}>
                {currentDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.navButton, { backgroundColor: colors.card }]}
              onPress={() => navigateDate('next')}
              activeOpacity={0.7}
            >
              <ChevronRight size={18} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {!isToday() && (
            <TouchableOpacity 
              style={[styles.todayButton, { backgroundColor: colors.primaryLight, borderColor: colors.primary + '40' }]}
              onPress={goToToday}
              activeOpacity={0.8}
            >
              <ArrowLeft size={14} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.todayButtonText, { color: colors.primary }]}>Back to Today</Text>
            </TouchableOpacity>
          )}

          {progress.total > 0 && (
            <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <View style={styles.progressHeader}>
                <View style={[styles.progressIconContainer, { backgroundColor: colors.success + '20' }]}>
                  <CheckCircle2 size={20} color={colors.success} strokeWidth={2} />
                </View>
                <View style={styles.progressTextContainer}>
                  <Text style={[styles.progressTitle, { color: colors.text }]}>Progress</Text>
                  <Text style={[styles.progressSubtitle, { color: colors.textSecondary }]}>
                    {progress.completed} of {progress.total} completed
                  </Text>
                </View>
                <Text style={[styles.progressPercentage, { color: colors.success }]}>
                  {progress.percentage}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { backgroundColor: colors.borderLight }]}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${progress.percentage}%`, backgroundColor: colors.success }
                    ]} 
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Add Task Buttons */}
        <View style={styles.addSection}>
          <View style={styles.addButtonsContainer}>
            <TouchableOpacity
              style={[styles.quickTaskButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowTaskCreation(true)}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.quickTaskButtonText}>Quick Task</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.complexTaskButton, { backgroundColor: '#8B5CF6' }]}
              onPress={() => setShowTaskCreation(true)}
              activeOpacity={0.8}
            >
              <Target size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.detailedTaskButtonText}>Detailed Task</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tasks List */}
        {currentDateTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.card }]}>
              <Calendar size={32} color={colors.textTertiary} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No tasks yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Add your first task to get started with your day
            </Text>
          </View>
        ) : (
          <DraggableFlatList
            data={currentDateTasks}
            onDragEnd={handleDragEnd}
            keyExtractor={(item) => item.id}
            renderItem={renderTaskItem}
            contentContainerStyle={styles.tasksList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Task Creation Modal */}
      <Modal
        visible={showTaskCreation}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowTaskCreation(false)}
      >
        <TaskCreationModal
          onSave={handleTaskCreated}
          onCancel={() => setShowTaskCreation(false)}
        />
      </Modal>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCalendar(false)}
      >
        <CalendarView
          selectedDate={currentDate}
          onDateSelect={handleDateSelect}
          onClose={() => setShowCalendar(false)}
        />
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dateText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  dateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  todayButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#4F46E5',
    marginLeft: 4,
  },
  progressCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  addSection: {
    marginBottom: 24,
  },
  addButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  quickTaskButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickTaskButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  complexTaskButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailedTaskButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
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
  },
  tasksList: {
    paddingBottom: 100,
  },
});

          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.addButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>

        {/* Tasks List */}
        {currentDateTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.card }]}>
              <Calendar size={32} color={colors.textTertiary} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No tasks yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Add your first task to get started with your day
            </Text>
          </View>
        ) : (
          <DraggableFlatList
            data={currentDateTasks}
            onDragEnd={handleDragEnd}
            keyExtractor={(item) => item.id}
            renderItem={renderTaskItem}
            contentContainerStyle={styles.tasksList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Task Creation Modal */}
      <Modal
        visible={showTaskCreation}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowTaskCreation(false)}
      >
        <TaskCreationModal
          onSave={handleTaskCreated}
          onCancel={() => setShowTaskCreation(false)}
        />
      </Modal>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCalendar(false)}
      >
        <CalendarView
          selectedDate={currentDate}
          onDateSelect={handleDateSelect}
          onClose={() => setShowCalendar(false)}
        />
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dateText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  dateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  todayButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#4F46E5',
    marginLeft: 4,
  },
  progressCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  addSection: {
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
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
  },
  tasksList: {
    paddingBottom: 100,
  },
});