import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { Plus, Check, Trash2, ChevronLeft, ChevronRight, Calendar, CircleCheck as CheckCircle2, Clock, Target, ArrowLeft, X } from 'lucide-react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import ComplexTaskForm from '@/components/ComplexTaskForm';
import CalendarView from '@/components/CalendarView';
import SimpleTaskInput from '@/components/SimpleTaskInput';
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
  order: number; // Add order field for consistent sorting
}

// Define modal states as an enum for better type safety
type ModalState = 'none' | 'simple' | 'complex' | 'calendar';

export default function TodayScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  
  // Use a single state to manage which modal is open
  const [modalState, setModalState] = useState<ModalState>('none');

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
      .sort((a, b) => a.order - b.order); // Sort by order for consistent display
  };

  // Enhanced progress calculation that includes subtasks
  const calculateProgress = () => {
    const currentTasks = getCurrentDateTasks();
    if (currentTasks.length === 0) return { completed: 0, total: 0, percentage: 0 };

    let totalProgress = 0;
    let completedProgress = 0;

    currentTasks.forEach(task => {
      if (task.subtasks && task.subtasks.length > 0) {
        // For tasks with subtasks, each subtask contributes to the task's completion
        const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
        const taskProgress = completedSubtasks / task.subtasks.length;
        
        totalProgress += 1;
        completedProgress += taskProgress;
      } else {
        // For simple tasks, it's either 0 or 1
        totalProgress += 1;
        completedProgress += task.completed ? 1 : 0;
      }
    });

    const percentage = totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0;
    
    return {
      completed: Math.round(completedProgress * 10) / 10, // Round to 1 decimal place
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
    // Reset all modal states when navigating dates
    setModalState('none');
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setModalState('none');
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };

  const getNextOrder = () => {
    const currentTasks = getCurrentDateTasks();
    return currentTasks.length > 0 ? Math.max(...currentTasks.map(t => t.order)) + 1 : 0;
  };

  // Simplified modal handlers
  const openSimpleTaskInput = () => {
    setModalState('simple');
  };

  const openComplexTaskForm = () => {
    setModalState('complex');
  };

  const openCalendarView = () => {
    setModalState('calendar');
  };

  const closeAllModals = () => {
    setModalState('none');
  };

  const addSimpleTask = (title: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      dateKey: getDateKey(currentDate),
      isComplex: false,
      order: getNextOrder(),
    };

    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);
    closeAllModals();
  };

  const addComplexTask = (taskData: {
    title: string;
    description: string;
    subtasks: Subtask[];
    startTime: Date | null;
    duration: number;
  }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description || undefined,
      completed: false,
      dateKey: getDateKey(currentDate),
      subtasks: taskData.subtasks,
      startTime: taskData.startTime || undefined,
      duration: taskData.duration || undefined,
      isComplex: true,
      order: getNextOrder(),
    };

    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);
    setModalState('none');
  };

  const handleDateSelect = (selectedDate: Date) => {
    setCurrentDate(selectedDate);
    closeAllModals();
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
          const newCompleted = !task.completed;
          
          // If the task has subtasks, mark all subtasks as completed/uncompleted
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
          
          // Check if all subtasks are completed to mark the main task as completed
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
    // Update the order of tasks based on their new positions
    const updatedTasks = data.map((task, index) => ({
      ...task,
      order: index
    }));

    // Update the tasks state with reordered tasks
    const otherDateTasks = tasks.filter(task => task.dateKey !== getDateKey(currentDate));
    const allUpdatedTasks = [...otherDateTasks, ...updatedTasks];
    saveTasks(allUpdatedTasks);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const currentDateTasks = getCurrentDateTasks();
  const progress = calculateProgress();

  const renderTaskItem = ({ item, drag, isActive }: RenderItemParams<Task>) => (
    <TaskCard
      task={item}
      onToggle={() => toggleTask(item.id)}
      onToggleSubtask={(subtaskId) => toggleSubtask(item.id, subtaskId)}
      onDelete={() => deleteTask(item.id)}
      formatTime={formatTime}
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
              onPress={openCalendarView}
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

          {/* Go to Today Button - Only show when not on today */}
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

          {/* Enhanced Progress Card */}
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
        {/* Add Task Section */}
        <View style={styles.addSection}>
          <View style={styles.addButtonsContainer}>
            <TouchableOpacity
              style={[styles.complexTaskButton, { backgroundColor: '#8B5CF6' }]}
              onPress={openComplexTaskForm}
              activeOpacity={0.8}
            >
              <Target size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.complexTaskButtonText}>Complex Task</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.simpleTaskButton, { backgroundColor: colors.primary }]}
              onPress={openSimpleTaskInput}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.simpleTaskButtonText}>Simple Task</Text>
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

      {/* Simple Task Input Modal */}
      <Modal
        visible={modalState === 'simple'}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeAllModals}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Simple Task</Text>
            <TouchableOpacity style={[styles.modalCloseButton, { backgroundColor: colors.card }]} onPress={closeAllModals} activeOpacity={0.7}>
              <X size={20} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <SimpleTaskInput
              onSave={addSimpleTask}
              onCancel={closeAllModals}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Complex Task Form Modal - Fixed with proper key and state management */}
      <Modal
        key={`complex-modal-${modalState}`} // Add key to force re-render
        visible={modalState === 'complex'}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeAllModals}
      >
        <ComplexTaskForm
          onSave={addComplexTask}
          onCancel={closeAllModals}
        />
      </Modal>

      {/* Calendar View Modal */}
      <Modal
        visible={modalState === 'calendar'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeAllModals}
      >
        <CalendarView
          selectedDate={currentDate}
          onDateSelect={handleDateSelect}
          onClose={closeAllModals}
        />
      </Modal>
    </SafeAreaView>
  );
}

