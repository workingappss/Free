import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { Target, Plus, ChevronRight, Calendar, Check, Trash2, CreditCard as Edit3, Clock, TrendingUp, Users, Percent } from 'lucide-react-native';
import GoalForm from '@/components/GoalForm';
import { useTheme } from '@/contexts/ThemeContext';
import { Goal } from '@/types/goal';

type ModalState = 'none' | 'create' | 'edit' | 'updateProgress' | 'updateEstimation';

const TIMEFRAME_COLORS = {
  weekly: '#EF4444',
  monthly: '#F59E0B',
  quarterly: '#8B5CF6',
  yearly: '#06B6D4',
  custom: '#6B7280',
};

const TIMEFRAME_LABELS = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  custom: 'Custom',
};

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [modalState, setModalState] = useState<ModalState>('none');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [progressUpdateGoal, setProgressUpdateGoal] = useState<Goal | null>(null);
  const [newProgressValue, setNewProgressValue] = useState('');
  const { colors } = useTheme();

  const today = new Date();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const openCreateModal = () => {
    setEditingGoal(null);
    setModalState('create');
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setModalState('edit');
  };

  const openProgressUpdateModal = (goal: Goal) => {
    setProgressUpdateGoal(goal);
    if (goal.type === 'quantifiable') {
      setNewProgressValue(goal.currentProgress?.toString() || '0');
      setModalState('updateProgress');
    } else {
      setNewProgressValue(goal.estimatedProgress?.toString() || '0');
      setModalState('updateEstimation');
    }
  };

  const closeModal = () => {
    setModalState('none');
    setEditingGoal(null);
    setProgressUpdateGoal(null);
    setNewProgressValue('');
  };

  const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    if (editingGoal) {
      // Update existing goal
      setGoals(prev => prev.map(goal => 
        goal.id === editingGoal.id 
          ? { ...goalData, id: editingGoal.id, createdAt: editingGoal.createdAt }
          : goal
      ));
    } else {
      // Create new goal
      const newGoal: Goal = {
        ...goalData,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      setGoals(prev => [...prev, newGoal]);
    }
    closeModal();
  };

  const handleDeleteGoal = (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setGoals(prev => prev.filter(goal => goal.id !== goalId))
        },
      ]
    );
  };

  const handleProgressUpdate = () => {
    if (!progressUpdateGoal) return;

    const newProgress = parseInt(newProgressValue, 10);
    if (isNaN(newProgress) || newProgress < 0) {
      Alert.alert('Error', 'Please enter a valid progress number');
      return;
    }

    if (modalState === 'updateProgress') {
      // Quantifiable goal progress update
      if (progressUpdateGoal.targetNumber && newProgress > progressUpdateGoal.targetNumber) {
        Alert.alert('Error', `Progress cannot exceed target of ${progressUpdateGoal.targetNumber}`);
        return;
      }

      setGoals(prev => prev.map(goal => {
        if (goal.id === progressUpdateGoal.id && goal.type === 'quantifiable' && goal.targetNumber) {
          return {
            ...goal,
            currentProgress: newProgress,
            isCompleted: newProgress >= goal.targetNumber
          };
        }
        return goal;
      }));
    } else if (modalState === 'updateEstimation') {
      // Non-quantifiable goal estimation update
      if (newProgress > 100) {
        Alert.alert('Error', 'Progress percentage cannot exceed 100%');
        return;
      }

      setGoals(prev => prev.map(goal => {
        if (goal.id === progressUpdateGoal.id && goal.type === 'non-quantifiable') {
          return {
            ...goal,
            estimatedProgress: newProgress,
            isCompleted: newProgress >= 100
          };
        }
        return goal;
      }));
    }

    closeModal();
  };

  // Group goals by timeframe
  const groupedGoals = goals.reduce((acc, goal) => {
    if (!acc[goal.timeframe]) {
      acc[goal.timeframe] = [];
    }
    acc[goal.timeframe].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);

  // Sort timeframes by priority
  const timeframeOrder = ['weekly', 'monthly', 'quarterly', 'yearly', 'custom'];
  const sortedTimeframes = timeframeOrder.filter(timeframe => groupedGoals[timeframe]?.length > 0);

  const getProgressSummary = () => {
    const activeGoals = goals.filter(goal => !goal.isCompleted);
    const completedGoals = goals.filter(goal => goal.isCompleted);
    
    return {
      completed: completedGoals.length,
      total: goals.length,
      percentage: goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0
    };
  };

  const progress = getProgressSummary();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Goals</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Track your progress</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={[styles.dateText, { color: colors.text }]}>{formatDate(today)}</Text>
            </View>
          </View>

          {/* Progress Summary */}
          {progress.total > 0 && (
            <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <View style={styles.progressHeader}>
                <View style={[styles.progressIconContainer, { backgroundColor: colors.success + '20' }]}>
                  <Target size={20} color={colors.success} strokeWidth={2} />
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

          {/* Quick Stats */}
          {goals.length > 0 && (
            <View style={styles.quickStats}>
              <View style={styles.quickStatItem}>
                <View style={[styles.quickStatIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Target size={16} color={colors.primary} strokeWidth={2} />
                </View>
                <Text style={[styles.quickStatValue, { color: colors.text }]}>{goals.length}</Text>
                <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Total Goals</Text>
              </View>
              
              <View style={styles.quickStatItem}>
                <View style={[styles.quickStatIcon, { backgroundColor: colors.success + '20' }]}>
                  <Check size={16} color={colors.success} strokeWidth={2} />
                </View>
                <Text style={[styles.quickStatValue, { color: colors.text }]}>{progress.completed}</Text>
                <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Completed</Text>
              </View>
              
              <View style={styles.quickStatItem}>
                <View style={[styles.quickStatIcon, { backgroundColor: colors.warning + '20' }]}>
                  <TrendingUp size={16} color={colors.warning} strokeWidth={2} />
                </View>
                <Text style={[styles.quickStatValue, { color: colors.text }]}>{progress.percentage}%</Text>
                <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Success Rate</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.card }]}>
              <Target size={32} color={colors.textTertiary} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No goals yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Create your first goal to start tracking your progress
            </Text>
            <TouchableOpacity 
              style={[styles.emptyActionButton, { backgroundColor: colors.primary }]}
              onPress={openCreateModal}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.emptyActionButtonText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Add Goal Button */}
            <View style={styles.addSection}>
              <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={openCreateModal}
                activeOpacity={0.8}
              >
                <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.addButtonText}>Create New Goal</Text>
              </TouchableOpacity>
            </View>

            {/* Goals grouped by timeframe */}
            {sortedTimeframes.map((timeframe) => {
              const timeframeGoals = groupedGoals[timeframe];
              const activeGoals = timeframeGoals.filter(goal => !goal.isCompleted);
              const completedGoals = timeframeGoals.filter(goal => goal.isCompleted);
              
              return (
                <View key={timeframe} style={styles.timeframeSection}>
                  <View style={styles.timeframeSectionHeader}>
                    <View style={styles.timeframeTitleContainer}>
                      <View style={[
                        styles.timeframeIndicator, 
                        { backgroundColor: TIMEFRAME_COLORS[timeframe as keyof typeof TIMEFRAME_COLORS] }
                      ]} />
                      <Text style={[styles.timeframeSectionTitle, { color: colors.text }]}>
                        {TIMEFRAME_LABELS[timeframe as keyof typeof TIMEFRAME_LABELS]} Goals
                      </Text>
                    </View>
                    <View style={[styles.timeframeBadge, { backgroundColor: colors.card }]}>
                      <Text style={[styles.timeframeBadgeText, { color: colors.textSecondary }]}>
                        {activeGoals.length} active
                      </Text>
                    </View>
                  </View>

                  {/* Active Goals */}
                  {activeGoals.map((goal) => (
                    <GoalCard 
                      key={goal.id} 
                      goal={goal} 
                      onEdit={() => openEditModal(goal)}
                      onDelete={() => handleDeleteGoal(goal.id)}
                      onUpdateProgress={() => openProgressUpdateModal(goal)}
                    />
                  ))}

                  {/* Completed Goals */}
                  {completedGoals.length > 0 && (
                    <>
                      <View style={styles.completedSectionHeader}>
                        <Text style={[styles.completedSectionTitle, { color: colors.textTertiary }]}>
                          Completed ({completedGoals.length})
                        </Text>
                      </View>
                      {completedGoals.map((goal) => (
                        <GoalCard 
                          key={goal.id} 
                          goal={goal} 
                          onEdit={() => openEditModal(goal)}
                          onDelete={() => handleDeleteGoal(goal.id)}
                          onUpdateProgress={() => openProgressUpdateModal(goal)}
                        />
                      ))}
                    </>
                  )}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Goal Form Modal */}
      <Modal
        visible={modalState === 'create' || modalState === 'edit'}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeModal}
      >
        <GoalForm
          goal={editingGoal}
          onSave={handleSaveGoal}
          onCancel={closeModal}
          isEditing={modalState === 'edit'}
        />
      </Modal>

      {/* Progress Update Modal */}
      <Modal
        visible={modalState === 'updateProgress' || modalState === 'updateEstimation'}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.progressUpdateContainer, { backgroundColor: colors.surface }]}>
            <View style={[styles.progressUpdateHeader, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.progressUpdateTitle, { color: colors.text }]}>
                {modalState === 'updateProgress' ? 'Update Progress' : 'Update Estimation'}
              </Text>
              <Text style={[styles.progressUpdateSubtitle, { color: colors.textSecondary }]}>
                {progressUpdateGoal?.title}
              </Text>
            </View>

            <View style={styles.progressUpdateContent}>
              <Text style={[styles.progressUpdateLabel, { color: colors.text }]}>
                {modalState === 'updateProgress' 
                  ? `Current Progress (${progressUpdateGoal?.unit || 'units'})`
                  : 'Estimated Progress (%)'
                }
              </Text>
              <TextInput
                style={[styles.progressUpdateInput, { backgroundColor: colors.card, borderColor: colors.borderLight, color: colors.text }]}
                value={newProgressValue}
                onChangeText={setNewProgressValue}
                keyboardType="numeric"
                placeholder={modalState === 'updateProgress' ? 'Enter progress' : 'Enter percentage (0-100)'}
                placeholderTextColor={colors.textTertiary}
                autoFocus
              />
              
              {modalState === 'updateProgress' && progressUpdateGoal?.targetNumber && (
                <Text style={[styles.progressUpdateTarget, { color: colors.textSecondary }]}>
                  Target: {progressUpdateGoal.targetNumber} {progressUpdateGoal.unit}
                </Text>
              )}
              
              {modalState === 'updateEstimation' && (
                <Text style={[styles.progressUpdateTarget, { color: colors.textSecondary }]}>
                  How much of this goal do you estimate is complete?
                </Text>
              )}
            </View>

            <View style={[styles.progressUpdateActions, { borderTopColor: colors.borderLight }]}>
              <TouchableOpacity
                style={[styles.progressUpdateCancelButton, { backgroundColor: colors.card }]}
                onPress={closeModal}
                activeOpacity={0.7}
              >
                <Text style={[styles.progressUpdateCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.progressUpdateSaveButton, { backgroundColor: colors.primary }]}
                onPress={handleProgressUpdate}
                activeOpacity={0.8}
              >
                <Text style={styles.progressUpdateSaveText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function GoalCard({ 
  goal, 
  onEdit, 
  onDelete, 
  onUpdateProgress 
}: { 
  goal: Goal; 
  onEdit: () => void;
  onDelete: () => void;
  onUpdateProgress: () => void;
}) {
  const { colors } = useTheme();

  const getProgressData = () => {
    if (goal.type === 'quantifiable' && goal.targetNumber && goal.currentProgress !== undefined) {
      const percentage = (goal.currentProgress / goal.targetNumber) * 100;
      return {
        current: goal.currentProgress,
        target: goal.targetNumber,
        percentage: Math.round(percentage),
        unit: goal.unit || '',
        showProgressBar: true
      };
    } else {
      // For non-quantifiable goals, show contributed hours and tasks
      return {
        contributedHours: goal.contributedHours || 0,
        contributedTasks: goal.contributedTasks || 0,
        estimatedProgress: goal.estimatedProgress || 0,
        showProgressBar: false
      };
    }
  };

  const progressData = getProgressData();

  const formatDeadline = (deadline: Date) => {
    return deadline.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntilDeadline = (deadline: Date) => {
    // Get current date at start of day (midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get deadline date at start of day (midnight)
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    
    // Calculate difference in milliseconds
    const diffTime = deadlineDate.getTime() - today.getTime();
    
    // Convert to days and round
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getDaysLeftDisplay = (deadline: Date) => {
    const daysLeft = getDaysUntilDeadline(deadline);
    
    if (daysLeft < 0) {
      const overdueDays = Math.abs(daysLeft);
      return {
        text: `${overdueDays} day${overdueDays === 1 ? '' : 's'} overdue`,
        color: '#DC2626', // Red for overdue
        bgColor: '#FEE2E2',
        urgent: true
      };
    } else if (daysLeft === 0) {
      return {
        text: 'Due today',
        color: '#D97706', // Orange for today
        bgColor: '#FEF3C7',
        urgent: true
      };
    } else if (daysLeft === 1) {
      return {
        text: '1 day left',
        color: '#D97706', // Orange for tomorrow
        bgColor: '#FEF3C7',
        urgent: true
      };
    } else if (daysLeft <= 7) {
      return {
        text: `${daysLeft} days left`,
        color: '#CA8A04', // Yellow for this week
        bgColor: '#FEF3C7',
        urgent: false
      };
    } else {
      return {
        text: `${daysLeft} days left`,
        color: '#6B7280', // Gray for future
        bgColor: '#F3F4F6',
        urgent: false
      };
    }
  };

  const timeframeColor = TIMEFRAME_COLORS[goal.timeframe as keyof typeof TIMEFRAME_COLORS];

  return (
    <View style={[styles.goalCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <View style={styles.goalHeader}>
        <View style={[styles.goalColorIndicator, { backgroundColor: goal.color }]} />
        <View style={styles.goalInfo}>
          <View style={styles.goalTitleContainer}>
            <Text style={[styles.goalTitle, goal.isCompleted && styles.completedText, { color: goal.isCompleted ? colors.textTertiary : colors.text }]}>
              {goal.title}
            </Text>
            <View style={[styles.goalTypeBadge, { backgroundColor: timeframeColor + '20' }]}>
              <Text style={[styles.goalTypeBadgeText, { color: timeframeColor }]}>
                {TIMEFRAME_LABELS[goal.timeframe as keyof typeof TIMEFRAME_LABELS]}
              </Text>
            </View>
          </View>
          {goal.description && (
            <Text style={[styles.goalDescription, { color: colors.textSecondary }]}>{goal.description}</Text>
          )}
        </View>
        <View style={styles.goalActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onEdit}
            activeOpacity={0.7}
          >
            <Edit3 size={16} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onDelete}
            activeOpacity={0.7}
          >
            <Trash2 size={16} color="#EF4444" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.goalProgress}>
        {progressData.showProgressBar ? (
          // Quantifiable Goal Progress
          <>
            <View style={styles.progressInfo}>
              <Text style={[styles.progressText, { color: colors.text }]}>
                {progressData.current} of {progressData.target} {progressData.unit}
              </Text>
              <Text style={[styles.progressPercentage, { color: colors.primary }]}>
                {progressData.percentage}%
              </Text>
            </View>
            
            <View style={[styles.progressBar, { backgroundColor: colors.borderLight }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(progressData.percentage, 100)}%`,
                    backgroundColor: goal.color 
                  }
                ]} 
              />
            </View>

            {/* Update Progress Button */}
            {!goal.isCompleted && (
              <TouchableOpacity
                style={[styles.updateProgressButton, { backgroundColor: colors.primaryLight, borderColor: colors.primary + '40' }]}
                onPress={onUpdateProgress}
                activeOpacity={0.7}
              >
                <TrendingUp size={14} color={colors.primary} strokeWidth={2} />
                <Text style={[styles.updateProgressButtonText, { color: colors.primary }]}>Update Progress</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          // Non-Quantifiable Goal Contributions and Estimation
          <>
            {/* Compact Contributions Row */}
            <View style={[styles.contributionsRow, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <View style={styles.contributionCompactItem}>
                <Clock size={12} color="#F59E0B" strokeWidth={2} />
                <Text style={[styles.contributionCompactValue, { color: colors.text }]}>
                  {progressData.contributedHours}h
                </Text>
              </View>

              <View style={[styles.contributionCompactDivider, { backgroundColor: colors.borderLight }]} />

              <View style={styles.contributionCompactItem}>
                <Check size={12} color="#10B981" strokeWidth={2} />
                <Text style={[styles.contributionCompactValue, { color: colors.text }]}>
                  {progressData.contributedTasks} tasks
                </Text>
              </View>
            </View>

            {/* Progress Estimation */}
            <View style={styles.estimationContainer}>
              <View style={styles.estimationHeader}>
                <Text style={[styles.estimationLabel, { color: colors.textSecondary }]}>Estimated Progress</Text>
                <Text style={[styles.estimationPercentage, { color: colors.primary }]}>
                  {progressData.estimatedProgress}%
                </Text>
              </View>
              
              <View style={[styles.progressBar, { backgroundColor: colors.borderLight }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min(progressData.estimatedProgress, 100)}%`,
                      backgroundColor: goal.color 
                    }
                  ]} 
                />
              </View>

              {/* Update Estimation Button */}
              {!goal.isCompleted && (
                <TouchableOpacity
                  style={[styles.updateEstimationButton, { backgroundColor: colors.primaryLight, borderColor: colors.primary + '40' }]}
                  onPress={onUpdateProgress}
                  activeOpacity={0.7}
                >
                  <Percent size={14} color={colors.primary} strokeWidth={2} />
                  <Text style={[styles.updateEstimationButtonText, { color: colors.primary }]}>Update Estimation</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>

      <View style={styles.goalFooter}>
        <View style={[styles.categoryBadge, { backgroundColor: goal.color + '20' }]}>
          <Text style={[styles.categoryText, { color: goal.color }]}>
            {goal.category}
          </Text>
        </View>
        
        {goal.deadline && (
          <View style={styles.dueDateContainer}>
            <Calendar size={12} color={colors.textTertiary} strokeWidth={2} />
            <Text style={[styles.dueDate, { color: colors.textTertiary }]}>{formatDeadline(goal.deadline)}</Text>
            {!goal.isCompleted && (() => {
              const daysLeftInfo = getDaysLeftDisplay(goal.deadline);
              return (
                <View style={[
                  styles.daysLeftContainer,
                  { backgroundColor: daysLeftInfo.bgColor }
                ]}>
                  <Clock size={10} color={daysLeftInfo.color} strokeWidth={2} />
                  <Text style={[
                    styles.daysLeftText,
                    { color: daysLeftInfo.color }
                  ]}>
                    {daysLeftInfo.text}
                  </Text>
                </View>
              );
            })()}
          </View>
        )}

        {goal.isCompleted && (
          <View style={styles.completedBadge}>
            <Check size={12} color="#10B981" strokeWidth={2} />
            <Text style={styles.completedBadgeText}>Completed</Text>
          </View>
        )}
      </View>
    </View>
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
  headerLeft: {
    flex: 1,
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
  headerRight: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
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
  addSection: {
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#6366F1',
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
    paddingVertical: 60,
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
  timeframeSection: {
    marginBottom: 32,
  },
  timeframeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeframeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeframeIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 12,
  },
  timeframeSectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  timeframeBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeframeBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  completedSectionHeader: {
    marginTop: 20,
    marginBottom: 12,
  },
  completedSectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalColorIndicator: {
    width: 3,
    height: 32,
    borderRadius: 2,
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  goalTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  goalTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  goalTypeBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    lineHeight: 18,
  },
  goalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
  },
  goalProgress: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  updateProgressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  updateProgressButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#4F46E5',
    marginLeft: 4,
  },
  // Compact Contributions Styles
  contributionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contributionCompactItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contributionCompactValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginLeft: 4,
  },
  contributionCompactDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
  },
  // Estimation Styles
  estimationContainer: {
    marginTop: 4,
  },
  estimationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  estimationLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  estimationPercentage: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#4F46E5',
  },
  updateEstimationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  updateEstimationButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#4F46E5',
    marginLeft: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDate: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  daysLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  daysLeftText: {
    fontSize: 9,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 2,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    marginLeft: 4,
  },
  // Progress Update Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressUpdateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  progressUpdateHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  progressUpdateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  progressUpdateSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  progressUpdateContent: {
    padding: 20,
  },
  progressUpdateLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  progressUpdateInput: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  progressUpdateTarget: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  progressUpdateActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  progressUpdateCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  progressUpdateCancelText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  progressUpdateSaveButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  progressUpdateSaveText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});