function TaskCard({ 
  task, 
  onToggle, 
  onToggleSubtask, 
  onDelete, 
  formatTime,
  drag,
  isActive
}: { 
  task: Task; 
  onToggle: () => void; 
  onToggleSubtask: (subtaskId: string) => void;
  onDelete: () => void;
  formatTime: (date: Date) => string;
  drag: () => void;
  isActive: boolean;
}) {
  const completedSubtasks = task.subtasks?.filter(subtask => subtask.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  // Calculate task progress for display
  const getTaskProgress = () => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return task.completed ? 100 : 0;
    }
    return Math.round((completedSubtasks / totalSubtasks) * 100);
  };

  const taskProgress = getTaskProgress();

  return (
    <TouchableOpacity 
      style={[
        styles.taskCard,
        isActive && styles.taskCardDragging
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
            task.completed && styles.checkboxCompleted
          ]}>
            {task.completed && (
              <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
            )}
          </View>
        </View>

        <View style={styles.taskInfo}>
          <Text style={[
            styles.taskTitle,
            task.completed && styles.taskTitleCompleted
          ]}>
            {task.title}
          </Text>
          
          {task.description && (
            <Text style={styles.taskDescription}>{task.description}</Text>
          )}

          {/* Task Meta Info */}
          {(task.startTime || task.duration || task.isComplex) && (
            <View style={styles.taskMeta}>
              {task.startTime && (
                <View style={styles.metaItem}>
                  <Clock size={12} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.metaText}>{formatTime(task.startTime)}</Text>
                </View>
              )}
              
              {task.duration && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaText}>{task.duration}min</Text>
                </View>
              )}

              {task.isComplex && (
                <View style={styles.complexBadge}>
                  <Target size={10} color="#7C3AED" strokeWidth={2} />
                  <Text style={styles.complexBadgeText}>Complex</Text>
                </View>
              )}
            </View>
          )}

          {/* Subtasks with Progress */}
          {task.subtasks && task.subtasks.length > 0 && (
            <View style={styles.subtasksContainer}>
              <View style={styles.subtasksHeaderContainer}>
                <Text style={styles.subtasksHeader}>
                  Subtasks ({completedSubtasks}/{totalSubtasks})
                </Text>
                <View style={styles.subtaskProgressContainer}>
                  <Text style={styles.subtaskProgressText}>{taskProgress}%</Text>
                  <View style={styles.subtaskProgressBar}>
                    <View 
                      style={[
                        styles.subtaskProgressFill, 
                        { width: `${taskProgress}%` }
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
                    subtask.completed && styles.subtaskCheckboxCompleted
                  ]}>
                    {subtask.completed && (
                      <Check size={10} color="#FFFFFF" strokeWidth={2.5} />
                    )}
                  </View>
                  <Text style={[
                    styles.subtaskTitle,
                    subtask.completed && styles.subtaskTitleCompleted
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
  complexTaskButton: {
    flex: 1,
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  complexTaskButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  simpleTaskButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  simpleTaskButtonText: {
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
    paddingBottom: 100, // Add padding for tab bar
  },
  taskCard: {
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
  taskCardDragging: {
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
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
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
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
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
  subtaskCheckboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  subtaskTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
  },
  subtaskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  },
});